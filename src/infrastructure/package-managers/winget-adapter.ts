import type { IPackageManager } from "../../domain/interfaces/package-manager.js";
import type { Tool } from "../../domain/entities/tool.js";
import { getInstallCommand } from "../../domain/entities/tool.js";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { shell } from "../shell/index.js";
import { ShellError } from "../shell/shell-error.js";

/**
 * Erro específico quando o WinGet não está instalado
 */
export class WinGetNotInstalledError extends Error {
	constructor() {
		super(
			"WinGet não está instalado. Instale o App Installer da Microsoft Store ou atualize o Windows 11."
		);
		this.name = "WinGetNotInstalledError";
	}
}

/**
 * Implementação do IPackageManager para WinGet (Windows)
 */
export class WinGetAdapter implements IPackageManager {
	private readonly wingetCommand = "winget";

	/**
	 * Verifica se o WinGet está disponível no sistema
	 */
	public async isAvailable(): Promise<boolean> {
		if (getCurrentOS() !== "windows") {
			return false;
		}

		try {
			const result = await shell.executeString(`${this.wingetCommand} --version`, {
				silent: true,
			});
			return result.exitCode === 0 && result.stdout.trim().length > 0;
		} catch {
			return false;
		}
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
	 * Atualiza o cache do WinGet (não necessário, mas implementado para compatibilidade)
	 */
	public async update(): Promise<void> {
		if (!(await this.isAvailable())) {
			throw new WinGetNotInstalledError();
		}

		// WinGet não tem comando de update explícito, mas podemos atualizar a lista de pacotes
		try {
			await shell.executeString(`${this.wingetCommand} upgrade --all --include-unknown`, {
				verbose: false,
				silent: true,
			});
		} catch {
			// Ignora erros no update, não é crítico
		}
	}

	/**
	 * Instala uma ferramenta usando WinGet
	 */
	public async install(tool: Tool): Promise<void> {
		if (!(await this.isAvailable())) {
			throw new WinGetNotInstalledError();
		}

		const os = getCurrentOS();
		if (os !== "windows") {
			throw new Error("WinGetAdapter só pode ser usado no Windows");
		}

		// Obtém o comando de instalação para Windows
		const installCommand = getInstallCommand(tool, os);
		if (!installCommand) {
			throw new Error(`Ferramenta ${tool.name} não possui comando de instalação para Windows`);
		}

		// Extrai o ID do pacote do comando (formato esperado: winget install --id <ID> ...)
		const packageId = this.extractPackageId(installCommand);
		if (!packageId) {
			throw new Error(`Não foi possível extrair o ID do pacote do comando: ${installCommand}`);
		}

		// Constrói o comando completo com flags de instalação silenciosa
		const fullCommand = this.buildInstallCommand(packageId);

		try {
			// Executa o comando de instalação
			await shell.executeString(fullCommand, {
				verbose: true,
			});
		} catch (error) {
			if (error instanceof ShellError) {
				// Traduz erros comuns do WinGet
				const errorMessage = this.translateWinGetError(error, tool);
				throw new Error(errorMessage);
			}
			throw error;
		}
	}

	/**
	 * Extrai o ID do pacote do comando de instalação
	 */
	private extractPackageId(command: string): string | null {
		// Procura por --id <id> ou --id=<id>
		const idMatch = command.match(/--id[=\s]+([^\s]+)/i);
		if (idMatch && idMatch[1]) {
			return idMatch[1];
		}

		// Se o comando já contém o ID diretamente (sem --id), tenta extrair
		// Formato: winget install PackageName
		const parts = command.trim().split(/\s+/);
		const installIndex = parts.findIndex((p) => p.toLowerCase() === "install");
		if (installIndex !== -1 && parts[installIndex + 1]) {
			return parts[installIndex + 1];
		}

		return null;
	}

	/**
	 * Constrói o comando completo de instalação com flags necessárias
	 */
	private buildInstallCommand(packageId: string): string {
		const flags = [
			"--id",
			packageId,
			"--exact",
			"--silent",
			"--accept-package-agreements",
			"--accept-source-agreements",
		];

		return `${this.wingetCommand} install ${flags.join(" ")}`;
	}

	/**
	 * Traduz erros do WinGet para mensagens mais amigáveis
	 */
	private translateWinGetError(error: ShellError, tool: Tool): string {
		const stderr = error.stderr.toLowerCase();
		const stdout = error.stdout.toLowerCase();

		// Verifica se o pacote não existe
		if (
			stderr.includes("no package found") ||
			stderr.includes("no applicable package") ||
			stderr.includes("could not find")
		) {
			return `Pacote '${tool.name}' não encontrado no WinGet. Verifique se o ID está correto.`;
		}

		// Verifica problemas de conexão
		if (
			stderr.includes("timeout") ||
			stderr.includes("connection") ||
			stderr.includes("network") ||
			stderr.includes("failed to download")
		) {
			return `Falha de conexão ao tentar instalar '${tool.name}'. Verifique sua conexão com a internet.`;
		}

		// Verifica problemas de permissão
		if (
			stderr.includes("access denied") ||
			stderr.includes("permission") ||
			stderr.includes("administrator") ||
			stderr.includes("elevation")
		) {
			return `Permissão negada ao tentar instalar '${tool.name}'. Pode ser necessário executar com privilégios de administrador.`;
		}

		// Verifica se já está instalado
		if (
			stderr.includes("already installed") ||
			stdout.includes("already installed") ||
			error.exitCode === 0
		) {
			return `'${tool.name}' já está instalado ou a instalação foi concluída.`;
		}

		// Verifica se o usuário cancelou
		if (stderr.includes("cancelled") || stderr.includes("user cancelled")) {
			return `Instalação de '${tool.name}' foi cancelada pelo usuário.`;
		}

		// Erro genérico
		return `Erro ao instalar '${tool.name}': ${error.stderr || error.message}`;
	}
}

