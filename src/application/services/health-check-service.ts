import type { Tool } from "../../domain/entities/tool.js";
import { InstallationService } from "./installation-service.js";
import { shell } from "../../infrastructure/shell/index.js";
import { getCurrentOS } from "../../domain/services/os-detector.js";

/**
 * Resultado da verificação de saúde de uma ferramenta
 */
export interface HealthCheckResult {
	/**
	 * Tool verificada
	 */
	tool: Tool;
	/**
	 * Se a ferramenta está instalada e acessível
	 */
	isInstalled: boolean;
	/**
	 * Caminho do binário (se encontrado)
	 */
	binaryPath?: string;
	/**
	 * Versão da ferramenta (se disponível)
	 */
	version?: string;
	/**
	 * Mensagem de status
	 */
	message: string;
}

/**
 * Serviço de verificação de saúde (Doctor Mode)
 * Valida se as ferramentas instaladas estão acessíveis no PATH
 */
export class HealthCheckService {
	private installationService: InstallationService;

	constructor() {
		this.installationService = new InstallationService();
	}

	/**
	 * Verifica a saúde de uma ferramenta
	 */
	public async checkTool(tool: Tool): Promise<HealthCheckResult> {
		const isInstalled = await this.installationService.checkInstalled(tool);

		if (!isInstalled) {
			return {
				tool,
				isInstalled: false,
				message: "Não instalado ou não encontrado no PATH",
			};
		}

		// Tenta obter o caminho do binário
		let binaryPath: string | undefined;
		let version: string | undefined;

		try {
			const os = getCurrentOS();
			let pathCommand: string;

			if (os === "windows") {
				pathCommand = `where ${tool.name.toLowerCase()}`;
			} else {
				// Extrai o nome do comando do checkCommand
				const commandMatch = tool.checkCommand.match(/command -v (\w+)/);
				const commandName = commandMatch ? commandMatch[1] : tool.name.toLowerCase();
				pathCommand = `which ${commandName}`;
			}

			const pathResult = await shell.executeString(pathCommand, { silent: true });
			if (pathResult.exitCode === 0 && pathResult.stdout.trim()) {
				binaryPath = pathResult.stdout.trim().split("\n")[0];
			}

			// Tenta obter a versão (comando genérico --version ou -v)
			try {
				const versionCommands = [`${tool.name.toLowerCase()} --version`, `${tool.name.toLowerCase()} -v`];
				for (const versionCmd of versionCommands) {
					const versionResult = await shell.executeString(versionCmd, { silent: true });
					if (versionResult.exitCode === 0 && versionResult.stdout.trim()) {
						version = versionResult.stdout.trim().split("\n")[0].substring(0, 50); // Limita tamanho
						break;
					}
				}
			} catch {
				// Ignora erros ao obter versão
			}
		} catch {
			// Ignora erros ao obter caminho
		}

		return {
			tool,
			isInstalled: true,
			binaryPath,
			version,
			message: binaryPath ? `Instalado em: ${binaryPath}` : "Instalado (caminho não detectado)",
		};
	}

	/**
	 * Verifica a saúde de múltiplas ferramentas
	 */
	public async checkTools(tools: Tool[]): Promise<HealthCheckResult[]> {
		const results: HealthCheckResult[] = [];

		for (const tool of tools) {
			const result = await this.checkTool(tool);
			results.push(result);
		}

		return results;
	}
}

