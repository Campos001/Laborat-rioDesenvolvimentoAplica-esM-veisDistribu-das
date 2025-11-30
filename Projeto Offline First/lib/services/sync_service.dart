import 'dart:async';
import '../models/shopping_item.dart';
import '../models/sync_operation.dart';
import 'database_service.dart';
import 'api_service.dart';
import 'connectivity_service.dart';

/// Motor de Sincronização Offline-First
/// 
/// Implementa sincronização simples usando estratégia Last-Write-Wins (LWW)
class SyncService {
  final DatabaseService _db = DatabaseService.instance;
  final ApiService _api;
  final ConnectivityService _connectivity = ConnectivityService.instance;
  
  bool _isSyncing = false;
  Timer? _autoSyncTimer;
  
  final _syncStatusController = StreamController<SyncEvent>.broadcast();
  Stream<SyncEvent> get syncStatusStream => _syncStatusController.stream;

  SyncService({String userId = 'user1'}) : _api = ApiService(userId: userId);

  // ==================== SINCRONIZAÇÃO PRINCIPAL ====================

  /// Executar sincronização completa
  Future<SyncResult> sync() async {
    if (_isSyncing) {
      print('⏳ Sincronização já em andamento');
      return SyncResult(
        success: false,
        message: 'Sincronização já em andamento',
      );
    }

    if (!_connectivity.isOnline) {
      print('📴 Sem conectividade - operações enfileiradas');
      return SyncResult(
        success: false,
        message: 'Sem conexão com internet',
      );
    }

    _isSyncing = true;
    _notifyStatus(SyncEvent.syncStarted());

    try {
      print('🔄 Iniciando sincronização...');
      
      // 1. Push: Enviar operações pendentes
      final pushResult = await _pushPendingOperations();
      
      // 2. Pull: Buscar atualizações do servidor
      final pullResult = await _pullFromServer();
      
      // 3. Atualizar timestamp de última sync
      await _db.setMetadata(
        'lastSyncTimestamp',
        DateTime.now().millisecondsSinceEpoch.toString(),
      );
      
      print('✅ Sincronização concluída');
      _notifyStatus(SyncEvent.syncCompleted(
        pushedCount: pushResult,
        pulledCount: pullResult,
      ));
      
      return SyncResult(
        success: true,
        message: 'Sincronização concluída com sucesso',
        pushedOperations: pushResult,
        pulledItems: pullResult,
      );
      
    } catch (e) {
      print('❌ Erro na sincronização: $e');
      _notifyStatus(SyncEvent.syncError(e.toString()));
      
      return SyncResult(
        success: false,
        message: 'Erro na sincronização: $e',
      );
    } finally {
      _isSyncing = false;
    }
  }

  // ==================== PUSH (Cliente → Servidor) ====================

  /// Enviar operações pendentes para o servidor
  Future<int> _pushPendingOperations() async {
    final operations = await _db.getPendingSyncOperations();
    print('📤 Enviando ${operations.length} operações pendentes');
    
    int successCount = 0;

    for (final operation in operations) {
      try {
        await _processOperation(operation);
        await _db.removeSyncOperation(operation.id);
        successCount++;
      } catch (e) {
        print('❌ Erro ao processar operação ${operation.id}: $e');
        
        // Incrementar tentativas
        await _db.updateSyncOperation(
          operation.copyWith(
            retries: operation.retries + 1,
            error: e.toString(),
          ),
        );
        
        // Se excedeu máximo de tentativas, marcar como failed
        if (operation.retries >= 3) {
          await _db.updateSyncOperation(
            operation.copyWith(status: SyncOperationStatus.failed),
          );
        }
      }
    }

    return successCount;
  }

  /// Processar operação individual
  Future<void> _processOperation(SyncOperation operation) async {
    switch (operation.type) {
      case OperationType.create:
        await _pushCreate(operation);
        break;
      case OperationType.update:
        await _pushUpdate(operation);
        break;
      case OperationType.delete:
        await _pushDelete(operation);
        break;
    }
  }

  Future<void> _pushCreate(SyncOperation operation) async {
    final item = await _db.getItem(operation.itemId);
    if (item == null) return;

    final serverItem = await _api.createItem(item);
    
    // Atualizar item local com dados do servidor
    await _db.upsertItem(
      item.copyWith(
        version: serverItem.version,
        updatedAt: serverItem.updatedAt,
        syncStatus: SyncStatus.synced,
      ),
    );
  }

  Future<void> _pushUpdate(SyncOperation operation) async {
    final item = await _db.getItem(operation.itemId);
    if (item == null) return;

    final result = await _api.updateItem(item);
    
    if (result['conflict'] == true) {
      // Conflito detectado - aplicar Last-Write-Wins
      final serverItem = result['serverItem'] as ShoppingItem;
      await _resolveConflict(item, serverItem);
    } else {
      // Sucesso - atualizar local
      final updatedItem = result['item'] as ShoppingItem;
      await _db.upsertItem(
        item.copyWith(
          version: updatedItem.version,
          updatedAt: updatedItem.updatedAt,
          syncStatus: SyncStatus.synced,
        ),
      );
    }
  }

  Future<void> _pushDelete(SyncOperation operation) async {
    final item = await _db.getItem(operation.itemId);
    final version = item?.version ?? 1;

    await _api.deleteItem(operation.itemId, version);
    await _db.deleteItem(operation.itemId);
  }

  // ==================== PULL (Servidor → Cliente) ====================

  /// Buscar atualizações do servidor
  Future<int> _pullFromServer() async {
    final lastSyncStr = await _db.getMetadata('lastSyncTimestamp');
    final lastSync = lastSyncStr != null ? int.parse(lastSyncStr) : null;
    
    final result = await _api.getItems(modifiedSince: lastSync);
    final serverItems = result['items'] as List<ShoppingItem>;
    
    print('📥 Recebidas ${serverItems.length} itens do servidor');

    for (final serverItem in serverItems) {
      final localItem = await _db.getItem(serverItem.id);
      
      if (localItem == null) {
        // Novo item do servidor
        await _db.upsertItem(
          serverItem.copyWith(syncStatus: SyncStatus.synced),
        );
      } else if (localItem.syncStatus == SyncStatus.synced) {
        // Atualização do servidor (sem modificações locais)
        await _db.upsertItem(
          serverItem.copyWith(syncStatus: SyncStatus.synced),
        );
      } else {
        // Possível conflito - resolver
        await _resolveConflict(localItem, serverItem);
      }
    }

    return serverItems.length;
  }

  // ==================== RESOLUÇÃO DE CONFLITOS (LWW) ====================

  /// Resolver conflito usando Last-Write-Wins
  Future<void> _resolveConflict(ShoppingItem localItem, ShoppingItem serverItem) async {
    print('⚠️ Conflito detectado: ${localItem.id}');
    
    final localTime = localItem.localUpdatedAt ?? localItem.updatedAt;
    final serverTime = serverItem.updatedAt;

    ShoppingItem winningItem;
    String reason;

    if (localTime.isAfter(serverTime)) {
      // Versão local vence
      winningItem = localItem;
      reason = 'Modificação local é mais recente';
      print('🏆 LWW: Versão local vence');
      
      // Enviar versão local para servidor
      await _api.updateItem(localItem);
    } else {
      // Versão servidor vence
      winningItem = serverItem;
      reason = 'Modificação do servidor é mais recente';
      print('🏆 LWW: Versão servidor vence');
    }

    // Atualizar banco local com versão vencedora
    await _db.upsertItem(
      winningItem.copyWith(syncStatus: SyncStatus.synced),
    );

    _notifyStatus(SyncEvent.conflictResolved(
      itemId: localItem.id,
      resolution: reason,
    ));
  }

  // ==================== OPERAÇÕES COM FILA ====================

  /// Criar item (com suporte offline)
  Future<ShoppingItem> createItem(ShoppingItem item) async {
    // Salvar localmente
    final savedItem = await _db.upsertItem(
      item.copyWith(
        syncStatus: SyncStatus.pending,
        localUpdatedAt: DateTime.now(),
      ),
    );

    // Adicionar à fila de sincronização
    await _db.addToSyncQueue(
      SyncOperation(
        type: OperationType.create,
        itemId: savedItem.id,
        data: savedItem.toMap(),
      ),
    );

    // Tentar sincronizar imediatamente se online
    if (_connectivity.isOnline) {
      sync();
    }

    return savedItem;
  }

  /// Atualizar item (com suporte offline)
  Future<ShoppingItem> updateItem(ShoppingItem item) async {
    // Salvar localmente
    final updatedItem = await _db.upsertItem(
      item.copyWith(
        syncStatus: SyncStatus.pending,
        localUpdatedAt: DateTime.now(),
      ),
    );

    // Adicionar à fila de sincronização
    await _db.addToSyncQueue(
      SyncOperation(
        type: OperationType.update,
        itemId: updatedItem.id,
        data: updatedItem.toMap(),
      ),
    );

    // Tentar sincronizar imediatamente se online
    if (_connectivity.isOnline) {
      sync();
    }

    return updatedItem;
  }

  /// Deletar item (com suporte offline)
  Future<void> deleteItem(String itemId) async {
    final item = await _db.getItem(itemId);
    if (item == null) return;

    // Adicionar à fila de sincronização antes de deletar
    await _db.addToSyncQueue(
      SyncOperation(
        type: OperationType.delete,
        itemId: itemId,
        data: {'version': item.version},
      ),
    );

    // Deletar localmente
    await _db.deleteItem(itemId);

    // Tentar sincronizar imediatamente se online
    if (_connectivity.isOnline) {
      sync();
    }
  }

  // ==================== SINCRONIZAÇÃO AUTOMÁTICA ====================

  /// Iniciar sincronização automática
  void startAutoSync({Duration interval = const Duration(seconds: 30)}) {
    stopAutoSync(); // Parar timer anterior se existir

    _autoSyncTimer = Timer.periodic(interval, (timer) {
      if (_connectivity.isOnline && !_isSyncing) {
        print('🔄 Auto-sync iniciado');
        sync();
      }
    });

    print('✅ Auto-sync configurado (intervalo: ${interval.inSeconds}s)');
  }

  /// Parar sincronização automática
  void stopAutoSync() {
    _autoSyncTimer?.cancel();
    _autoSyncTimer = null;
  }

  // ==================== NOTIFICAÇÕES ====================

  void _notifyStatus(SyncEvent event) {
    _syncStatusController.add(event);
  }

  // ==================== ESTATÍSTICAS ====================

  Future<SyncStats> getStats() async {
    final dbStats = await _db.getStats();
    final lastSyncStr = await _db.getMetadata('lastSyncTimestamp');
    final lastSync = lastSyncStr != null
        ? DateTime.fromMillisecondsSinceEpoch(int.parse(lastSyncStr))
        : null;

    return SyncStats(
      totalItems: dbStats['totalItems'],
      unsyncedItems: dbStats['unsyncedItems'],
      queuedOperations: dbStats['queuedOperations'],
      lastSync: lastSync,
      isOnline: _connectivity.isOnline,
      isSyncing: _isSyncing,
    );
  }

  // ==================== LIMPEZA ====================

  void dispose() {
    stopAutoSync();
    _syncStatusController.close();
  }
}

// ==================== MODELOS DE SUPORTE ====================

/// Resultado de sincronização
class SyncResult {
  final bool success;
  final String message;
  final int? pushedOperations;
  final int? pulledItems;

  SyncResult({
    required this.success,
    required this.message,
    this.pushedOperations,
    this.pulledItems,
  });
}

/// Evento de sincronização
class SyncEvent {
  final SyncEventType type;
  final String? message;
  final Map<String, dynamic>? data;

  SyncEvent({
    required this.type,
    this.message,
    this.data,
  });

  factory SyncEvent.syncStarted() => SyncEvent(type: SyncEventType.started);
  
  factory SyncEvent.syncCompleted({int? pushedCount, int? pulledCount}) =>
      SyncEvent(
        type: SyncEventType.completed,
        data: {'pushed': pushedCount, 'pulled': pulledCount},
      );
  
  factory SyncEvent.syncError(String error) => SyncEvent(
        type: SyncEventType.error,
        message: error,
      );
  
  factory SyncEvent.conflictResolved({
    required String itemId,
    required String resolution,
  }) =>
      SyncEvent(
        type: SyncEventType.conflictResolved,
        message: resolution,
        data: {'itemId': itemId},
      );
}

enum SyncEventType {
  started,
  completed,
  error,
  conflictResolved,
}

/// Estatísticas de sincronização
class SyncStats {
  final int totalItems;
  final int unsyncedItems;
  final int queuedOperations;
  final DateTime? lastSync;
  final bool isOnline;
  final bool isSyncing;

  SyncStats({
    required this.totalItems,
    required this.unsyncedItems,
    required this.queuedOperations,
    this.lastSync,
    required this.isOnline,
    required this.isSyncing,
  });
}

