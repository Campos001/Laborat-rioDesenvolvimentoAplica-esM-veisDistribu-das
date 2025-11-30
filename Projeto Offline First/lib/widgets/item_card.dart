import 'package:flutter/material.dart';
import '../models/shopping_item.dart';

/// Widget para exibir um item de compra em formato de card
class ItemCard extends StatelessWidget {
  final ShoppingItem item;
  final VoidCallback? onTogglePurchased;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const ItemCard({
    super.key,
    required this.item,
    this.onTogglePurchased,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: ListTile(
        leading: Checkbox(
          value: item.purchased,
          onChanged: onTogglePurchased != null ? (_) => onTogglePurchased!() : null,
        ),
        title: Text(
          item.name,
          style: TextStyle(
            decoration: item.purchased ? TextDecoration.lineThrough : null,
            color: item.purchased ? Colors.grey : Colors.black,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('Quantidade: ${item.quantity}'),
                const SizedBox(width: 8),
                Text('•'),
                const SizedBox(width: 8),
                Text(item.category),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                _buildSyncStatusBadge(item.syncStatus),
              ],
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (onEdit != null)
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: onEdit,
              ),
            if (onDelete != null)
              IconButton(
                icon: const Icon(Icons.delete),
                onPressed: onDelete,
                color: Colors.red,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncStatusBadge(SyncStatus status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: _getSyncStatusColor(status).withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            status.icon,
            style: const TextStyle(fontSize: 12),
          ),
          const SizedBox(width: 4),
          Text(
            status.label,
            style: TextStyle(
              fontSize: 10,
              color: _getSyncStatusColor(status),
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Color _getSyncStatusColor(SyncStatus status) {
    switch (status) {
      case SyncStatus.synced:
        return Colors.green;
      case SyncStatus.pending:
        return Colors.orange;
      case SyncStatus.conflict:
        return Colors.red;
      case SyncStatus.error:
        return Colors.red;
    }
  }
}

