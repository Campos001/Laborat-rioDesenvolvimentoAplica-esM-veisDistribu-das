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
    final connectivityResults = await _connectivity.checkConnectivity();
    final results = connectivityResults is List<ConnectivityResult>
        ? connectivityResults
        : [connectivityResults as ConnectivityResult];
    _updateStatus(results);

    _subscription = _connectivity.onConnectivityChanged.listen((result) {
      _updateStatus([result]);
    });

    print('✅ Serviço de conectividade inicializado');
  }

  void _updateStatus(List<ConnectivityResult> results) {
    final wasOnline = _isOnline;
    _isOnline = results.isNotEmpty && 
                results.any((result) => result != ConnectivityResult.none);

    if (wasOnline != _isOnline) {
      print(_isOnline ? '🟢 Conectado à internet' : '🔴 Sem conexão à internet');
      _connectivityController.add(_isOnline);
    }
  }

  Future<bool> checkConnectivity() async {
    final connectivityResults = await _connectivity.checkConnectivity();
    final results = connectivityResults is List<ConnectivityResult>
        ? connectivityResults
        : [connectivityResults as ConnectivityResult];
    _updateStatus(results);
    return _isOnline;
  }

  void dispose() {
    _subscription?.cancel();
    _connectivityController.close();
  }
}

