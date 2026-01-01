
<div align="center">

# Genesis - Automação de Setup de Ambiente

![Status](https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge)
![Bun](https://img.shields.io/badge/Bun-1.0+-black?style=for-the-badge&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs)

**Ferramenta CLI cross-platform para configuração automatizada de ambiente de desenvolvimento** 🚀

[Instalação](#-instalação) • [Funcionalidades](#-funcionalidades-principais) • [Documentação](#-como-usar)

</div>

---

## 📖 Sobre o Projeto

### 🎯 O Desafio

Configurar um ambiente de desenvolvimento do zero é um processo **tedioso, repetitivo e propenso a erros**. Cada desenvolvedor gasta horas instalando ferramentas, configurando variáveis de ambiente e lidando com incompatibilidades entre sistemas operacionais.

### 💡 A Solução

O **Genesis** é uma **CLI interativa** que automatiza todo o processo de setup em **3 frentes**:

1. **Instalação Inteligente**: Detecta o SO e usa o package manager adequado (Homebrew, WinGet, APT)
2. **Idempotência**: Verifica ferramentas já instaladas, evitando reinstalações desnecessárias
3. **Health Check**: Valida a instalação e gera relatório detalhado do ambiente

---

## ✨ Funcionalidades Principais

### 🖥️ Cross-Platform

- **macOS**: Suporte completo com Homebrew (Intel e Apple Silicon)
- **Windows 11**: Integração nativa com WinGet
- **Ubuntu/Linux**: Automação via APT com sudo gerenciado

### 📦 66+ Ferramentas em 13 Categorias

- **Runtime**: NVM, fnm, pnpm, Yarn, Bun, Deno
- **Versionamento**: Git, GitHub CLI, LazyGit, GitKraken, Sourcetree
- **Linguagens**: Python, Go, Rust, .NET (C#), Ruby
- **Editores**: VSCode, Cursor, Zed, Sublime, Neovim, WebStorm
- **Containers**: Docker, Docker Compose, Colima, Podman, Vagrant
- **Cloud & DevOps**: AWS CLI, GCloud, Azure CLI, Terraform, kubectl, Helm
- **API & Testing**: Postman, Insomnia, Bruno, HTTPie
- **Banco de Dados**: pgAdmin, DBeaver, TablePlus, MongoDB Compass, Redis Insight
- **Android**: JDK 17, Android Studio, SDK Tools, Flutter, scrcpy
- **iOS/macOS**: Xcode CLI, CocoaPods, Fastlane, SwiftLint
- **Design**: Figma, Zeplin, ImageOptim, Sketch
- **Comunicação**: Discord, Zoom, Notion, Obsidian, Teams
- **Trabalho**: Slack, ClickUp, Linear, Todoist

### 🔧 Setup Mobile Automatizado

- **Android**: Configuração de JAVA_HOME, ANDROID_HOME, aceite de licenças SDK
- **iOS**: Xcode CLI, CocoaPods, aceite de licença Xcode

---

## 🚀 Destaques Técnicos

### Arquitetura e Performance

- ✅ **Domain-Driven Design (DDD)**: Separação clara de domínio, aplicação e infraestrutura
- ✅ **Adapter Pattern**: Package managers intercambiáveis (Homebrew, WinGet, APT)
- ✅ **Idempotência**: Verifica instalações existentes antes de agir
- ✅ **Real-time Output**: Feedback visual durante instalações longas
- ✅ **Error Handling**: Tratamento robusto com mensagens claras

### Interface CLI

- ✅ **@clack/prompts**: Interface moderna e intuitiva
- ✅ **Multi-select**: Seleção de múltiplas ferramentas por categoria
- ✅ **Spinners**: Feedback visual durante operações
- ✅ **Health Report**: Tabela formatada com status de cada ferramenta

---

## 🛠️ Stack Tecnológica

### Core

- **Runtime**: Bun / Node.js 18+
- **Linguagem**: TypeScript 5.0+
- **Arquitetura**: Domain-Driven Design (DDD)
- **CLI Framework**: @clack/prompts

### Infraestrutura

- **Shell Execution**: zx + child_process
- **Package Managers**: Homebrew, WinGet, APT
- **Environment**: Unix/Windows Environment Managers

### Build & Deploy

- **Bundler**: Bun (compile to single binary)
- **Package Registry**: npm (@tonybsilva/genesis)
- **Targets**: macOS (arm64/x64), Linux (arm64/x64), Windows (x64)

---

## 📦 Instalação

### Via npx (Recomendado)

```bash
npx @tonybsilva/genesis
```

### Instalação Global

```bash
npm install -g @tonybsilva/genesis
genesis
```

### Via Bun (Desenvolvimento)

```bash
# Clone o repositório
git clone https://github.com/tonybsilva/genesis.git

# Entre no diretório
cd genesis

# Instale as dependências
bun install

# Execute em modo desenvolvimento
bun run dev
```

### Build Local

```bash
# Build do binário compilado
bun run build

# Executar
./genesis
```

---

## 📂 Estrutura do Projeto

```
src/
├── domain/                    # Camada de Domínio (DDD)
│   ├── entities/              # Entidades (Tool, Category)
│   ├── interfaces/            # Contratos (IPackageManager, IEnvironmentManager)
│   ├── services/              # Serviços de Domínio (OS Detector)
│   ├── config/                # Configuração de ferramentas
│   └── types/                 # Types TypeScript
│
├── application/               # Camada de Aplicação
│   └── services/              # Casos de Uso
│       ├── installation-service.ts    # Orquestração de instalações
│       ├── health-check-service.ts    # Verificação pós-instalação
│       ├── android-setup-service.ts   # Setup Android (JAVA_HOME, SDK)
│       └── ios-setup-service.ts       # Setup iOS (Xcode, CocoaPods)
│
├── infrastructure/            # Camada de Infraestrutura
│   ├── package-managers/      # Adapters (Homebrew, WinGet, APT)
│   ├── environment/           # Gerenciamento de variáveis de ambiente
│   ├── shell/                 # Wrapper para execução de comandos
│   └── auth/                  # Gerenciamento de privilégios (sudo)
│
├── ui/                        # Interface do Usuário
│   ├── cli.ts                 # Prompts interativos (@clack/prompts)
│   └── health-report.ts       # Renderização do relatório
│
└── index.ts                   # Entry point
```

---

## 🎯 Como Usar

### 1. Execute o Genesis

```bash
npx @tonybsilva/genesis
```

### 2. Selecione as Categorias

Use **ESPAÇO** para selecionar, **ENTER** para confirmar:

```
◆  Categoria: Runtime
│
●  Runtimes JavaScript para desenvolvimento
│
◻  NVM (Node Version Manager)
◻  fnm (Fast Node Manager)
◻  pnpm
◻  Yarn
◻  Bun
◻  Deno
─────────────────────────────
◻  ⬇️  Instalar Todas
◻  ⏭️  Pular
```

### 3. Confirme a Instalação

```
┌  📋 Resumo da Seleção
│
│  Runtime: NVM, pnpm, Bun
│  Editores: VSCode, Cursor
│  Containers: Docker
│
│  Total: 6 ferramentas
│
└  Deseja prosseguir com a instalação?
```

### 4. Aguarde o Health Check

```
┌──────────────────────────────────────────────────────────┐
│                    📊 Health Report                      │
├──────────────────────────────────────────────────────────┤
│ Ferramenta          │ Status │ Path              │ Versão│
├─────────────────────┼────────┼───────────────────┼───────┤
│ NVM                 │ ✅     │ ~/.nvm/nvm.sh     │ 0.39.0│
│ pnpm                │ ✅     │ /usr/local/bin    │ 8.15.0│
│ Bun                 │ ✅     │ ~/.bun/bin        │ 1.0.0 │
│ VSCode              │ ✅     │ /usr/local/bin    │ 1.85.0│
│ Cursor              │ ✅     │ /usr/local/bin    │ 0.42.0│
│ Docker              │ ✅     │ /usr/local/bin    │ 24.0.0│
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Categorias Detalhadas

### 1. Runtime (JavaScript/TypeScript)

| Ferramenta | Descrição |
|------------|-----------|
| **NVM** | Gerenciador de versões Node.js |
| **fnm** | Gerenciador Node.js ultra-rápido (Rust) |
| **pnpm** | Package manager eficiente |
| **Yarn** | Package manager alternativo |
| **Bun** | Runtime JavaScript moderno |
| **Deno** | Runtime seguro com TypeScript nativo |

### 2. Linguagens & Runtimes

| Ferramenta | Descrição |
|------------|-----------|
| **pyenv** | Gerenciador de versões Python |
| **Python 3** | Python 3.12 |
| **Go** | Linguagem Go (Golang) |
| **Rust** | Linguagem Rust |
| **.NET SDK** | SDK para C#, F#, VB.NET |
| **rbenv** | Gerenciador de versões Ruby |

### 3. Cloud & DevOps

| Ferramenta | Descrição |
|------------|-----------|
| **AWS CLI** | CLI da Amazon Web Services |
| **GCloud** | CLI do Google Cloud Platform |
| **Azure CLI** | CLI do Microsoft Azure |
| **Terraform** | Infraestrutura como código |
| **kubectl** | CLI do Kubernetes |
| **Helm** | Gerenciador de pacotes K8s |

---

## 📈 Métricas e Performance

### CLI Performance

- **Startup Time**: < 500ms
- **Bundle Size**: ~1MB (compilado)
- **Memory Usage**: ~50MB durante execução

### Compatibilidade

| Sistema | Versão Mínima | Package Manager |
|---------|---------------|-----------------|
| macOS | 10.15 (Catalina) | Homebrew |
| Windows | 11 (Build 22000) | WinGet |
| Ubuntu | 20.04 LTS | APT |

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev              # Executa em modo desenvolvimento

# Build
bun run build            # Compila binário local
bun run build:npm        # Build para publicação npm
bun run build:all        # Build para todas as plataformas

# Release
bun run release          # Script de release multi-plataforma

# Teste
bun run test             # Executa testes
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-ferramenta`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova ferramenta'`)
4. Push para a branch (`git push origin feature/nova-ferramenta`)
5. Abra um Pull Request

### Adicionando uma Nova Ferramenta

Edite `src/domain/config/tools.ts`:

```typescript
{
  id: "nova-ferramenta",
  name: "Nova Ferramenta",
  description: "Descrição da ferramenta",
  checkCommand: "command -v nova-ferramenta",
  categoryId: "categoria",
  installCommands: {
    macos: "brew install nova-ferramenta",
    windows: "winget install --id Publisher.NovaFerramenta",
    linux: "sudo apt-get install -y nova-ferramenta",
  },
}
```

---

## 📝 Licença

Este projeto está sob a licença **MIT**.

---

## 👨‍💻 Desenvolvedor

<table>
  <tr>
    <td width="150">
      <img src="https://github.com/tonybsilva.png" width="150" height="150" style="border-radius: 50%;" alt="Antonio B. Silva">
    </td>
    <td>
      <strong>Antonio B. Silva</strong><br>
      Software Engineer<br><br>
      💼 <a href="https://www.linkedin.com/in/tony-silva/">LinkedIn</a><br>
      📧 <a href="mailto:contato@antoniobsilva.com.br">contato@antoniobsilva.com.br</a><br>
      🐙 <a href="https://github.com/tonybsilva">GitHub</a>
    </td>
  </tr>
</table>

---

<div align="center">

**Desenvolvido com ❤️ e muito ☕**

[⬆ Voltar ao topo](#genesis---automação-de-setup-de-ambiente)

</div>
