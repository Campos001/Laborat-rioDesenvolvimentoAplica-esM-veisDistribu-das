# 🗑️ Como Deletar a Pasta "Projeto Offline First"

## ⚡ Método Mais Fácil (Recomendado)

Execute o script que criei:

```bash
deletar-pasta-offline-first.bat
```

O script vai:
1. Pedir confirmação
2. Deletar a pasta completamente
3. Mostrar resultado

---

## 🔧 Métodos Alternativos

### Método 1: Windows Explorer (Visual)

1. Abra o **Windows Explorer**
2. Navegue até: `C:\Users\ACER\Documents\GitHub\Laborat-rioDesenvolvimentoAplica-esM-veisDistribu-das`
3. Encontre a pasta **"Projeto Offline First"**
4. **Clique com botão direito** na pasta
5. Selecione **"Excluir"**
6. Confirme a exclusão

### Método 2: PowerShell

Abra PowerShell e execute:

```powershell
cd "C:\Users\ACER\Documents\GitHub\Laborat-rioDesenvolvimentoAplica-esM-veisDistribu-das"
Remove-Item -Path "Projeto Offline First" -Recurse -Force
```

### Método 3: CMD (Prompt de Comando)

Abra CMD e execute:

```cmd
cd "C:\Users\ACER\Documents\GitHub\Laborat-rioDesenvolvimentoAplica-esM-veisDistribu-das"
rd /s /q "Projeto Offline First"
```

---

## ⚠️ Importante

- **Feche o VS Code/Cursor** se a pasta estiver aberta
- **Feche qualquer terminal** que esteja usando a pasta
- A exclusão é **permanente** (não vai para a lixeira)

---

## ✅ Após Deletar

Sua estrutura final será:

```
Laborat-rioDesenvolvimentoAplica-esM-veisDistribu-das/
├── rabbitmq-shopping/          ✅ Projeto 1
├── serverless-crud-sns/        ✅ Projeto 3
├── Flutter/
│   └── flutter_application_1/  ✅ Roteiro 06
└── (documentação)
```

---

**Use o script `deletar-pasta-offline-first.bat` para facilitar! 🚀**

