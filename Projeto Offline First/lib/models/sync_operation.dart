import 'dart:convert';
import 'package:uuid/uuid.dart';

class SyncOperation {
  final String id;
  final OperationType type;
  final String itemId;
  final Map<String, dynamic> data;
  final DateTime timestamp;
  final int retries;
  final SyncOperationStatus status;
  final String? error;

  SyncOperation({
    String? id,
    required this.type,
    required this.itemId,
    required this.data,
    DateTime? timestamp,
    this.retries = 0,
    this.status = SyncOperationStatus.pending,
    this.error,
  })  : id = id ?? const Uuid().v4(),
        timestamp = timestamp ?? DateTime.now();

  SyncOperation copyWith({
    OperationType? type,
    String? itemId,
    Map<String, dynamic>? data,
    DateTime? timestamp,
    int? retries,
    SyncOperationStatus? status,
    String? error,
  }) {
    return SyncOperation(
      id: id,
      type: type ?? this.type,
      itemId: itemId ?? this.itemId,
      data: data ?? this.data,
      timestamp: timestamp ?? this.timestamp,
      retries: retries ?? this.retries,
      status: status ?? this.status,
      error: error ?? this.error,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type.toString(),
      'itemId': itemId,
      'data': data,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'retries': retries,
      'status': status.toString(),
      'error': error,
    };
  }

  factory SyncOperation.fromMap(Map<String, dynamic> map) {
    return SyncOperation(
      id: map['id'],
      type: OperationType.values.firstWhere(
        (e) => e.toString() == map['type'],
      ),
      itemId: map['itemId'],
      data: map['data'] is Map<String, dynamic>
          ? map['data'] as Map<String, dynamic>
          : map['data'] is String
              ? jsonDecode(map['data']) as Map<String, dynamic>
              : {},
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp']),
      retries: map['retries'],
      status: SyncOperationStatus.values.firstWhere(
        (e) => e.toString() == map['status'],
      ),
      error: map['error'],
    );
  }
}

enum OperationType {
  create,
  update,
  delete,
}

enum SyncOperationStatus {
  pending,
  processing,
  completed,
  failed,
}

