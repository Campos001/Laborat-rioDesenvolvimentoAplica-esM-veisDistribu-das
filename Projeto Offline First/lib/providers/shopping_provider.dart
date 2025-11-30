import 'package:flutter/foundation.dart';
import '../models/shopping_item.dart';
import '../services/database_service.dart';
import '../services/sync_service.dart';

/// Provider para gerenciamento de estado de itens de compras
class ShoppingProvider with ChangeNotifier {
  final DatabaseService _db = DatabaseService.instance;
  final SyncService _syncService;

  List<ShoppingItem> _items = [];
  bool _isLoading = false;
  String? _error;

  ShoppingProvider({String userId = 'user1'})
      : _syncService = SyncService(userId: userId);

  // Getters
  List<ShoppingItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  List<ShoppingItem> get purchasedItems =>
      _items.where((item) => item.purchased).toList();
  
  List<ShoppingItem> get pendingItems =>
      _items.where((item) => !item.purchased).toList();
  
  List<ShoppingItem> get unsyncedItems =>
      _items.where((item) => item.syncStatus == SyncStatus.pending).toList();

  // ==================== INICIALIZAÇÃO ====================

  Future<void> initialize() async {
    await loadItems();
    
    // Iniciar auto-sync
    _syncService.startAutoSync();
    
    // Escutar eventos de sincronização
    _syncService.syncStatusStream.listen((event) {
      if (event.type == SyncEventType.completed) {
        loadItems(); // Recarregar itens após sync
      }
    });
  }

  // ==================== OPERAÇÕES DE ITENS ====================

  /// Carregar todas as itens
  Future<void> loadItems() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _items = await _db.getAllItems();
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Criar novo item
  Future<void> createItem({
    required String name,
    int quantity = 1,
    String category = 'geral',
  }) async {
    try {
      final item = ShoppingItem(
        name: name,
        quantity: quantity,
        category: category,
      );

      await _syncService.createItem(item);
      await loadItems();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Atualizar item
  Future<void> updateItem(ShoppingItem item) async {
    try {
      await _syncService.updateItem(item);
      await loadItems();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Alternar status de compra
  Future<void> togglePurchased(ShoppingItem item) async {
    await updateItem(item.copyWith(purchased: !item.purchased));
  }

  /// Deletar item
  Future<void> deleteItem(String itemId) async {
    try {
      await _syncService.deleteItem(itemId);
      await loadItems();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // ==================== SINCRONIZAÇÃO ====================

  /// Sincronizar manualmente
  Future<SyncResult> sync() async {
    final result = await _syncService.sync();
    await loadItems();
    return result;
  }

  /// Obter estatísticas de sincronização
  Future<SyncStats> getSyncStats() async {
    return await _syncService.getStats();
  }

  // ==================== LIMPEZA ====================

  @override
  void dispose() {
    _syncService.dispose();
    super.dispose();
  }
}

