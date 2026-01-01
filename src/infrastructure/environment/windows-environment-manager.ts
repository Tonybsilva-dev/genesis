import { execSync } from "child_process";
import type {
	IEnvironmentManager,
	EnvironmentResult,
	ShellInfo,
} from "../../domain/interfaces/environment-manager.js";

/**
 * Gerenciador de variáveis de ambiente para Windows
 * Usa setx para persistência no registro do sistema
 */
export class WindowsEnvironmentManager implements IEnvironmentManager {
	/**
	 * Detecta o shell atual do usuário
	 */
	public async detectShell(): Promise<ShellInfo> {
		// No Windows, detectamos PowerShell ou CMD
		const comspec = process.env.ComSpec || "";
		const psModulePath = process.env.PSModulePath;

		let shell: ShellInfo["shell"] = "cmd";

		if (psModulePath) {
			shell = "powershell";
		} else if (comspec.toLowerCase().includes("cmd.exe")) {
			shell = "cmd";
		}

		return {
			shell,
			configFile: "", // Windows usa registro em vez de arquivo
			os: "windows",
		};
	}

	/**
	 * Adiciona um diretório ao PATH de forma persistente
	 */
	public async addToPath(path: string): Promise<EnvironmentResult> {
		// Verifica se já está no PATH
		if (this.isInPath(path)) {
			return {
				success: true,
				message: `${path} já está no PATH`,
				requiresRestart: false,
			};
		}

		try {
			// Obtém o PATH atual do usuário
			const currentPath = this.getUserPath();

			// Verifica o limite de caracteres do setx (1024 para variáveis de usuário)
			const newPath = `${currentPath};${path}`;
			if (newPath.length > 1024) {
				return {
					success: false,
					message:
						"O PATH excede o limite de 1024 caracteres do setx. Considere remover entradas antigas.",
				};
			}

			// Usa setx para persistir no registro do usuário
			execSync(`setx PATH "${newPath}"`, {
				stdio: "ignore",
				windowsHide: true,
			});

			// Atualiza o PATH do processo atual
			this.refreshProcessPath(path);

			return {
				success: true,
				message: `${path} adicionado ao PATH do usuário`,
				requiresRestart: true,
			};
		} catch (error) {
			return {
				success: false,
				message: `Erro ao adicionar ao PATH: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * Define uma variável de ambiente de forma persistente
	 */
	public async setVariable(
		name: string,
		value: string
	): Promise<EnvironmentResult> {
		try {
			// Verifica o limite de caracteres do setx
			if (value.length > 1024) {
				return {
					success: false,
					message: `O valor da variável ${name} excede o limite de 1024 caracteres do setx`,
				};
			}

			// Usa setx para persistir no registro do usuário
			execSync(`setx ${name} "${value}"`, {
				stdio: "ignore",
				windowsHide: true,
			});

			// Atualiza o processo atual
			process.env[name] = value;

			return {
				success: true,
				message: `Variável ${name} definida no registro do usuário`,
				requiresRestart: true,
			};
		} catch (error) {
			return {
				success: false,
				message: `Erro ao definir variável: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * Remove uma variável de ambiente
	 * Nota: setx não suporta remoção direta, então definimos como vazio
	 */
	public async removeVariable(name: string): Promise<EnvironmentResult> {
		try {
			// No Windows, não há uma forma simples de remover uma variável via setx
			// A alternativa é usar PowerShell para remover do registro
			const psCommand = `[Environment]::SetEnvironmentVariable('${name}', $null, 'User')`;

			execSync(`powershell -Command "${psCommand}"`, {
				stdio: "ignore",
				windowsHide: true,
			});

			// Remove do processo atual
			delete process.env[name];

			return {
				success: true,
				message: `Variável ${name} removida do registro do usuário`,
				requiresRestart: true,
			};
		} catch (error) {
			return {
				success: false,
				message: `Erro ao remover variável: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * Obtém o valor de uma variável de ambiente
	 */
	public async getVariable(name: string): Promise<string | undefined> {
		return process.env[name];
	}

	/**
	 * Atualiza o PATH do processo atual
	 */
	public refreshProcessPath(path: string): void {
		const currentPath = process.env.PATH || "";
		const separator = ";";
		if (!currentPath.split(separator).includes(path)) {
			process.env.PATH = `${path}${separator}${currentPath}`;
		}
	}

	/**
	 * Verifica se um caminho já está no PATH
	 */
	public isInPath(path: string): boolean {
		const currentPath = process.env.PATH || "";
		const separator = ";";
		// Normaliza os caminhos para comparação case-insensitive no Windows
		const normalizedPath = path.toLowerCase().replace(/\//g, "\\");
		return currentPath
			.split(separator)
			.some(
				(p) => p.toLowerCase().replace(/\//g, "\\") === normalizedPath
			);
	}

	/**
	 * Obtém o PATH do usuário do registro
	 */
	private getUserPath(): string {
		try {
			// Usa PowerShell para obter o PATH do usuário do registro
			const psCommand = `[Environment]::GetEnvironmentVariable('PATH', 'User')`;
			const result = execSync(`powershell -Command "${psCommand}"`, {
				encoding: "utf-8",
				windowsHide: true,
			});
			return result.trim();
		} catch {
			// Fallback para o PATH do processo atual
			return process.env.PATH || "";
		}
	}
}

