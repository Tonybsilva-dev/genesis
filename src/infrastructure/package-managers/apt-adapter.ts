import type { IPackageManager } from "../../domain/interfaces/package-manager.js";
import type { Tool } from "../../domain/entities/tool.js";
import { getInstallCommand } from "../../domain/entities/tool.js";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { shell } from "../shell/index.js";
import { ShellError } from "../shell/shell-error.js";
import { SudoExecutor } from "../auth/index.js";

/**
 * Erro específico quando o APT não está disponível
 */
export class APTNotAvailableError extends Error {
	constructor() {
		super("APT não está disponível. Este adapter requer Ubuntu/Debian.");
		this.name = "APTNotAvailableError";
	}
}

/**
 * Implementação do IPackageManager para APT (Ubuntu/Debian)
 */
export class APTAdapter implements IPackageManager {
	private readonly aptCommand = "apt-get";
	private updateExecuted = false;

	/**
	 * Verifica se o APT está disponível no sistema
	 */
	public async isAvailable(): Promise<boolean> {
		if (getCurrentOS() !== "linux") {
			return false;
		}

		try {
			const result = await shell.executeString(`which ${this.aptCommand}`, {
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
	 * Atualiza o cache do APT
	 */
	public async update(): Promise<void> {
		if (!(await this.isAvailable())) {
			throw new APTNotAvailableError();
		}

		// Solicita privilégios de forma amigável antes de executar
		const hasPrivileges = await SudoExecutor.requestPrivileges();
		if (!hasPrivileges) {
			throw new Error("Privilégios de administrador necessários para atualizar o APT.");
		}

		const result = await SudoExecutor.exec(`${this.aptCommand} update`);
		if (!result.success) {
			throw new Error(`Falha ao atualizar cache do APT: ${result.stderr}`);
		}
		this.updateExecuted = true;
	}

	/**
	 * Instala uma ferramenta usando APT
	 */
	public async install(tool: Tool): Promise<void> {
		if (!(await this.isAvailable())) {
			throw new APTNotAvailableError();
		}

		const os = getCurrentOS();
		if (os !== "linux") {
			throw new Error("APTAdapter só pode ser usado no Linux");
		}

		// Executa update se ainda não foi executado
		if (!this.updateExecuted) {
			await this.update();
		}

		// Obtém o comando de instalação para Linux
		const installCommand = getInstallCommand(tool, os);
		if (!installCommand) {
			throw new Error(`Ferramenta ${tool.name} não possui comando de instalação para Linux`);
		}

		// Constrói o comando completo com flags de instalação silenciosa
		const fullCommand = this.buildInstallCommand(installCommand);

		// Remove o "sudo" do início se existir, pois o SudoExecutor vai adicionar
		const commandWithoutSudo = fullCommand.replace(/^sudo\s+/, "");

		// Executa usando o SudoExecutor para gerenciamento de privilégios
		const result = await SudoExecutor.exec(commandWithoutSudo);
		if (!result.success) {
			throw new Error(this.translateAPTErrorMessage(result.stderr, tool));
		}
	}

	/**
	 * Constrói o comando completo de instalação com flags necessárias
	 */
	private buildInstallCommand(baseCommand: string): string {
		// Se o comando já contém sudo, não adiciona novamente
		if (baseCommand.trim().startsWith("sudo")) {
			// Adiciona DEBIAN_FRONTEND=noninteractive e flag -y se não estiver presente
			if (!baseCommand.includes("DEBIAN_FRONTEND=noninteractive")) {
				baseCommand = `DEBIAN_FRONTEND=noninteractive ${baseCommand}`;
			}
			if (!baseCommand.includes(" -y ") && !baseCommand.endsWith(" -y")) {
				// Insere -y antes do nome do pacote
				baseCommand = baseCommand.replace(/(install\s+)([^-])/, "$1-y $2");
			}
			return baseCommand;
		}

		// Se não contém sudo, adiciona
		const packageName = this.extractPackageName(baseCommand);
		return `DEBIAN_FRONTEND=noninteractive sudo ${this.aptCommand} install -y ${packageName}`;
	}

	/**
	 * Extrai o nome do pacote do comando
	 */
	private extractPackageName(command: string): string {
		// Remove sudo se presente
		let cleanCommand = command.replace(/^sudo\s+/, "");
		
		// Remove apt-get install se presente
		cleanCommand = cleanCommand.replace(/apt-get\s+install\s+(-y\s+)?/i, "");
		
		// Remove flags comuns
		cleanCommand = cleanCommand.replace(/-y\s+/g, "");
		cleanCommand = cleanCommand.replace(/DEBIAN_FRONTEND=noninteractive\s+/g, "");
		
		return cleanCommand.trim();
	}

	/**
	 * Traduz mensagem de erro do APT para mensagem mais amigável
	 */
	private translateAPTErrorMessage(stderr: string, tool: Tool): string {
		const lowerStderr = stderr.toLowerCase();

		if (lowerStderr.includes("unable to locate package") || lowerStderr.includes("package not found")) {
			return `Pacote '${tool.name}' não encontrado nos repositórios APT.`;
		}

		if (lowerStderr.includes("failed to fetch") || lowerStderr.includes("temporary failure")) {
			return `Falha de conexão ao tentar instalar '${tool.name}'. Verifique sua conexão.`;
		}

		if (lowerStderr.includes("permission denied") || lowerStderr.includes("are you root")) {
			return `Permissão negada ao tentar instalar '${tool.name}'.`;
		}

		return `Falha ao instalar '${tool.name}': ${stderr}`;
	}

	/**
	 * Traduz erros do APT para mensagens mais amigáveis
	 */
	private translateAPTError(error: ShellError, tool: Tool): string {
		const stderr = error.stderr.toLowerCase();
		const stdout = error.stdout.toLowerCase();

		// Verifica se o pacote não existe
		if (
			stderr.includes("unable to locate package") ||
			stderr.includes("package not found") ||
			stderr.includes("could not find")
		) {
			return `Pacote '${tool.name}' não encontrado nos repositórios APT. Pode ser necessário adicionar um PPA ou repositório externo.`;
		}

		// Verifica problemas de conexão
		if (
			stderr.includes("failed to fetch") ||
			stderr.includes("temporary failure") ||
			stderr.includes("connection") ||
			stderr.includes("network")
		) {
			return `Falha de conexão ao tentar instalar '${tool.name}'. Verifique sua conexão com a internet e os repositórios APT.`;
		}

		// Verifica problemas de permissão
		if (
			stderr.includes("permission denied") ||
			stderr.includes("are you root") ||
			stderr.includes("sudo")
		) {
			return `Permissão negada ao tentar instalar '${tool.name}'. É necessário executar com privilégios de administrador (sudo).`;
		}

		// Verifica se já está instalado
		if (
			stderr.includes("is already the newest version") ||
			stdout.includes("is already the newest version") ||
			error.exitCode === 0
		) {
			return `'${tool.name}' já está instalado na versão mais recente.`;
		}

		// Verifica conflitos de dependências
		if (
			stderr.includes("dependency problems") ||
			stderr.includes("broken packages") ||
			stderr.includes("unmet dependencies")
		) {
			return `Problemas de dependências ao tentar instalar '${tool.name}'. Execute 'sudo apt-get install -f' para corrigir.`;
		}

		// Erro genérico
		return `Erro ao instalar '${tool.name}': ${error.stderr || error.message}`;
	}
}

