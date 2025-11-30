import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  static final ConnectivityService instance = ConnectivityService._init();

  final Connectivity _connectivity = Connectivity();
  final _connectivityController = StreamController<bool>.broadcast();

  bool _isOnline = false;
  StreamSubscription? _subscription;

  ConnectivityService._init();

  Stream<bool> get connectivityStream => _connectivityController.stream;
  bool get isOnline => _isOnline;

  Future<void> initialize() async {
    final ConnectivityResult result = await _connectivity.checkConnectivity();
    _updateStatus(result);

    _subscription = _connectivity.onConnectivityChanged.listen((ConnectivityResult result) {
      _updateStatus(result);
    });

    print('✅ Serviço de conectividade inicializado');
  }

  void _updateStatus(ConnectivityResult result) {
    final wasOnline = _isOnline;
    _isOnline = result != ConnectivityResult.none;

    if (wasOnline != _isOnline) {
      print(_isOnline ? '🟢 Conectado à internet' : '🔴 Sem conexão à internet');
      _connectivityController.add(_isOnline);
    }
  }

  Future<bool> checkConnectivity() async {
    final ConnectivityResult result = await _connectivity.checkConnectivity();
    _updateStatus(result);
    return _isOnline;
  }

  void dispose() {
    _subscription?.cancel();
    _connectivityController.close();
  }
}

