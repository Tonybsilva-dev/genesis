import type { IPackageManager } from "../../domain/interfaces/package-manager.js";
import type { Tool } from "../../domain/entities/tool.js";
import { getInstallCommand } from "../../domain/entities/tool.js";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { shell } from "../shell/index.js";
import { SudoExecutor } from "../auth/index.js";

/**
 * Tipo de comando de instalação detectado
 */
type InstallType = "apt" | "snap" | "curl" | "wget" | "flatpak" | "direct";

/**
 * Instalador universal para Linux
 * Detecta automaticamente o tipo de comando e executa da forma correta
 */
export class LinuxInstaller implements IPackageManager {
	private aptUpdateExecuted = false;

	/**
	 * Verifica se estamos no Linux
	 */
	public async isAvailable(): Promise<boolean> {
		return getCurrentOS() === "linux";
	}

	/**
	 * Verifica se uma ferramenta está instalada
	 */
	public async isInstalled(tool: Tool): Promise<boolean> {
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
	 * Atualiza o cache do APT (se necessário)
	 */
	public async update(): Promise<void> {
		if (this.aptUpdateExecuted) {
			return;
		}

		// Verifica se APT está disponível
		try {
			const result = await shell.executeString("which apt-get", { silent: true });
			if (result.exitCode !== 0) {
				return; // APT não disponível, não precisa atualizar
			}
		} catch {
			return;
		}

		// Solicita privilégios
		const hasPrivileges = await SudoExecutor.requestPrivileges();
		if (!hasPrivileges) {
			throw new Error("Privilégios de administrador necessários para atualizar o APT.");
		}

		const result = await SudoExecutor.exec("apt-get update");
		if (!result.success) {
			// Não falha completamente, apenas avisa
			console.warn("⚠️  Aviso: Não foi possível atualizar cache do APT");
		}
		this.aptUpdateExecuted = true;
	}

	/**
	 * Instala uma ferramenta no Linux
	 * Detecta automaticamente o tipo de instalação
	 */
	public async install(tool: Tool): Promise<void> {
		const os = getCurrentOS();
		if (os !== "linux") {
			throw new Error("LinuxInstaller só pode ser usado no Linux");
		}

		// Obtém o comando de instalação
		const installCommand = getInstallCommand(tool, os);
		if (!installCommand) {
			throw new Error(`Ferramenta ${tool.name} não possui comando de instalação para Linux`);
		}

		// Detecta o tipo de instalação
		const installType = this.detectInstallType(installCommand);

		// Executa baseado no tipo
		switch (installType) {
			case "apt":
				await this.installWithApt(tool, installCommand);
				break;
			case "snap":
				await this.installWithSnap(tool, installCommand);
				break;
			case "flatpak":
				await this.installWithFlatpak(tool, installCommand);
				break;
			case "curl":
			case "wget":
				await this.installWithScript(tool, installCommand);
				break;
			case "direct":
				await this.installDirect(tool, installCommand);
				break;
		}
	}

	/**
	 * Detecta o tipo de comando de instalação
	 */
	private detectInstallType(command: string): InstallType {
		const lowerCommand = command.toLowerCase();

		if (lowerCommand.includes("apt-get install") || lowerCommand.includes("apt install")) {
			return "apt";
		}

		if (lowerCommand.includes("snap install")) {
			return "snap";
		}

		if (lowerCommand.includes("flatpak install")) {
			return "flatpak";
		}

		if (lowerCommand.includes("curl")) {
			return "curl";
		}

		if (lowerCommand.includes("wget")) {
			return "wget";
		}

		return "direct";
	}

	/**
	 * Instalação via APT
	 */
	private async installWithApt(tool: Tool, command: string): Promise<void> {
		// Atualiza cache do APT se ainda não foi feito
		if (!this.aptUpdateExecuted) {
			await this.update();
		}

		// Remove sudo do comando se existir (SudoExecutor vai adicionar)
		let cleanCommand = command.replace(/^sudo\s+/, "");

		// Adiciona flags não-interativas se não existirem
		if (!cleanCommand.includes("DEBIAN_FRONTEND=noninteractive")) {
			cleanCommand = `DEBIAN_FRONTEND=noninteractive ${cleanCommand}`;
		}

		if (!cleanCommand.includes(" -y ") && !cleanCommand.includes(" -y")) {
			cleanCommand = cleanCommand.replace(/(install\s+)([^-])/, "$1-y $2");
		}

		const result = await SudoExecutor.exec(cleanCommand);
		if (!result.success) {
			throw new Error(this.translateError(result.stderr, tool));
		}
	}

	/**
	 * Instalação via Snap
	 */
	private async installWithSnap(tool: Tool, command: string): Promise<void> {
		// Verifica se o Snap está disponível
		const snapCheck = await shell.executeString("which snap", { silent: true });
		if (snapCheck.exitCode !== 0) {
			throw new Error(`Snap não está instalado. Execute: sudo apt install snapd`);
		}

		// Remove sudo do comando se existir
		const cleanCommand = command.replace(/^sudo\s+/, "");

		const result = await SudoExecutor.exec(cleanCommand);
		if (!result.success) {
			throw new Error(this.translateError(result.stderr, tool));
		}
	}

	/**
	 * Instalação via Flatpak
	 */
	private async installWithFlatpak(tool: Tool, command: string): Promise<void> {
		// Verifica se o Flatpak está disponível
		const flatpakCheck = await shell.executeString("which flatpak", { silent: true });
		if (flatpakCheck.exitCode !== 0) {
			throw new Error(`Flatpak não está instalado. Execute: sudo apt install flatpak`);
		}

		// Remove sudo do comando se existir
		const cleanCommand = command.replace(/^sudo\s+/, "");

		const result = await SudoExecutor.exec(cleanCommand);
		if (!result.success) {
			throw new Error(this.translateError(result.stderr, tool));
		}
	}

	/**
	 * Instalação via script (curl, wget)
	 */
	private async installWithScript(tool: Tool, command: string): Promise<void> {
		try {
			// Scripts geralmente não precisam de sudo na execução inicial
			// mas podem pedir durante a execução
			const result = await shell.executeInteractive(command);

			// Verifica se a instalação foi bem-sucedida verificando se a ferramenta existe
			const checkResult = await shell.executeString(tool.checkCommand, { silent: true });
			if (checkResult.exitCode !== 0) {
				// Algumas instalações via script precisam de source do shell profile
				console.warn(
					`⚠️  ${tool.name} instalado, mas pode ser necessário reiniciar o terminal ou executar: source ~/.bashrc`
				);
			}
		} catch (error) {
			throw new Error(
				`Falha ao instalar ${tool.name} via script: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * Instalação direta (comando genérico)
	 */
	private async installDirect(tool: Tool, command: string): Promise<void> {
		// Verifica se precisa de sudo
		const needsSudo = command.toLowerCase().includes("sudo");
		const cleanCommand = command.replace(/^sudo\s+/, "");

		let result;
		if (needsSudo) {
			result = await SudoExecutor.exec(cleanCommand);
		} else {
			const shellResult = await shell.executeString(command, { silent: false });
			result = {
				success: shellResult.exitCode === 0,
				stderr: shellResult.stderr,
				stdout: shellResult.stdout,
				exitCode: shellResult.exitCode,
			};
		}

		if (!result.success) {
			throw new Error(this.translateError(result.stderr, tool));
		}
	}

	/**
	 * Traduz mensagens de erro para mensagens mais amigáveis
	 */
	private translateError(stderr: string, tool: Tool): string {
		const lowerStderr = stderr.toLowerCase();

		// Erros APT
		if (lowerStderr.includes("unable to locate package") || lowerStderr.includes("package not found")) {
			return `Pacote '${tool.name}' não encontrado nos repositórios. Pode ser necessário adicionar um PPA ou usar outro método de instalação.`;
		}

		if (lowerStderr.includes("failed to fetch") || lowerStderr.includes("temporary failure")) {
			return `Falha de conexão ao tentar instalar '${tool.name}'. Verifique sua conexão com a internet.`;
		}

		// Erros Snap
		if (lowerStderr.includes("snap") && lowerStderr.includes("not found")) {
			return `Snap '${tool.name}' não encontrado no Snap Store.`;
		}

		if (lowerStderr.includes("permission denied")) {
			return `Permissão negada ao tentar instalar '${tool.name}'. Tente executar com sudo.`;
		}

		// Erro genérico
		return `Falha ao instalar '${tool.name}': ${stderr || "Erro desconhecido"}`;
	}
}

