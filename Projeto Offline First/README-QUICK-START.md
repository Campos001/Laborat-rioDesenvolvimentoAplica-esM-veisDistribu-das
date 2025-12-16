# 📱 Offline First - Quick Start

## ⚡ Execução Rápida

### ⚠️ Se o projeto não roda (mas outros Flutter funcionam)

Veja: **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** para diagnóstico específico.

### 1. Preparar Backend (se necessário)

```bash
# Se usar backend separado, iniciar antes
# (exemplo: rodar API na porta 3000)
```

### 2. Executar App

```bash
cd "Projeto Offline First"
flutter pub get
flutter run
```

**Ou usar Android Studio:**
1. Abrir Android Studio
2. File → Open → Selecionar pasta do projeto
3. Clicar em Run ▶️

### 3. Testar Offline

1. **Colocar em Modo Avião** ✈️
2. **Criar 2 itens** no app
3. **Editar 1 item** existente
4. **Fechar e reabrir app** (dados persistem)
5. **Tirar do Modo Avião** → Sincronização automática

---

## 📋 Comandos Úteis

### Instalar dependências
```bash
flutter pub get
```

### Limpar e rebuild
```bash
flutter clean
flutter pub get
flutter run
```

### Ver logs
```bash
flutter logs
```

### Rodar em dispositivo específico
```bash
flutter devices
flutter run -d <device_id>
```

---

## ⚙️ Configuração

### URL do Backend

Editar em: `lib/services/api_service.dart`

```dart
static const String baseUrl = 'http://10.0.2.2:3000'; // Android Emulator
// ou
static const String baseUrl = 'http://localhost:3000'; // iOS Simulator
// ou
static const String baseUrl = 'http://SEU_IP:3000'; // Dispositivo físico
```

### Permissões Android

Verificar `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

---

## 🎯 Roteiro de Teste

1. **Modo Avião ON** → Criar/editar itens
2. **Fechar app** → Reabrir (dados persistem)
3. **Modo Avião OFF** → Sincronização automática
4. **Verificar backend** → Itens sincronizados

