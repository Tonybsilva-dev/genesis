# 🚀 Genesis

**Ferramenta de automação de setup de ambiente de desenvolvimento cross-platform**

Configure seu ambiente de desenvolvimento em minutos! O Genesis automatiza a instalação de ferramentas essenciais para desenvolvedores em **macOS**, **Windows** e **Linux**.

## ✨ Funcionalidades

- 🖥️ **Cross-platform**: macOS, Windows 11 e Ubuntu
- 📦 **66+ ferramentas** organizadas em 13 categorias
- 🔄 **Idempotente**: detecta ferramentas já instaladas
- 🎨 **Interface CLI interativa** e intuitiva
- ⚡ **Rápido**: instalação paralela quando possível
- 📱 **Setup Android/iOS**: configuração automática de ambiente mobile

## 📦 Instalação

### Via npx (recomendado)

```bash
npx @tonybsilva/genesis
```

### Instalação global

```bash
npm install -g @tonybsilva/genesis
genesis
```

### Download direto (binário)

Baixe o binário para sua plataforma em [Releases](https://github.com/antoniobsilva/genesis/releases).

## 🛠️ Categorias de Ferramentas

| Categoria | Ferramentas |
|-----------|-------------|
| **Runtime** | NVM, fnm, pnpm, Yarn, Bun, Deno |
| **Versionamento** | Git, GitHub CLI, LazyGit, GitKraken, Sourcetree |
| **Linguagens** | Python, Go, Rust, .NET (C#), Ruby |
| **Editores** | VSCode, Cursor, Zed, Sublime, Neovim, WebStorm |
| **Containers** | Docker, Docker Compose, Colima, Podman, Vagrant |
| **Cloud & DevOps** | AWS CLI, GCloud, Azure CLI, Terraform, kubectl, Helm |
| **API & Testing** | Postman, Insomnia, Bruno, HTTPie |
| **Banco de Dados** | pgAdmin, DBeaver, TablePlus, MongoDB Compass, Redis Insight |
| **Android** | JDK 17, Android Studio, SDK Tools, Flutter, scrcpy |
| **iOS/macOS** | Xcode CLI, CocoaPods, Fastlane, SwiftLint |
| **Design** | Figma, Zeplin, ImageOptim, Sketch |
| **Comunicação** | Discord, Zoom, Notion, Obsidian, Teams |
| **Trabalho** | Slack, ClickUp, Linear, Todoist |

## 🚀 Como usar

1. Execute o Genesis:
   ```bash
   npx @tonybsilva/genesis
   ```

2. Selecione as categorias de ferramentas desejadas

3. Confirme a instalação

4. Aguarde a mágica acontecer! ✨

## 📋 Requisitos

- **macOS**: macOS 10.15+ (Homebrew será instalado automaticamente)
- **Windows**: Windows 11 (WinGet incluído)
- **Linux**: Ubuntu 20.04+ (APT)

## 🏗️ Arquitetura

O Genesis utiliza uma arquitetura baseada em **Domain-Driven Design (DDD)**:

```
src/
├── domain/           # Entidades e regras de negócio
│   ├── entities/     # Tool, Category
│   ├── interfaces/   # IPackageManager, IEnvironmentManager
│   └── services/     # OS Detection
├── application/      # Serviços de aplicação
│   └── services/     # Installation, HealthCheck, Android/iOS Setup
├── infrastructure/   # Implementações concretas
│   ├── package-managers/  # Homebrew, WinGet, APT adapters
│   ├── environment/       # Unix/Windows environment managers
│   └── shell/            # Shell wrapper (zx)
└── ui/               # Interface CLI (@clack/prompts)
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/nova-ferramenta`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova ferramenta'`)
4. Push para a branch (`git push origin feature/nova-ferramenta`)
5. Abrir um Pull Request

## 📄 Licença

MIT © [Antonio B. Silva](https://github.com/antoniobsilva)

---

Feito com ❤️ para desenvolvedores

