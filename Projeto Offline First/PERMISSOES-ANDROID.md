# Permissões Android para Câmera

## 📱 Configuração Necessária

Para que o app possa capturar fotos, é necessário adicionar as permissões no arquivo `AndroidManifest.xml`.

### Localização do Arquivo

O arquivo está localizado em:
```
android/app/src/main/AndroidManifest.xml
```

### Permissões a Adicionar

Adicione as seguintes permissões dentro da tag `<manifest>`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissões para câmera e armazenamento -->
    <uses-permission android:name="android.permission.CAMERA"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    
    <!-- Para Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
    
    <!-- Feature de câmera (opcional, mas recomendado) -->
    <uses-feature android:name="android.hardware.camera" android:required="false"/>
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false"/>
    
    <application>
        <!-- ... resto da configuração ... -->
    </application>
</manifest>
```

### Exemplo Completo

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.shopping_list_offline">
    
    <!-- Permissões -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.CAMERA"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
    
    <!-- Features -->
    <uses-feature android:name="android.hardware.camera" android:required="false"/>
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false"/>
    
    <application
        android:label="Lista de Compras"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <!-- ... -->
    </application>
</manifest>
```

## 📝 Notas Importantes

1. **Android 13+ (API 33+)**: A permissão `READ_MEDIA_IMAGES` substitui `READ_EXTERNAL_STORAGE` para acesso a imagens.

2. **Permissões em Tempo de Execução**: O plugin `image_picker` solicita permissões automaticamente quando necessário.

3. **Teste**: Após adicionar as permissões, faça um rebuild completo do app:
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

## 🔍 Verificação

Para verificar se as permissões foram adicionadas corretamente:

1. Execute o app
2. Tente tirar uma foto
3. O sistema deve solicitar permissão automaticamente
4. Se não solicitar, verifique o `AndroidManifest.xml` novamente

