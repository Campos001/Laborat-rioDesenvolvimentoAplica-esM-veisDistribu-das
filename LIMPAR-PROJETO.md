# 🧹 Limpeza do Projeto

## 📋 Arquivos e Pastas para Deletar

### 1. Deletar Pasta "Projeto Offline First"

**Opção 1: Usar Script (Recomendado)**
```bash
deletar-pasta-offline-first.bat
```

**Opção 2: Manual (Windows Explorer)**
1. Abra o Windows Explorer
2. Navegue até a pasta do projeto
3. Clique com botão direito em "Projeto Offline First"
4. Selecione "Excluir"
5. Confirme a exclusão

**Opção 3: PowerShell**
```powershell
Remove-Item -Path "Projeto Offline First" -Recurse -Force
```

**Opção 4: CMD**
```cmd
rd /s /q "Projeto Offline First"
```

---

## 📁 Estrutura Final do Projeto (Após Limpeza)

```
Laborat-rioDesenvolvimentoAplica-esM-veisDistribu-das/
├── rabbitmq-shopping/          # ✅ Manter (Projeto 1)
├── serverless-crud-sns/        # ✅ Manter (Projeto 3)
├── Flutter/
│   └── flutter_application_1/  # ✅ Manter (Roteiro 06)
├── GUIA-APRESENTACAO-COMPLETA.md
├── comandos-rapidos.md
├── README-PROJETOS.md
└── preparar-apresentacao.bat
```

---

## 🗑️ Arquivos que Podem ser Deletados (Opcional)

### Arquivos de Documentação (se não precisar mais)

- `GUIA-APRESENTACAO-COMPLETA.md` - Se já decorou o roteiro
- `comandos-rapidos.md` - Se não precisar mais consultar
- `preparar-apresentacao.bat` - Se não usar mais

### Arquivos Temporários

- `setx` - Arquivo estranho na raiz (pode deletar)

---

## ✅ Checklist de Limpeza

- [ ] Deletar pasta "Projeto Offline First"
- [ ] Atualizar README-PROJETOS.md (remover referências)
- [ ] (Opcional) Deletar arquivos de documentação não usados
- [ ] (Opcional) Deletar arquivo `setx` se existir

---

## 🔄 Após Deletar

Após deletar a pasta "Projeto Offline First", você terá:

1. **RabbitMQ** - Projeto de mensageria ✅
2. **Serverless CRUD SNS** - Projeto serverless ✅
3. **Flutter Application 1** - Roteiro 06 com SQLite ✅

---

**Nota:** A pasta `localstack-data` dentro de `rabbitmq-shopping` contém dados do LocalStack. Você pode deletá-la se quiser limpar os dados, mas ela será recriada quando rodar o LocalStack novamente.

