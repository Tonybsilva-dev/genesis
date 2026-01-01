import type { OperatingSystem } from "../types/os.js";

/**
 * Resultado da operação de variável de ambiente
 */
export interface EnvironmentResult {
	success: boolean;
	message: string;
	requiresRestart?: boolean;
}

/**
 * Informações sobre o shell do usuário
 */
export interface ShellInfo {
	shell: "bash" | "zsh" | "fish" | "powershell" | "cmd" | "unknown";
	configFile: string;
	os: OperatingSystem;
}

/**
 * Interface para gerenciamento de variáveis de ambiente cross-platform
 */
export interface IEnvironmentManager {
	/**
	 * Detecta o shell atual do usuário
	 */
	detectShell(): Promise<ShellInfo>;

	/**
	 * Adiciona um diretório ao PATH de forma persistente
	 * @param path Caminho a ser adicionado ao PATH
	 */
	addToPath(path: string): Promise<EnvironmentResult>;

	/**
	 * Define uma variável de ambiente de forma persistente
	 * @param name Nome da variável
	 * @param value Valor da variável
	 */
	setVariable(name: string, value: string): Promise<EnvironmentResult>;

	/**
	 * Remove uma variável de ambiente
	 * @param name Nome da variável
	 */
	removeVariable(name: string): Promise<EnvironmentResult>;

	/**
	 * Obtém o valor de uma variável de ambiente
	 * @param name Nome da variável
	 */
	getVariable(name: string): Promise<string | undefined>;

	/**
	 * Atualiza o PATH do processo atual (sem persistência)
	 * Útil para usar ferramentas recém-instaladas na mesma sessão
	 * @param path Caminho a ser adicionado ao PATH do processo
	 */
	refreshProcessPath(path: string): void;

	/**
	 * Verifica se um caminho já está no PATH
	 * @param path Caminho a verificar
	 */
	isInPath(path: string): boolean;
}

