import type { Category, Tool } from "../entities/index.js";

/**
 * Configuração das ferramentas base do Genesis
 * Runtime e Versionamento
 */

export const runtimeTools: Tool[] = [
	{
		id: "nvm",
		name: "NVM (Node Version Manager)",
		description: "Gerenciador de versões do Node.js",
		checkCommand: "command -v nvm || test -s \"$HOME/.nvm/nvm.sh\" || where nvm",
		categoryId: "runtime",
		installCommands: {
			macos: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash",
			windows: "winget install --id CoreyButler.NVMforWindows --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash",
		},
	},
	{
		id: "fnm",
		name: "fnm (Fast Node Manager)",
		description: "Gerenciador de versões Node.js ultra-rápido escrito em Rust",
		checkCommand: "command -v fnm || where fnm",
		categoryId: "runtime",
		installCommands: {
			macos: "brew install fnm",
			windows: "winget install --id Schniz.fnm --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl -fsSL https://fnm.vercel.app/install | bash",
		},
	},
	{
		id: "pnpm",
		name: "pnpm",
		description: "Gerenciador de pacotes rápido e eficiente",
		checkCommand: "command -v pnpm || where pnpm",
		categoryId: "runtime",
		installCommands: {
			macos: "brew install pnpm",
			windows: "winget install --id pnpm.pnpm --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl -fsSL https://get.pnpm.io/install.sh | sh -",
		},
	},
	{
		id: "yarn",
		name: "Yarn",
		description: "Gerenciador de pacotes JavaScript alternativo",
		checkCommand: "command -v yarn || where yarn",
		categoryId: "runtime",
		installCommands: {
			macos: "brew install yarn",
			windows: "winget install --id Yarn.Yarn --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "npm install -g yarn",
		},
	},
	{
		id: "bun",
		name: "Bun",
		description: "Runtime JavaScript rápido e moderno",
		checkCommand: "command -v bun || where bun",
		categoryId: "runtime",
		installCommands: {
			macos: "brew install bun",
			windows: "winget install --id Oven-sh.Bun --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl -fsSL https://bun.sh/install | bash",
		},
	},
	{
		id: "deno",
		name: "Deno",
		description: "Runtime JavaScript/TypeScript seguro e moderno",
		checkCommand: "command -v deno || where deno",
		categoryId: "runtime",
		installCommands: {
			macos: "brew install deno",
			windows: "winget install --id DenoLand.Deno --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl -fsSL https://deno.land/install.sh | sh",
		},
	},
];

export const versioningTools: Tool[] = [
	{
		id: "git",
		name: "Git",
		description: "Sistema de controle de versão distribuído",
		checkCommand: "command -v git || where git",
		categoryId: "versioning",
		installCommands: {
			macos: "brew install git",
			windows: "winget install --id Git.Git --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y git",
		},
	},
	{
		id: "gh",
		name: "GitHub CLI",
		description: "Interface de linha de comando do GitHub",
		checkCommand: "command -v gh || where gh",
		categoryId: "versioning",
		installCommands: {
			macos: "brew install gh",
			windows: "winget install --id GitHub.cli --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y gh",
		},
	},
	{
		id: "lazygit",
		name: "LazyGit",
		description: "Interface TUI simples para comandos Git",
		checkCommand: "command -v lazygit || where lazygit",
		categoryId: "versioning",
		installCommands: {
			macos: "brew install lazygit",
			windows: "winget install --id JesseDuffield.lazygit --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y lazygit",
		},
	},
	{
		id: "gitkraken",
		name: "GitKraken",
		description: "Cliente Git visual e intuitivo",
		checkCommand: "test -d \"/Applications/GitKraken.app\" || test -d \"$LOCALAPPDATA/GitKraken\" || snap list gitkraken 2>/dev/null | grep -q gitkraken",
		categoryId: "versioning",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask gitkraken",
			windows: "winget install --id Axosoft.GitKraken --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install gitkraken --classic",
		},
	},
	{
		id: "sourcetree",
		name: "Sourcetree",
		description: "Cliente Git gratuito da Atlassian",
		checkCommand: "test -d \"/Applications/Sourcetree.app\"",
		categoryId: "versioning",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask sourcetree",
			windows: "winget install --id Atlassian.Sourcetree --exact --silent --accept-package-agreements --accept-source-agreements",
		},
	},
];

export const editorTools: Tool[] = [
	{
		id: "vscode",
		name: "Visual Studio Code",
		description: "Editor de código fonte desenvolvido pela Microsoft",
		checkCommand: "command -v code || where code",
		categoryId: "editors",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask visual-studio-code",
			windows: "winget install --id Microsoft.VisualStudioCode --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y code",
		},
	},
	{
		id: "cursor",
		name: "Cursor",
		description: "Editor de código com IA integrada",
		checkCommand: "command -v cursor || where cursor",
		categoryId: "editors",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask cursor",
			windows: "winget install --id Anysphere.Cursor --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl -fsSL https://download.todesktop.com/230313mzl4w4u92/cursor_amd64.deb -o /tmp/cursor.deb && sudo apt-get install -y /tmp/cursor.deb",
		},
	},
	{
		id: "zed",
		name: "Zed",
		description: "Editor de código ultra-rápido com colaboração em tempo real",
		checkCommand: "command -v zed || test -d \"/Applications/Zed.app\"",
		categoryId: "editors",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask zed",
			linux: "curl -fsSL https://zed.dev/install.sh | sh",
		},
	},
	{
		id: "sublime",
		name: "Sublime Text",
		description: "Editor de texto sofisticado para código",
		checkCommand: "command -v subl || test -d \"/Applications/Sublime Text.app\" || snap list sublime-text 2>/dev/null | grep -q sublime-text",
		categoryId: "editors",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask sublime-text",
			windows: "winget install --id SublimeHQ.SublimeText.4 --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install sublime-text --classic",
		},
	},
	{
		id: "neovim",
		name: "Neovim",
		description: "Editor de texto extensível baseado em Vim",
		checkCommand: "command -v nvim || where nvim",
		categoryId: "editors",
		installCommands: {
			macos: "brew install neovim",
			windows: "winget install --id Neovim.Neovim --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y neovim",
		},
	},
	{
		id: "webstorm",
		name: "WebStorm",
		description: "IDE JavaScript da JetBrains",
		checkCommand: "test -d \"/Applications/WebStorm.app\" || command -v webstorm || snap list webstorm 2>/dev/null | grep -q webstorm",
		categoryId: "editors",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask webstorm",
			windows: "winget install --id JetBrains.WebStorm --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install webstorm --classic",
		},
	},
];

export const workTools: Tool[] = [
	{
		id: "slack",
		name: "Slack",
		description: "Plataforma de comunicação para equipes",
		checkCommand: "command -v slack || where slack || test -d \"/Applications/Slack.app\" || test -d \"$LOCALAPPDATA/slack\" || snap list slack 2>/dev/null | grep -q slack",
		categoryId: "work",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask slack",
			windows: "winget install --id SlackTechnologies.Slack --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install slack --classic",
		},
	},
	{
		id: "clickup",
		name: "ClickUp",
		description: "Ferramenta de gerenciamento de projetos e tarefas",
		checkCommand: "command -v clickup || where clickup || test -d \"/Applications/ClickUp.app\" || test -d \"$LOCALAPPDATA/ClickUp\" || snap list clickup 2>/dev/null | grep -q clickup",
		categoryId: "work",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask clickup",
			windows: "winget install --id ClickUp.ClickUp --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install clickup",
		},
	},
	{
		id: "linear",
		name: "Linear",
		description: "Ferramenta moderna de gerenciamento de projetos",
		checkCommand: "test -d \"/Applications/Linear.app\" || test -d \"$LOCALAPPDATA/Linear\" || snap list linear 2>/dev/null | grep -q linear",
		categoryId: "work",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask linear-linear",
			windows: "winget install --id Linear.Linear --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install linear",
		},
	},
	{
		id: "todoist",
		name: "Todoist",
		description: "Gerenciador de tarefas pessoais e profissionais",
		checkCommand: "test -d \"/Applications/Todoist.app\" || test -d \"$LOCALAPPDATA/Todoist\" || snap list todoist 2>/dev/null | grep -q todoist",
		categoryId: "work",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask todoist",
			windows: "winget install --id Doist.Todoist --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install todoist",
		},
	},
];

export const androidTools: Tool[] = [
	{
		id: "temurin-jdk17",
		name: "Eclipse Temurin JDK 17",
		description: "Java Development Kit 17 (recomendado para Android)",
		checkCommand: "java -version 2>&1 | grep -E '(openjdk|java).*17' || /usr/libexec/java_home -v 17 2>/dev/null",
		categoryId: "android",
		installCommands: {
			macos: "brew install --cask temurin@17",
			windows: "winget install --id EclipseAdoptium.Temurin.17.JDK --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y temurin-17-jdk",
		},
	},
	{
		id: "android-studio",
		name: "Android Studio",
		description: "IDE oficial para desenvolvimento Android",
		checkCommand: "command -v studio || where studio || test -d \"/Applications/Android Studio.app\" || test -d \"$LOCALAPPDATA/Android/Sdk\" || snap list android-studio 2>/dev/null | grep -q android-studio",
		categoryId: "android",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask android-studio",
			windows: "winget install --id Google.AndroidStudio --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install android-studio --classic",
		},
	},
	{
		id: "android-sdk-cmdline",
		name: "Android SDK Command-line Tools",
		description: "Ferramentas de linha de comando do Android SDK",
		checkCommand: "command -v sdkmanager || where sdkmanager || test -f \"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager\"",
		categoryId: "android",
		installCommands: {
			macos: "brew install --cask android-commandlinetools",
			windows: "winget install --id Google.AndroidSDK --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y android-sdk",
		},
	},
	{
		id: "flutter",
		name: "Flutter SDK",
		description: "Framework para apps multiplataforma (Android, iOS, Web)",
		checkCommand: "command -v flutter || where flutter || snap list flutter 2>/dev/null | grep -q flutter",
		categoryId: "android",
		installCommands: {
			macos: "brew install --cask flutter",
			windows: "winget install --id Google.Flutter --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install flutter --classic",
		},
	},
	{
		id: "scrcpy",
		name: "scrcpy",
		description: "Espelhamento e controle de dispositivos Android via USB/Wi-Fi",
		checkCommand: "command -v scrcpy || where scrcpy",
		categoryId: "android",
		installCommands: {
			macos: "brew install scrcpy",
			windows: "winget install --id Genymobile.scrcpy --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y scrcpy",
		},
	},
];

export const iosTools: Tool[] = [
	{
		id: "xcode-cli",
		name: "Xcode Command Line Tools",
		description: "Ferramentas de linha de comando do Xcode",
		checkCommand: "xcode-select -p",
		categoryId: "ios",
		installCommands: {
			macos: "xcode-select --install",
		},
	},
	{
		id: "cocoapods",
		name: "CocoaPods",
		description: "Gerenciador de dependências para iOS",
		checkCommand: "command -v pod",
		categoryId: "ios",
		installCommands: {
			macos: "brew install cocoapods",
		},
	},
	{
		id: "fastlane",
		name: "Fastlane",
		description: "Automação de build e deploy para iOS/Android",
		checkCommand: "command -v fastlane",
		categoryId: "ios",
		installCommands: {
			macos: "brew install fastlane",
			linux: "sudo gem install fastlane",
		},
	},
	{
		id: "swiftlint",
		name: "SwiftLint",
		description: "Linter para código Swift",
		checkCommand: "command -v swiftlint",
		categoryId: "ios",
		installCommands: {
			macos: "brew install swiftlint",
		},
	},
	{
		id: "ios-simulator",
		name: "iOS Simulator",
		description: "Simulador de dispositivos iOS (requer Xcode)",
		checkCommand: "xcrun simctl list",
		categoryId: "ios",
		installCommands: {
			macos: "xcode-select --install && echo 'Abra o Xcode para baixar simuladores adicionais'",
		},
	},
];

export const databaseTools: Tool[] = [
	{
		id: "pgadmin",
		name: "pgAdmin 4",
		description: "Interface gráfica para PostgreSQL",
		checkCommand: "command -v pgadmin4 || where pgadmin4 || test -d \"/Applications/pgAdmin 4.app\"",
		categoryId: "database",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask pgadmin4",
			windows: "winget install --id PostgreSQL.pgAdmin --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y pgadmin4",
		},
	},
	{
		id: "dbeaver",
		name: "DBeaver",
		description: "Cliente universal de banco de dados",
		checkCommand: "command -v dbeaver || where dbeaver || test -d \"/Applications/DBeaver.app\" || snap list dbeaver-ce 2>/dev/null | grep -q dbeaver-ce",
		categoryId: "database",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask dbeaver-community",
			windows: "winget install --id dbeaver.dbeaver --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install dbeaver-ce",
		},
	},
	{
		id: "tableplus",
		name: "TablePlus",
		description: "Cliente moderno para bancos de dados relacionais e NoSQL",
		checkCommand: "test -d \"/Applications/TablePlus.app\" || snap list tableplus 2>/dev/null | grep -q tableplus",
		categoryId: "database",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask tableplus",
			windows: "winget install --id TablePlus.TablePlus --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install tableplus",
		},
	},
	{
		id: "mongodb-compass",
		name: "MongoDB Compass",
		description: "Interface gráfica oficial do MongoDB",
		checkCommand: "test -d \"/Applications/MongoDB Compass.app\" || test -d \"$LOCALAPPDATA/MongoDBCompass\" || snap list mongodb-compass 2>/dev/null | grep -q mongodb-compass",
		categoryId: "database",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask mongodb-compass",
			windows: "winget install --id MongoDB.Compass.Full --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install mongodb-compass",
		},
	},
	{
		id: "redis-insight",
		name: "Redis Insight",
		description: "Interface gráfica oficial do Redis",
		checkCommand: "test -d \"/Applications/Redis Insight.app\" || test -d \"$LOCALAPPDATA/RedisInsight\" || snap list redisinsight 2>/dev/null | grep -q redisinsight",
		categoryId: "database",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask redisinsight",
			windows: "winget install --id RedisInsight.RedisInsight --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install redisinsight",
		},
	},
];

// ============================================
// CLOUD & DEVOPS
// ============================================
export const cloudDevOpsTools: Tool[] = [
	{
		id: "aws-cli",
		name: "AWS CLI",
		description: "Interface de linha de comando da Amazon Web Services",
		checkCommand: "command -v aws || where aws",
		categoryId: "cloud-devops",
		installCommands: {
			macos: "brew install awscli",
			windows: "winget install --id Amazon.AWSCLI --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install",
		},
	},
	{
		id: "gcloud",
		name: "Google Cloud SDK",
		description: "CLI do Google Cloud Platform",
		checkCommand: "command -v gcloud || where gcloud",
		categoryId: "cloud-devops",
		installCommands: {
			macos: "brew install --cask google-cloud-sdk",
			windows: "winget install --id Google.CloudSDK --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl https://sdk.cloud.google.com | bash",
		},
	},
	{
		id: "azure-cli",
		name: "Azure CLI",
		description: "Interface de linha de comando do Microsoft Azure",
		checkCommand: "command -v az || where az",
		categoryId: "cloud-devops",
		installCommands: {
			macos: "brew install azure-cli",
			windows: "winget install --id Microsoft.AzureCLI --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash",
		},
	},
	{
		id: "terraform",
		name: "Terraform",
		description: "Infraestrutura como código",
		checkCommand: "command -v terraform || where terraform",
		categoryId: "cloud-devops",
		installCommands: {
			macos: "brew install terraform",
			windows: "winget install --id Hashicorp.Terraform --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y terraform",
		},
	},
	{
		id: "kubectl",
		name: "kubectl",
		description: "CLI do Kubernetes",
		checkCommand: "command -v kubectl || where kubectl",
		categoryId: "cloud-devops",
		installCommands: {
			macos: "brew install kubectl",
			windows: "winget install --id Kubernetes.kubectl --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y kubectl",
		},
	},
	{
		id: "helm",
		name: "Helm",
		description: "Gerenciador de pacotes Kubernetes",
		checkCommand: "command -v helm || where helm",
		categoryId: "cloud-devops",
		installCommands: {
			macos: "brew install helm",
			windows: "winget install --id Helm.Helm --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash",
		},
	},
];

// ============================================
// CONTAINERS & VIRTUALIZAÇÃO
// ============================================
export const containerTools: Tool[] = [
	{
		id: "docker",
		name: "Docker Desktop",
		description: "Plataforma de containerização",
		checkCommand: "command -v docker || where docker",
		categoryId: "containers",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask docker",
			windows: "winget install --id Docker.DockerDesktop --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl -fsSL https://get.docker.com | sh",
		},
	},
	{
		id: "docker-compose",
		name: "Docker Compose",
		description: "Orquestração de containers Docker",
		checkCommand: "command -v docker-compose || docker compose version",
		categoryId: "containers",
		installCommands: {
			macos: "brew install docker-compose",
			windows: "winget install --id Docker.DockerCompose --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y docker-compose-plugin",
		},
	},
	{
		id: "colima",
		name: "Colima",
		description: "Container runtime leve para macOS (alternativa ao Docker Desktop)",
		checkCommand: "command -v colima",
		categoryId: "containers",
		installCommands: {
			macos: "brew install colima",
			linux: "brew install colima",
		},
	},
	{
		id: "podman",
		name: "Podman",
		description: "Container engine sem daemon (alternativa ao Docker)",
		checkCommand: "command -v podman || where podman",
		categoryId: "containers",
		installCommands: {
			macos: "brew install podman",
			windows: "winget install --id RedHat.Podman --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y podman",
		},
	},
	{
		id: "vagrant",
		name: "Vagrant",
		description: "Gerenciador de máquinas virtuais",
		checkCommand: "command -v vagrant || where vagrant",
		categoryId: "containers",
		installCommands: {
			macos: "brew install --cask vagrant",
			windows: "winget install --id Hashicorp.Vagrant --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y vagrant",
		},
	},
];

// ============================================
// LINGUAGENS & RUNTIMES
// ============================================
export const languageTools: Tool[] = [
	{
		id: "python-pyenv",
		name: "pyenv",
		description: "Gerenciador de versões Python",
		checkCommand: "command -v pyenv || where pyenv",
		categoryId: "languages",
		installCommands: {
			macos: "brew install pyenv",
			windows: "winget install --id pyenv-win.pyenv-win --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl https://pyenv.run | bash",
		},
	},
	{
		id: "python3",
		name: "Python 3",
		description: "Linguagem de programação Python",
		checkCommand: "command -v python3 || where python",
		categoryId: "languages",
		installCommands: {
			macos: "brew install python@3.12",
			windows: "winget install --id Python.Python.3.12 --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y python3 python3-pip",
		},
	},
	{
		id: "go",
		name: "Go",
		description: "Linguagem de programação Go (Golang)",
		checkCommand: "command -v go || where go",
		categoryId: "languages",
		installCommands: {
			macos: "brew install go",
			windows: "winget install --id GoLang.Go --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y golang-go",
		},
	},
	{
		id: "rust",
		name: "Rust",
		description: "Linguagem de programação Rust",
		checkCommand: "command -v rustc || where rustc",
		categoryId: "languages",
		installCommands: {
			macos: "brew install rust",
			windows: "winget install --id Rustlang.Rust.MSVC --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
		},
	},
	{
		id: "dotnet",
		name: ".NET SDK",
		description: "SDK do .NET para C#, F# e VB.NET",
		checkCommand: "command -v dotnet || where dotnet",
		categoryId: "languages",
		installCommands: {
			macos: "brew install --cask dotnet-sdk",
			windows: "winget install --id Microsoft.DotNet.SDK.8 --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0",
		},
	},
	{
		id: "ruby-rbenv",
		name: "rbenv",
		description: "Gerenciador de versões Ruby",
		checkCommand: "command -v rbenv",
		categoryId: "languages",
		installCommands: {
			macos: "brew install rbenv ruby-build",
			linux: "curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash",
		},
	},
];

// ============================================
// API & TESTING
// ============================================
export const apiTestingTools: Tool[] = [
	{
		id: "postman",
		name: "Postman",
		description: "Cliente de API para testes e desenvolvimento",
		checkCommand: "command -v postman || where postman || test -d \"/Applications/Postman.app\" || snap list postman 2>/dev/null | grep -q postman",
		categoryId: "api-testing",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask postman",
			windows: "winget install --id Postman.Postman --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install postman",
		},
	},
	{
		id: "insomnia",
		name: "Insomnia",
		description: "Cliente REST e GraphQL",
		checkCommand: "command -v insomnia || test -d \"/Applications/Insomnia.app\" || snap list insomnia 2>/dev/null | grep -q insomnia",
		categoryId: "api-testing",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask insomnia",
			windows: "winget install --id Insomnia.Insomnia --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install insomnia",
		},
	},
	{
		id: "bruno",
		name: "Bruno",
		description: "Cliente de API open-source (alternativa ao Postman)",
		checkCommand: "command -v bruno || test -d \"/Applications/Bruno.app\" || snap list bruno 2>/dev/null | grep -q bruno",
		categoryId: "api-testing",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask bruno",
			windows: "winget install --id Bruno.Bruno --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install bruno",
		},
	},
	{
		id: "httpie",
		name: "HTTPie",
		description: "Cliente HTTP moderno para linha de comando",
		checkCommand: "command -v http || command -v httpie",
		categoryId: "api-testing",
		installCommands: {
			macos: "brew install httpie",
			windows: "winget install --id HTTPie.HTTPie --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo apt-get update && sudo apt-get install -y httpie",
		},
	},
];

// ============================================
// DESIGN & PROTOTIPAGEM
// ============================================
export const designTools: Tool[] = [
	{
		id: "figma",
		name: "Figma",
		description: "Design colaborativo e prototipagem",
		checkCommand: "test -d \"/Applications/Figma.app\" || test -d \"$LOCALAPPDATA/Figma\" || snap list figma-linux 2>/dev/null | grep -q figma-linux",
		categoryId: "design",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask figma",
			windows: "winget install --id Figma.Figma --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install figma-linux",
		},
	},
	{
		id: "zeplin",
		name: "Zeplin",
		description: "Handoff de design para desenvolvedores",
		checkCommand: "test -d \"/Applications/Zeplin.app\"",
		categoryId: "design",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask zeplin",
			windows: "winget install --id Zeplin.Zeplin --exact --silent --accept-package-agreements --accept-source-agreements",
		},
	},
	{
		id: "imageoptim",
		name: "ImageOptim",
		description: "Otimização e compressão de imagens",
		checkCommand: "test -d \"/Applications/ImageOptim.app\"",
		categoryId: "design",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask imageoptim",
		},
	},
	{
		id: "sketch",
		name: "Sketch",
		description: "Design de interfaces (macOS)",
		checkCommand: "test -d \"/Applications/Sketch.app\"",
		categoryId: "design",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask sketch",
		},
	},
];

// ============================================
// COMUNICAÇÃO & COLABORAÇÃO
// ============================================
export const communicationTools: Tool[] = [
	{
		id: "discord",
		name: "Discord",
		description: "Comunicação para comunidades e equipes",
		checkCommand: "test -d \"/Applications/Discord.app\" || test -d \"$LOCALAPPDATA/Discord\" || snap list discord 2>/dev/null | grep -q discord",
		categoryId: "communication",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask discord",
			windows: "winget install --id Discord.Discord --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install discord",
		},
	},
	{
		id: "zoom",
		name: "Zoom",
		description: "Videoconferência e reuniões",
		checkCommand: "test -d \"/Applications/zoom.us.app\" || test -d \"$LOCALAPPDATA/Zoom\" || snap list zoom-client 2>/dev/null | grep -q zoom-client",
		categoryId: "communication",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask zoom",
			windows: "winget install --id Zoom.Zoom --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install zoom-client",
		},
	},
	{
		id: "notion",
		name: "Notion",
		description: "Documentação e base de conhecimento",
		checkCommand: "test -d \"/Applications/Notion.app\" || test -d \"$LOCALAPPDATA/Notion\" || snap list notion-snap-reborn 2>/dev/null | grep -q notion-snap-reborn",
		categoryId: "communication",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask notion",
			windows: "winget install --id Notion.Notion --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install notion-snap-reborn",
		},
	},
	{
		id: "obsidian",
		name: "Obsidian",
		description: "Base de conhecimento pessoal em Markdown",
		checkCommand: "test -d \"/Applications/Obsidian.app\" || test -d \"$LOCALAPPDATA/Obsidian\" || snap list obsidian 2>/dev/null | grep -q obsidian",
		categoryId: "communication",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask obsidian",
			windows: "winget install --id Obsidian.Obsidian --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install obsidian --classic",
		},
	},
	{
		id: "teams",
		name: "Microsoft Teams",
		description: "Colaboração e comunicação empresarial",
		checkCommand: "test -d \"/Applications/Microsoft Teams.app\" || test -d \"$LOCALAPPDATA/Microsoft/Teams\" || snap list teams 2>/dev/null | grep -q teams",
		categoryId: "communication",
		isGUI: true,
		installCommands: {
			macos: "brew install --cask microsoft-teams",
			windows: "winget install --id Microsoft.Teams --exact --silent --accept-package-agreements --accept-source-agreements",
			linux: "sudo snap install teams",
		},
	},
];

/**
 * Categorias base do Genesis
 */
export const baseCategories: Category[] = [
	{
		id: "runtime",
		name: "Runtime",
		description: "Runtimes JavaScript para desenvolvimento",
		allowsMultipleSelection: true,
		order: 1,
		tools: runtimeTools,
	},
	{
		id: "versioning",
		name: "Versionamento",
		description: "Ferramentas de controle de versão",
		allowsMultipleSelection: true,
		order: 2,
		tools: versioningTools,
	},
	{
		id: "languages",
		name: "Linguagens & Runtimes",
		description: "Linguagens de programação e gerenciadores de versão",
		allowsMultipleSelection: true,
		order: 3,
		tools: languageTools,
	},
	{
		id: "editors",
		name: "Editores",
		description: "Editores de código e IDEs",
		allowsMultipleSelection: true,
		order: 4,
		tools: editorTools,
	},
	{
		id: "containers",
		name: "Containers & Virtualização",
		description: "Docker, Podman, Vagrant e ferramentas de containerização",
		allowsMultipleSelection: true,
		order: 5,
		tools: containerTools,
	},
	{
		id: "cloud-devops",
		name: "Cloud & DevOps",
		description: "AWS, GCP, Azure, Terraform, Kubernetes",
		allowsMultipleSelection: true,
		order: 6,
		tools: cloudDevOpsTools,
	},
	{
		id: "api-testing",
		name: "API & Testing",
		description: "Clientes de API e ferramentas de teste",
		allowsMultipleSelection: true,
		order: 7,
		tools: apiTestingTools,
	},
	{
		id: "database",
		name: "Banco de Dados",
		description: "Clientes e ferramentas de banco de dados",
		allowsMultipleSelection: true,
		order: 8,
		tools: databaseTools,
	},
	{
		id: "android",
		name: "Android",
		description: "Ferramentas para desenvolvimento Android",
		allowsMultipleSelection: true,
		order: 9,
		tools: androidTools,
	},
	{
		id: "ios",
		name: "iOS/macOS",
		description: "Ferramentas para desenvolvimento iOS (somente macOS)",
		allowsMultipleSelection: true,
		order: 10,
		tools: iosTools,
	},
	{
		id: "design",
		name: "Design & Prototipagem",
		description: "Figma, Sketch e ferramentas de design",
		allowsMultipleSelection: true,
		order: 11,
		tools: designTools,
	},
	{
		id: "communication",
		name: "Comunicação & Colaboração",
		description: "Discord, Zoom, Notion e ferramentas de colaboração",
		allowsMultipleSelection: true,
		order: 12,
		tools: communicationTools,
	},
	{
		id: "work",
		name: "Ferramentas de Trabalho",
		description: "Slack, ClickUp e produtividade",
		allowsMultipleSelection: true,
		order: 13,
		tools: workTools,
	},
];

/**
 * Todas as ferramentas disponíveis
 */
export const allTools: Tool[] = [
	...runtimeTools,
	...versioningTools,
	...languageTools,
	...editorTools,
	...containerTools,
	...cloudDevOpsTools,
	...apiTestingTools,
	...databaseTools,
	...androidTools,
	...iosTools,
	...designTools,
	...communicationTools,
	...workTools,
];

/**
 * Busca uma ferramenta por ID
 */
export function findToolById(toolId: string): Tool | undefined {
	return allTools.find((tool) => tool.id === toolId);
}

/**
 * Busca ferramentas por categoria
 */
export function getToolsByCategory(categoryId: string): Tool[] {
	return allTools.filter((tool) => tool.categoryId === categoryId);
}

