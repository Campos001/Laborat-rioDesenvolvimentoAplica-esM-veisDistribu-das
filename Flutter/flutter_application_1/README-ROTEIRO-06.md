# 📚 Roteiro 06: Fundamentos e Persistência Local com SQLite

## ✅ Projeto Criado com Sucesso!

Este projeto implementa um **Task Manager** completo com persistência local usando SQLite.

---

## 📁 Estrutura do Projeto

```
flutter_application_1/
├── lib/
│   ├── main.dart                    # Ponto de entrada
│   ├── models/
│   │   └── task.dart                # Modelo de dados Task
│   ├── services/
│   │   └── database_service.dart    # Serviço de banco de dados SQLite
│   └── screens/
│       └── task_list_screen.dart    # Tela principal com CRUD
├── pubspec.yaml                     # Dependências
└── README-ROTEIRO-06.md            # Este arquivo
```

---

## 📦 Dependências Instaladas

- `sqflite: ^2.3.0` - Banco de dados SQLite
- `path_provider: ^2.1.1` - Caminhos do sistema de arquivos
- `path: ^1.8.3` - Utilitários de caminhos
- `uuid: ^4.2.1` - Geração de IDs únicos
- `intl: ^0.19.0` - Formatação de datas

---

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
cd Flutter/flutter_application_1
flutter pub get
```

### 2. Rodar o App

```bash
flutter run
```

---

## ✨ Funcionalidades Implementadas

### ✅ CRUD Completo
- **Create**: Adicionar novas tarefas
- **Read**: Listar todas as tarefas
- **Update**: Editar tarefas existentes
- **Delete**: Remover tarefas

### ✅ Campos Adicionais (Obrigatórios)
- **Prioridade**: Dropdown com opções (Baixa, Média, Alta)
- **Filtro por Status**: Todas / Pendentes / Completas
- **Contador de Tarefas**: Total, Pendentes, Completas

### ✅ Persistência Local
- Dados salvos em SQLite
- Persistem após fechar o app
- Banco de dados: `tasks.db`

---

## 📋 Estrutura do Banco de Dados

### Tabela: `tasks`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | TEXT | ID único (UUID) |
| title | TEXT | Título da tarefa |
| description | TEXT | Descrição (opcional) |
| completed | INTEGER | 0 = não completa, 1 = completa |
| priority | TEXT | low, medium, high |
| createdAt | TEXT | Data de criação (ISO8601) |

---

## 🎯 Como Usar

1. **Adicionar Tarefa**: Clique no botão ➕ (FAB)
   - Preencha título (obrigatório)
   - Adicione descrição (opcional)
   - Selecione prioridade

2. **Marcar como Completa**: Clique no checkbox ao lado da tarefa

3. **Editar Tarefa**: Clique no ícone ✏️

4. **Deletar Tarefa**: Clique no ícone 🗑️

5. **Filtrar**: Clique no ícone de filtro no AppBar
   - Todas
   - Pendentes
   - Completas

---

## 📊 Contadores

O app exibe três contadores no topo:
- **Total**: Número total de tarefas
- **Pendentes**: Tarefas não completas
- **Completas**: Tarefas marcadas como completas

---

## 🎨 Indicadores Visuais

- **Prioridade Alta**: Badge vermelho
- **Prioridade Média**: Badge laranja
- **Prioridade Baixa**: Badge verde
- **Tarefa Completa**: Texto riscado e cinza

---

## ✅ Entregável Aula 1

✅ App funcionando com CRUD completo de tarefas em SQLite  
✅ Campo "prioridade" com dropdown  
✅ Filtro por status (todas/completas/pendentes)  
✅ Contador de tarefas  

---

## 🔧 Troubleshooting

### Erro: "Package not found"
```bash
flutter pub get
```

### Erro: "Database not found"
O banco é criado automaticamente na primeira execução.

### Limpar Banco de Dados
Para resetar, desinstale e reinstale o app.

---

**Desenvolvido seguindo o Roteiro 06 - Fundamentos e Persistência Local com SQLite** 📚

