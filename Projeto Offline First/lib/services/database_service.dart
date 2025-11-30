import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/shopping_item.dart';
import '../models/sync_operation.dart';

class DatabaseService {
  static final DatabaseService instance = DatabaseService._init();

  static Database? _database;

  DatabaseService._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('shopping_list_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Tabela de itens de compras
    await db.execute('''
      CREATE TABLE shopping_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        category TEXT NOT NULL,
        purchased INTEGER NOT NULL DEFAULT 0,
        userId TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        syncStatus TEXT NOT NULL,
        localUpdatedAt INTEGER
      )
    ''');

    // Tabela de fila de sincronização
    await db.execute('''
      CREATE TABLE sync_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        itemId TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retries INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        error TEXT
      )
    ''');

    // Tabela de metadados
    await db.execute('''
      CREATE TABLE metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    ''');

    // Índices
    await db.execute('CREATE INDEX idx_items_userId ON shopping_items(userId)');
    await db.execute('CREATE INDEX idx_items_syncStatus ON shopping_items(syncStatus)');
    await db.execute('CREATE INDEX idx_sync_queue_status ON sync_queue(status)');

    print('✅ Banco de dados criado com sucesso');
  }

  // ==================== OPERAÇÕES DE ITENS ====================

  Future<ShoppingItem> upsertItem(ShoppingItem item) async {
    final db = await database;
    await db.insert(
      'shopping_items',
      item.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    return item;
  }

  Future<ShoppingItem?> getItem(String id) async {
    final db = await database;
    final maps = await db.query(
      'shopping_items',
      where: 'id = ?',
      whereArgs: [id],
    );
    if (maps.isEmpty) return null;
    return ShoppingItem.fromMap(maps.first);
  }

  Future<List<ShoppingItem>> getAllItems({String userId = 'user1'}) async {
    final db = await database;
    final maps = await db.query(
      'shopping_items',
      where: 'userId = ?',
      whereArgs: [userId],
      orderBy: 'createdAt DESC',
    );
    return maps.map((map) => ShoppingItem.fromMap(map)).toList();
  }

  Future<List<ShoppingItem>> getUnsyncedItems() async {
    final db = await database;
    final maps = await db.query(
      'shopping_items',
      where: 'syncStatus = ?',
      whereArgs: [SyncStatus.pending.toString()],
    );
    return maps.map((map) => ShoppingItem.fromMap(map)).toList();
  }

  Future<int> deleteItem(String id) async {
    final db = await database;
    return await db.delete(
      'shopping_items',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> updateSyncStatus(String id, SyncStatus status) async {
    final db = await database;
    await db.update(
      'shopping_items',
      {'syncStatus': status.toString()},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ==================== FILA DE SINCRONIZAÇÃO ====================

  Future<SyncOperation> addToSyncQueue(SyncOperation operation) async {
    final db = await database;
    final map = operation.toMap();
    map['data'] = jsonEncode(map['data']);
    await db.insert(
      'sync_queue',
      map,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    return operation;
  }

  Future<List<SyncOperation>> getPendingSyncOperations() async {
    final db = await database;
    final maps = await db.query(
      'sync_queue',
      where: 'status = ?',
      whereArgs: [SyncOperationStatus.pending.toString()],
      orderBy: 'timestamp ASC',
    );
    return maps.map((map) {
      final data = map['data'];
      if (data is String) {
        map['data'] = jsonDecode(data);
      }
      return SyncOperation.fromMap(map);
    }).toList();
  }

  Future<void> updateSyncOperation(SyncOperation operation) async {
    final db = await database;
    final map = operation.toMap();
    map['data'] = jsonEncode(map['data']);
    await db.update(
      'sync_queue',
      map,
      where: 'id = ?',
      whereArgs: [operation.id],
    );
  }

  Future<int> removeSyncOperation(String id) async {
    final db = await database;
    return await db.delete(
      'sync_queue',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ==================== METADADOS ====================

  Future<void> setMetadata(String key, String value) async {
    final db = await database;
    await db.insert(
      'metadata',
      {'key': key, 'value': value},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<String?> getMetadata(String key) async {
    final db = await database;
    final maps = await db.query(
      'metadata',
      where: 'key = ?',
      whereArgs: [key],
    );
    if (maps.isEmpty) return null;
    return maps.first['value'] as String;
  }

  // ==================== ESTATÍSTICAS ====================

  Future<Map<String, dynamic>> getStats() async {
    final db = await database;

    final totalItems = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM shopping_items')
    ) ?? 0;

    final unsyncedItems = Sqflite.firstIntValue(
      await db.rawQuery(
        'SELECT COUNT(*) FROM shopping_items WHERE syncStatus = ?',
        [SyncStatus.pending.toString()]
      )
    ) ?? 0;

    final queuedOperations = Sqflite.firstIntValue(
      await db.rawQuery(
        'SELECT COUNT(*) FROM sync_queue WHERE status = ?',
        [SyncOperationStatus.pending.toString()]
      )
    ) ?? 0;

    final lastSync = await getMetadata('lastSyncTimestamp');

    return {
      'totalItems': totalItems,
      'unsyncedItems': unsyncedItems,
      'queuedOperations': queuedOperations,
      'lastSync': lastSync != null ? int.parse(lastSync) : null,
    };
  }

  Future<void> clearAllData() async {
    final db = await database;
    await db.delete('shopping_items');
    await db.delete('sync_queue');
    await db.delete('metadata');
    print('🗑️ Todos os dados foram limpos');
  }

  Future<void> close() async {
    final db = await database;
    await db.close();
  }
}

