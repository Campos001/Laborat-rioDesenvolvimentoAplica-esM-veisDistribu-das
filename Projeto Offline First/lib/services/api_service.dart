import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/shopping_item.dart';

/// Serviço de comunicação com API REST do servidor
class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // static const String baseUrl = 'http://localhost:3000/api'; // iOS simulator
  
  final String userId;

  ApiService({this.userId = 'user1'});

  // ==================== OPERAÇÕES DE ITENS ====================

  /// Buscar todas as itens (com sync incremental)
  Future<Map<String, dynamic>> getItems({int? modifiedSince}) async {
    try {
      final uri = Uri.parse('$baseUrl/items').replace(
        queryParameters: {
          'userId': userId,
          if (modifiedSince != null) 'modifiedSince': modifiedSince.toString(),
        },
      );

      final response = await http.get(uri).timeout(
        const Duration(seconds: 10),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'items': (data['items'] as List)
              .map((json) => ShoppingItem.fromJson(json))
              .toList(),
          'lastSync': data['lastSync'],
          'serverTime': data['serverTime'],
        };
      } else {
        throw Exception('Erro ao buscar itens: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Erro na requisição getItems: $e');
      rethrow;
    }
  }

  /// Criar item no servidor
  Future<ShoppingItem> createItem(ShoppingItem item) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/items'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(item.toJson()),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return ShoppingItem.fromJson(data['item']);
      } else {
        throw Exception('Erro ao criar item: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Erro na requisição createItem: $e');
      rethrow;
    }
  }

  /// Atualizar item no servidor
  Future<Map<String, dynamic>> updateItem(ShoppingItem item) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/items/${item.id}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          ...item.toJson(),
          'version': item.version,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'item': ShoppingItem.fromJson(data['item']),
        };
      } else if (response.statusCode == 409) {
        // Conflito detectado
        final data = json.decode(response.body);
        return {
          'success': false,
          'conflict': true,
          'serverItem': ShoppingItem.fromJson(data['serverItem']),
        };
      } else {
        throw Exception('Erro ao atualizar item: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Erro na requisição updateItem: $e');
      rethrow;
    }
  }

  /// Deletar item no servidor
  Future<bool> deleteItem(String id, int version) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/items/$id?version=$version'),
      ).timeout(const Duration(seconds: 10));

      return response.statusCode == 200 || response.statusCode == 404;
    } catch (e) {
      print('❌ Erro na requisição deleteItem: $e');
      rethrow;
    }
  }

  /// Sincronização em lote
  Future<List<Map<String, dynamic>>> syncBatch(
    List<Map<String, dynamic>> operations,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sync/batch'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'operations': operations}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['results']);
      } else {
        throw Exception('Erro no sync em lote: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Erro na requisição syncBatch: $e');
      rethrow;
    }
  }

  /// Verificar conectividade com servidor
  Future<bool> checkConnectivity() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
      ).timeout(const Duration(seconds: 5));

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}

