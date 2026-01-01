import type { Tool } from "../../domain/entities/tool.js";
import type { IPackageManager } from "../../domain/interfaces/package-manager.js";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { HomebrewAdapter } from "../../infrastructure/package-managers/homebrew-adapter.js";
import { HomebrewInstaller } from "../../infrastructure/package-managers/homebrew-installer.js";
import { WinGetAdapter } from "../../infrastructure/package-managers/winget-adapter.js";
import { LinuxInstaller } from "../../infrastructure/package-managers/linux-installer.js";
import { getEnvironmentManager } from "../../infrastructure/environment/index.js";
import { shell } from "../../infrastructure/shell/index.js";
import * as p from "@clack/prompts";

/**
 * Resultado de uma tentativa de instalação
 */
export interface InstallationResult {
	/**
	 * Tool que foi processada
	 */
	tool: Tool;
	/**
	 * Se a instalação foi bem-sucedida
	 */
	success: boolean;
	/**
	 * Se a ferramenta já estava instalada (idempotência)
	 */
	alreadyInstalled: boolean;
	/**
	 * Mensagem de status
	 */
	message: string;
	/**
	 * Erro, se houver
	 */
	error?: string;
}

/**
 * Serviço de instalação de ferramentas
 * Gerencia a lógica de instalação com verificação de idempotência
 */
export class InstallationService {
	private packageManager: IPackageManager | null = null;

	/**
	 * Obtém o gerenciador de pacotes apropriado para o SO atual
	 */
	private async getPackageManager(): Promise<IPackageManager> {
		if (this.packageManager) {
			return this.packageManager;
		}

		const os = getCurrentOS();

		switch (os) {
			case "macos": {
				const adapter = new HomebrewAdapter();
				if (await adapter.isAvailable()) {
					this.packageManager = adapter;
					return adapter;
				}

				// Homebrew não está disponível - oferece instalação
				p.log.warn("⚠️  Homebrew não está instalado no sistema.");
				const shouldInstall = await p.confirm({
					message: "Deseja instalar o Homebrew agora? (Recomendado para macOS)",
					initialValue: true,
				});

				if (p.isCancel(shouldInstall) || !shouldInstall) {
					throw new Error(
						"Homebrew não está disponível e a instalação foi cancelada. Instale manualmente em https://brew.sh",
					);
				}

				// Tenta instalar/configurar o Homebrew
				const installed = await HomebrewInstaller.install();
				if (!installed) {
					// O usuário escolheu pular ou cancelar
					throw new Error(
						"Homebrew não está disponível. Algumas ferramentas podem não ser instaladas.",
					);
				}

				// Verifica novamente após instalação/configuração
				if (await adapter.isAvailable()) {
					this.packageManager = adapter;
					return adapter;
				}

				// Se ainda não estiver disponível, lança erro
				throw new Error(
					"Homebrew não está disponível no PATH. Reinicie o terminal ou adicione ao PATH manualmente.",
				);
			}
			case "windows": {
				const adapter = new WinGetAdapter();
				if (await adapter.isAvailable()) {
					this.packageManager = adapter;
					return adapter;
				}
				throw new Error("WinGet não está disponível no sistema");
			}
			case "linux": {
				// Usa o LinuxInstaller que detecta automaticamente
				// o tipo de instalação (APT, Snap, curl, etc.)
				const installer = new LinuxInstaller();
				if (await installer.isAvailable()) {
					this.packageManager = installer;
					return installer;
				}
				throw new Error("Sistema Linux não detectado");
			}
			default:
				throw new Error(`Sistema operacional não suportado: ${os}`);
		}
	}

	/**
	 * Verifica se uma ferramenta está instalada (Doctor Mode)
	 * Verifica diretamente no PATH, sem depender do package manager
	 */
	public async checkInstalled(tool: Tool): Promise<boolean> {
		try {
			// Verifica diretamente usando o comando de verificação da tool
			const result = await shell.executeString(tool.checkCommand, {
				silent: true,
			});
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	/**
	 * Instala uma ferramenta com verificação de idempotência e feedback visual
	 */
	public async installTool(tool: Tool, showProgress: boolean = true): Promise<InstallationResult> {
		const startTime = Date.now();

		// Verificação de idempotência (Doctor Mode) - verifica diretamente no PATH
		const isInstalled = await this.checkInstalled(tool);
		if (isInstalled) {
			if (showProgress) {
				p.log.success(`✓ ${tool.name} já está instalado`);
			}
			return {
				tool,
				success: true,
				alreadyInstalled: true,
				message: `${tool.name} já está instalado`,
			};
		}

		// Só obtém o package manager se realmente precisar instalar
		let pm: IPackageManager;
		try {
			pm = await this.getPackageManager();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				tool,
				success: false,
				alreadyInstalled: false,
				message: `Não foi possível instalar ${tool.name}`,
				error: errorMessage,
			};
		}

		// Mostra mensagem de início da instalação
		if (showProgress) {
			p.log.step(`Instalando ${tool.name}...`);
		}

		// Tenta instalar
		try {
			await pm.install(tool);
			const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

			// Atualiza o PATH do processo para permitir uso imediato da ferramenta
			this.refreshPathAfterInstall();

			if (showProgress) {
				p.log.success(`✓ ${tool.name} instalado com sucesso em ${elapsedTime}s`);
			}

			return {
				tool,
				success: true,
				alreadyInstalled: false,
				message: `${tool.name} instalado com sucesso em ${elapsedTime}s`,
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

			// Para ferramentas GUI, apenas registra aviso sem interromper o processo
			if (tool.isGUI) {
				p.log.warn(`⚠️  ${tool.name} - falha na instalação (${elapsedTime}s) - continuando...`);
			} else {
				p.log.error(`✗ Falha ao instalar ${tool.name} (${elapsedTime}s)`);
			}

			return {
				tool,
				success: false,
				alreadyInstalled: false,
				message: `Falha ao instalar ${tool.name}`,
				error: errorMessage,
			};
		}
	}

	/**
	 * Instala múltiplas ferramentas com feedback visual
	 */
	public async installTools(tools: Tool[], showProgress: boolean = true): Promise<InstallationResult[]> {
		const results: InstallationResult[] = [];

		if (showProgress && tools.length > 0) {
			p.log.info(`\n📦 Iniciando instalação de ${tools.length} ferramenta(s)...\n`);
		}

		for (const tool of tools) {
			const result = await this.installTool(tool, showProgress);
			results.push(result);
		}

		if (showProgress) {
			const successful = results.filter((r) => r.success).length;
			const failed = results.filter((r) => !r.success).length;
			const skipped = results.filter((r) => r.alreadyInstalled).length;

			p.log.info("\n");
			p.log.info(`✅ Concluído: ${successful} instalada(s), ${skipped} já instalada(s), ${failed} falha(s)`);
		}

		return results;
	}

	/**
	 * Atualiza o cache do gerenciador de pacotes
	 */
	public async updatePackageManager(): Promise<void> {
		const pm = await this.getPackageManager();
		await pm.update();
	}

	/**
	 * Atualiza o PATH do processo para incluir diretórios comuns de instalação
	 * Isso permite que ferramentas recém-instaladas sejam usadas imediatamente
	 */
	private refreshPathAfterInstall(): void {
		const os = getCurrentOS();
		const envManager = getEnvironmentManager();

		// Adiciona diretórios comuns de instalação ao PATH do processo
		const commonPaths: string[] = [];

		switch (os) {
			case "macos":
				commonPaths.push(
					"/opt/homebrew/bin", // Apple Silicon
					"/usr/local/bin", // Intel
					"/opt/homebrew/sbin",
					"/usr/local/sbin"
				);
				break;
			case "linux":
				commonPaths.push(
					"/home/linuxbrew/.linuxbrew/bin",
					"/usr/local/bin",
					"/snap/bin"
				);
				break;
			case "windows":
				// Windows geralmente não precisa de atualização manual
				// O instalador já configura o PATH
				break;
		}

		// Adiciona cada caminho se não estiver no PATH
		for (const path of commonPaths) {
			if (!envManager.isInPath(path)) {
				envManager.refreshProcessPath(path);
			}
		}
	}
}

