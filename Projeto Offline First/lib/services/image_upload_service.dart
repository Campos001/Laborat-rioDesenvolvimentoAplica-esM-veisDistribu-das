import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

/// Serviço para upload de imagens para S3 LocalStack via backend
class ImageUploadService {
  // URL do backend (list-service na porta 3002)
  static const String baseUrl = 'http://10.0.2.2:3002'; // Android emulator
  // static const String baseUrl = 'http://localhost:3002'; // iOS simulator ou dispositivo físico

  /// Captura uma imagem da câmera
  static Future<XFile?> pickImageFromCamera() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85, // Comprimir para reduzir tamanho
        maxWidth: 1920,
        maxHeight: 1920,
      );
      return image;
    } catch (e) {
      print('❌ Erro ao capturar imagem: $e');
      return null;
    }
  }

  /// Seleciona uma imagem da galeria
  static Future<XFile?> pickImageFromGallery() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      return image;
    } catch (e) {
      print('❌ Erro ao selecionar imagem: $e');
      return null;
    }
  }

  /// Converte XFile para Base64
  static Future<String?> imageToBase64(XFile image) async {
    try {
      final bytes = await image.readAsBytes();
      final base64Image = base64Encode(bytes);
      return base64Image;
    } catch (e) {
      print('❌ Erro ao converter imagem para Base64: $e');
      return null;
    }
  }

  /// Faz upload da imagem para o backend (que salva no S3 LocalStack)
  static Future<String?> uploadImage({
    required String imageBase64,
    String? fileName,
    String? itemId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/upload'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'imageBase64': imageBase64,
          'fileName': fileName ?? 'image.jpg',
          'itemId': itemId,
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data']['imageUrl'] as String;
        } else {
          throw Exception(data['error'] ?? 'Erro desconhecido');
        }
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['error'] ?? 'Erro no upload: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Erro no upload da imagem: $e');
      rethrow;
    }
  }

  /// Método completo: captura imagem e faz upload
  static Future<String?> captureAndUpload({
    ImageSource source = ImageSource.camera,
    String? itemId,
  }) async {
    try {
      // 1. Capturar/selecionar imagem
      final XFile? image = source == ImageSource.camera
          ? await pickImageFromCamera()
          : await pickImageFromGallery();

      if (image == null) {
        return null; // Usuário cancelou
      }

      // 2. Converter para Base64
      final base64Image = await imageToBase64(image);
      if (base64Image == null) {
        throw Exception('Erro ao converter imagem');
      }

      // 3. Fazer upload
      final imageUrl = await uploadImage(
        imageBase64: base64Image,
        fileName: image.name,
        itemId: itemId,
      );

      return imageUrl;
    } catch (e) {
      print('❌ Erro em captureAndUpload: $e');
      rethrow;
    }
  }
}

