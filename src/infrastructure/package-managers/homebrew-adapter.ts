import type { IPackageManager } from "../../domain/interfaces/package-manager.js";
import type { Tool } from "../../domain/entities/tool.js";
import { getInstallCommand } from "../../domain/entities/tool.js";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { shell } from "../shell/index.js";
import { ShellError } from "../shell/shell-error.js";
import { existsSync } from "fs";
import { execSync } from "child_process";

/**
 * Erro específico quando o Homebrew não está instalado
 */
export class HomebrewNotInstalledError extends Error {
	constructor() {
		super("Homebrew não está instalado. Instale em https://brew.sh");
		this.name = "HomebrewNotInstalledError";
	}
}

/**
 * Implementação do IPackageManager para Homebrew (macOS)
 */
export class HomebrewAdapter implements IPackageManager {
	private readonly brewCommand = "brew";

	/**
	 * Verifica se o Homebrew está disponível no sistema
	 * Suporta tanto Mac Intel (/usr/local) quanto Apple Silicon (/opt/homebrew)
	 */
	public async isAvailable(): Promise<boolean> {
		// Verifica caminhos padrão do Homebrew
		// Mac Intel: /usr/local/bin/brew
		// Mac Apple Silicon (M1/M2/M3): /opt/homebrew/bin/brew
		const brewPaths = [
			"/opt/homebrew/bin/brew", // Apple Silicon (prioridade)
			"/usr/local/bin/brew", // Intel
			"/home/linuxbrew/.linuxbrew/bin/brew", // Linux
		];

		// 1. Verifica se o arquivo existe usando Node.js (mais confiável)
		for (const brewPath of brewPaths) {
			if (existsSync(brewPath)) {
				return true;
			}
		}

		// 2. Tenta executar brew --version usando execSync (síncrono, mais confiável)
		try {
			execSync("brew --version", { stdio: "ignore" });
			return true;
		} catch {
			// Não está no PATH
		}

		// 3. Tenta executar com caminho absoluto
		for (const brewPath of brewPaths) {
			try {
				execSync(`${brewPath} --version`, { stdio: "ignore" });
				return true;
			} catch {
				// Continua tentando
			}
		}

		return false;
	}

	/**
	 * Verifica se uma ferramenta está instalada
	 */
	public async isInstalled(tool: Tool): Promise<boolean> {
		// Usa o comando de verificação definido na tool
		try {
			const result = await shell.executeString(tool.checkCommand, {
				silent: true,
			});
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	/**
	 * Atualiza o cache do Homebrew
	 */
	public async update(): Promise<void> {
		if (!(await this.isAvailable())) {
			throw new HomebrewNotInstalledError();
		}

		try {
			await shell.executeString(`${this.brewCommand} update`, {
				verbose: false,
			});
		} catch (error) {
			if (error instanceof ShellError) {
				throw new Error(`Falha ao atualizar Homebrew: ${error.stderr || error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Instala uma ferramenta usando Homebrew
	 */
	public async install(tool: Tool): Promise<void> {
		if (!(await this.isAvailable())) {
			throw new HomebrewNotInstalledError();
		}

		const os = getCurrentOS();
		if (os !== "macos") {
			throw new Error("HomebrewAdapter só pode ser usado no macOS");
		}

		// Obtém o comando de instalação para macOS
		const installCommand = getInstallCommand(tool, os);
		if (!installCommand) {
			throw new Error(`Ferramenta ${tool.name} não possui comando de instalação para macOS`);
		}

		try {
			// Usa execução interativa para mostrar progresso em tempo real
			// Timeout de 10 minutos para instalações grandes
			await shell.executeInteractive(installCommand, {
				timeout: 600000,
			});
		} catch (error) {
			if (error instanceof ShellError) {
				// Traduz erros comuns do Homebrew
				const errorMessage = this.translateHomebrewError(error, tool);
				throw new Error(errorMessage);
			}
			throw error;
		}
	}

	/**
	 * Traduz erros do Homebrew para mensagens mais amigáveis
	 */
	private translateHomebrewError(error: ShellError, tool: Tool): string {
		const stderr = error.stderr.toLowerCase();
		const stdout = error.stdout.toLowerCase();

		// Verifica se o pacote não existe
		if (
			stderr.includes("no available formula") ||
			stderr.includes("no available cask") ||
			stderr.includes("could not find")
		) {
			return `Pacote '${tool.name}' não encontrado no Homebrew. Verifique se o nome está correto.`;
		}

		// Verifica problemas de conexão
		if (
			stderr.includes("timeout") ||
			stderr.includes("connection") ||
			stderr.includes("network")
		) {
			return `Falha de conexão ao tentar instalar '${tool.name}'. Verifique sua conexão com a internet.`;
		}

		// Verifica problemas de permissão
		if (stderr.includes("permission") || stderr.includes("sudo")) {
			return `Permissão negada ao tentar instalar '${tool.name}'. Pode ser necessário executar com privilégios de administrador.`;
		}

		// Verifica se já está instalado
		if (
			stderr.includes("already installed") ||
			stdout.includes("already installed")
		) {
			return `'${tool.name}' já está instalado.`;
		}

		// Erro genérico
		return `Erro ao instalar '${tool.name}': ${error.stderr || error.message}`;
	}
}

