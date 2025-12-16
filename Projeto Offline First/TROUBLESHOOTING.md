# 🔧 Troubleshooting - Projeto Offline First

## ⚠️ Problema: Projeto não roda (mas outros projetos Flutter funcionam)

Se outros projetos Flutter funcionam, o problema provavelmente é específico deste projeto.

---

## 🔍 Passo 1: Verificar Dependências

```bash
cd "Projeto Offline First"
flutter pub get
```

Se der erro, veja qual pacote está falhando.

---

## 🔍 Passo 2: Limpar e Reinstalar

```bash
cd "Projeto Offline First"
flutter clean
flutter pub get
flutter pub upgrade
```

---

## 🔍 Passo 3: Verificar Erros Específicos

### Erro: "Package not found" ou "Dependency error"

**Solução:**
```bash
flutter pub cache repair
flutter pub get
```

### Erro: "Gradle sync failed" (Android)

**Solução:**
```bash
cd android
gradlew clean
cd ..
flutter clean
flutter pub get
```

### Erro: "No devices found"

**Solução:**
```bash
# Ver dispositivos disponíveis
flutter devices

# Se não aparecer nada:
# - Conecte um dispositivo Android via USB (com depuração USB ativada)
# - OU crie um emulador no Android Studio
```

### Erro: "SDK version mismatch"

**Solução:**
Verifique se o Flutter SDK está atualizado:
```bash
flutter --version
flutter upgrade
```

---

## 🔍 Passo 4: Verificar Configuração do Projeto

### Verificar se está na pasta correta

Certifique-se de estar na pasta `Projeto Offline First`:
```bash
# Deve mostrar: pubspec.yaml
dir pubspec.yaml
```

### Verificar estrutura do projeto

O projeto deve ter:
- ✅ `pubspec.yaml`
- ✅ `lib/main.dart`
- ✅ `android/` (para Android)
- ✅ `ios/` (para iOS, se necessário)

---

## 🔍 Passo 5: Testar Compilação

```bash
# Verificar se compila sem erros
flutter analyze

# Tentar build
flutter build apk --debug
```

---

## 🔍 Passo 6: Comparar com Projeto que Funciona

Se você tem outro projeto Flutter que funciona:

1. Compare as versões do Flutter:
   ```bash
   # No projeto que funciona
   flutter --version
   
   # No projeto Offline First
   flutter --version
   ```

2. Compare o `pubspec.yaml`:
   - Versão do SDK
   - Versões dos pacotes

3. Compare a estrutura de pastas

---

## 🐛 Problemas Comuns Específicos

### Problema: Dependências incompatíveis

**Sintoma:** Erro ao fazer `flutter pub get`

**Solução:**
```bash
# Atualizar todas as dependências
flutter pub upgrade

# Ou atualizar Flutter primeiro
flutter upgrade
flutter pub get
```

### Problema: Cache corrompido

**Sintoma:** Erros estranhos, pacotes não encontrados

**Solução:**
```bash
flutter clean
flutter pub cache repair
flutter pub get
```

### Problema: Permissões Android

**Sintoma:** App não instala ou não funciona no Android

**Solução:**
Verifique `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

---

## ✅ Checklist Rápido

Execute na ordem:

- [ ] `flutter --version` (verificar Flutter funciona)
- [ ] `cd "Projeto Offline First"` (entrar na pasta)
- [ ] `flutter pub get` (instalar dependências)
- [ ] `flutter clean` (se der erro)
- [ ] `flutter devices` (ver dispositivos)
- [ ] `flutter run` (tentar rodar)

---

## 💡 Dica: Usar Android Studio

Se o terminal não funcionar, use o Android Studio:

1. Abra **Android Studio**
2. **File** → **Open**
3. Selecione a pasta `Projeto Offline First`
4. Aguarde o Flutter configurar
5. Clique em **Run** ▶️

O Android Studio mostra erros mais claros.

---

## 🆘 Se Nada Funcionar

1. **Copie o erro completo** que aparece
2. **Execute:** `flutter doctor -v`
3. **Compare** com o projeto que funciona
4. **Verifique** se há diferenças na configuração

---

**Qual erro específico você está vendo?** Isso ajuda a identificar o problema exato.

