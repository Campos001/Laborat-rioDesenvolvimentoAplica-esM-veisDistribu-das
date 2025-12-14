import 'package:uuid/uuid.dart';

class ShoppingItem {
  final String id;
  final String name;
  final int quantity;
  final String category;
  final bool purchased;
  final String userId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int version;

  // Campos de sincronização
  final SyncStatus syncStatus;
  final DateTime? localUpdatedAt;
  
  // URL da imagem no S3 LocalStack
  final String? imageUrl;

  ShoppingItem({
    String? id,
    required this.name,
    this.quantity = 1,
    this.category = 'geral',
    this.purchased = false,
    this.userId = 'user1',
    DateTime? createdAt,
    DateTime? updatedAt,
    this.version = 1,
    this.syncStatus = SyncStatus.synced,
    this.localUpdatedAt,
    this.imageUrl,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  ShoppingItem copyWith({
    String? name,
    int? quantity,
    String? category,
    bool? purchased,
    DateTime? updatedAt,
    int? version,
    SyncStatus? syncStatus,
    DateTime? localUpdatedAt,
    String? imageUrl,
  }) {
    return ShoppingItem(
      id: id,
      name: name ?? this.name,
      quantity: quantity ?? this.quantity,
      category: category ?? this.category,
      purchased: purchased ?? this.purchased,
      userId: userId,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      version: version ?? this.version,
      syncStatus: syncStatus ?? this.syncStatus,
      localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'quantity': quantity,
      'category': category,
      'purchased': purchased ? 1 : 0,
      'userId': userId,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'updatedAt': updatedAt.millisecondsSinceEpoch,
      'version': version,
      'syncStatus': syncStatus.toString(),
      'localUpdatedAt': localUpdatedAt?.millisecondsSinceEpoch,
      'imageUrl': imageUrl,
    };
  }

  factory ShoppingItem.fromMap(Map<String, dynamic> map) {
    return ShoppingItem(
      id: map['id'],
      name: map['name'],
      quantity: map['quantity'],
      category: map['category'],
      purchased: map['purchased'] == 1,
      userId: map['userId'],
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt']),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updatedAt']),
      version: map['version'],
      syncStatus: SyncStatus.values.firstWhere(
        (e) => e.toString() == map['syncStatus'],
        orElse: () => SyncStatus.synced,
      ),
      localUpdatedAt: map['localUpdatedAt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['localUpdatedAt'])
          : null,
      imageUrl: map['imageUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'quantity': quantity,
      'category': category,
      'purchased': purchased,
      'userId': userId,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'updatedAt': updatedAt.millisecondsSinceEpoch,
      'version': version,
      'imageUrl': imageUrl,
    };
  }

  factory ShoppingItem.fromJson(Map<String, dynamic> json) {
    return ShoppingItem(
      id: json['id'],
      name: json['name'],
      quantity: json['quantity'] ?? 1,
      category: json['category'] ?? 'geral',
      purchased: json['purchased'] ?? false,
      userId: json['userId'] ?? json['user_id'] ?? 'user1',
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['createdAt']),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updatedAt']),
      version: json['version'] ?? 1,
      syncStatus: SyncStatus.synced,
      imageUrl: json['imageUrl'],
    );
  }
}

enum SyncStatus {
  synced,
  pending,
  conflict,
  error,
}

extension SyncStatusExtension on SyncStatus {
  String get icon {
    switch (this) {
      case SyncStatus.synced:
        return '✓';
      case SyncStatus.pending:
        return '☁️';
      case SyncStatus.conflict:
        return '⚠️';
      case SyncStatus.error:
        return '✗';
    }
  }

  String get label {
    switch (this) {
      case SyncStatus.synced:
        return 'Sincronizado';
      case SyncStatus.pending:
        return 'Pendente';
      case SyncStatus.conflict:
        return 'Conflito';
      case SyncStatus.error:
        return 'Erro';
    }
  }
}

