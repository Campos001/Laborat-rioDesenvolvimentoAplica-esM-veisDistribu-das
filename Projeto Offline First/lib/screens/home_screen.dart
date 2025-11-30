import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/shopping_provider.dart';
import '../models/shopping_item.dart';
import '../services/connectivity_service.dart';
import 'item_form_screen.dart';
import 'sync_status_screen.dart';
import '../widgets/item_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _connectivity = ConnectivityService.instance;
  bool _isOnline = true;

  @override
  void initState() {
    super.initState();
    _initializeConnectivity();
  }

  Future<void> _initializeConnectivity() async {
    await _connectivity.initialize();
    setState(() => _isOnline = _connectivity.isOnline);
    
    // Escutar mudanças de conectividade
    _connectivity.connectivityStream.listen((isOnline) {
      setState(() => _isOnline = isOnline);
      
      if (isOnline) {
        _showSnackBar('🟢 Conectado - Sincronizando...', Colors.green);
        context.read<ShoppingProvider>().sync();
      } else {
        _showSnackBar('🔴 Modo Offline', Colors.orange);
      }
    });
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lista de Compras Offline-First'),
        actions: [
          // Indicador de conectividade
          _buildConnectivityIndicator(),
          
          // Botão de sincronização manual
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: _isOnline ? _handleManualSync : null,
            tooltip: 'Sincronizar',
          ),
          
          // Botão de estatísticas
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () => _navigateToSyncStatus(),
            tooltip: 'Status de Sincronização',
          ),
        ],
      ),
      body: Consumer<ShoppingProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Erro: ${provider.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.loadItems(),
                    child: const Text('Tentar Novamente'),
                  ),
                ],
              ),
            );
          }

          final items = provider.items;

          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.shopping_cart_outlined,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Sua lista está vazia!',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Toque em + para adicionar itens',
                    style: TextStyle(color: Colors.grey[500]),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.sync(),
            child: ListView.builder(
              itemCount: items.length,
              padding: const EdgeInsets.all(8),
              itemBuilder: (context, index) {
                final item = items[index];
                return ItemCard(
                  item: item,
                  onTogglePurchased: () => provider.togglePurchased(item),
                  onEdit: () => _navigateToItemForm(item: item),
                  onDelete: () => _confirmDelete(item, provider),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToItemForm,
        child: const Icon(Icons.add),
        tooltip: 'Novo Item',
      ),
    );
  }

  Widget _buildConnectivityIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Center(
        child: Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _isOnline ? Colors.green : Colors.red,
          ),
        ),
      ),
    );
  }

  Future<void> _handleManualSync() async {
    final provider = context.read<ShoppingProvider>();
    
    _showSnackBar('🔄 Sincronizando...', Colors.blue);
    
    final result = await provider.sync();
    
    if (result.success) {
      _showSnackBar(
        '✅ Sincronização concluída',
        Colors.green,
      );
    } else {
      _showSnackBar(
        '❌ Erro na sincronização: ${result.message}',
        Colors.red,
      );
    }
  }

  void _navigateToItemForm({ShoppingItem? item}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ItemFormScreen(item: item),
      ),
    );
  }

  void _navigateToSyncStatus() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const SyncStatusScreen(),
      ),
    );
  }

  Future<void> _confirmDelete(ShoppingItem item, ShoppingProvider provider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar exclusão'),
        content: Text('Deseja deletar "${item.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Deletar'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await provider.deleteItem(item.id);
      if (mounted) {
        _showSnackBar('🗑️ Item deletado', Colors.grey);
      }
    }
  }
}

