import { homedir } from "os";
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import type {
	IEnvironmentManager,
	EnvironmentResult,
	ShellInfo,
} from "../../domain/interfaces/environment-manager.js";

/**
 * Gerenciador de variáveis de ambiente para sistemas Unix (macOS/Linux)
 * Suporta Bash, Zsh e Fish
 */
export class UnixEnvironmentManager implements IEnvironmentManager {
	private shellInfo: ShellInfo | null = null;

	/**
	 * Detecta o shell atual do usuário
	 */
	public async detectShell(): Promise<ShellInfo> {
		if (this.shellInfo) {
			return this.shellInfo;
		}

		const home = homedir();
		const shellEnv = process.env.SHELL || "";

		let shell: ShellInfo["shell"] = "unknown";
		let configFile = "";

		// Detecta o shell baseado na variável $SHELL
		if (shellEnv.includes("zsh")) {
			shell = "zsh";
			// Zsh pode usar .zshrc ou .zprofile
			const zshrc = join(home, ".zshrc");
			const zprofile = join(home, ".zprofile");
			// Preferimos .zshrc para shells interativos
			configFile = existsSync(zshrc) ? zshrc : zprofile;
			if (!existsSync(configFile)) {
				configFile = zshrc; // Cria .zshrc se nenhum existir
			}
		} else if (shellEnv.includes("bash")) {
			shell = "bash";
			// Bash pode usar .bashrc, .bash_profile ou .profile
			const bashrc = join(home, ".bashrc");
			const bashProfile = join(home, ".bash_profile");
			const profile = join(home, ".profile");

			// macOS usa .bash_profile, Linux usa .bashrc
			if (process.platform === "darwin") {
				configFile = existsSync(bashProfile) ? bashProfile : bashrc;
			} else {
				configFile = existsSync(bashrc) ? bashrc : bashProfile;
			}
			if (!existsSync(configFile)) {
				configFile = bashrc;
			}
		} else if (shellEnv.includes("fish")) {
			shell = "fish";
			configFile = join(home, ".config", "fish", "config.fish");
		}

		// Determina o OS
		const os = process.platform === "darwin" ? "macos" : "linux";

		this.shellInfo = { shell, configFile, os };
		return this.shellInfo;
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

		const shellInfo = await this.detectShell();

		if (shellInfo.shell === "unknown" || !shellInfo.configFile) {
			return {
				success: false,
				message: "Não foi possível detectar o shell do usuário",
			};
		}

		try {
			// Gera o comando de export apropriado
			const exportLine = this.generateExportLine(path, shellInfo.shell);

			// Verifica se a linha já existe no arquivo
			if (existsSync(shellInfo.configFile)) {
				const content = readFileSync(shellInfo.configFile, "utf-8");
				if (content.includes(path)) {
					return {
						success: true,
						message: `${path} já está configurado em ${shellInfo.configFile}`,
						requiresRestart: false,
					};
				}
			}

			// Adiciona a linha ao arquivo de configuração
			const lineToAdd = `\n# Adicionado por Genesis\n${exportLine}\n`;
			appendFileSync(shellInfo.configFile, lineToAdd);

			// Atualiza o PATH do processo atual
			this.refreshProcessPath(path);

			return {
				success: true,
				message: `${path} adicionado ao PATH em ${shellInfo.configFile}`,
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
		const shellInfo = await this.detectShell();

		if (shellInfo.shell === "unknown" || !shellInfo.configFile) {
			return {
				success: false,
				message: "Não foi possível detectar o shell do usuário",
			};
		}

		try {
			// Gera o comando de export apropriado
			const exportLine = this.generateVariableExport(
				name,
				value,
				shellInfo.shell
			);

			// Verifica se a variável já existe no arquivo
			if (existsSync(shellInfo.configFile)) {
				const content = readFileSync(shellInfo.configFile, "utf-8");
				const regex = new RegExp(`^export\\s+${name}=`, "m");

				if (regex.test(content)) {
					// Atualiza o valor existente
					const updatedContent = content.replace(
						new RegExp(`^export\\s+${name}=.*$`, "m"),
						exportLine
					);
					writeFileSync(shellInfo.configFile, updatedContent);
				} else {
					// Adiciona nova variável
					const lineToAdd = `\n# ${name} - Adicionado por Genesis\n${exportLine}\n`;
					appendFileSync(shellInfo.configFile, lineToAdd);
				}
			} else {
				// Cria o arquivo com a variável
				const content = `# Configurado por Genesis\n${exportLine}\n`;
				writeFileSync(shellInfo.configFile, content);
			}

			// Atualiza o processo atual
			process.env[name] = value;

			return {
				success: true,
				message: `Variável ${name} definida em ${shellInfo.configFile}`,
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
	 */
	public async removeVariable(name: string): Promise<EnvironmentResult> {
		const shellInfo = await this.detectShell();

		if (shellInfo.shell === "unknown" || !shellInfo.configFile) {
			return {
				success: false,
				message: "Não foi possível detectar o shell do usuário",
			};
		}

		try {
			if (!existsSync(shellInfo.configFile)) {
				return {
					success: true,
					message: `Variável ${name} não encontrada`,
				};
			}

			const content = readFileSync(shellInfo.configFile, "utf-8");

			// Remove a linha de export e o comentário associado
			const regex = new RegExp(
				`(# ${name} - Adicionado por Genesis\\n)?export\\s+${name}=.*\\n?`,
				"g"
			);
			const updatedContent = content.replace(regex, "");

			writeFileSync(shellInfo.configFile, updatedContent);

			// Remove do processo atual
			delete process.env[name];

			return {
				success: true,
				message: `Variável ${name} removida de ${shellInfo.configFile}`,
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
		if (!currentPath.split(":").includes(path)) {
			process.env.PATH = `${path}:${currentPath}`;
		}
	}

	/**
	 * Verifica se um caminho já está no PATH
	 */
	public isInPath(path: string): boolean {
		const currentPath = process.env.PATH || "";
		return currentPath.split(":").includes(path);
	}

	/**
	 * Gera a linha de export para adicionar ao PATH
	 */
	private generateExportLine(
		path: string,
		shell: ShellInfo["shell"]
	): string {
		if (shell === "fish") {
			return `set -gx PATH "${path}" $PATH`;
		}
		// Bash e Zsh usam a mesma sintaxe
		return `export PATH="${path}:$PATH"`;
	}

	/**
	 * Gera a linha de export para uma variável
	 */
	private generateVariableExport(
		name: string,
		value: string,
		shell: ShellInfo["shell"]
	): string {
		if (shell === "fish") {
			return `set -gx ${name} "${value}"`;
		}
		// Bash e Zsh usam a mesma sintaxe
		return `export ${name}="${value}"`;
	}
}

