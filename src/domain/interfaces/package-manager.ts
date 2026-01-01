import type { Tool } from "../entities/tool.js";

/**
 * Interface para gerenciadores de pacotes
 * Segue o padrão Adapter para abstrair diferentes gerenciadores (Homebrew, WinGet, APT)
 */
export interface IPackageManager {
	/**
	 * Instala uma ferramenta
	 * @param tool - Ferramenta a ser instalada
	 * @throws Erro se a instalação falhar
	 */
	install(tool: Tool): Promise<void>;

	/**
	 * Verifica se uma ferramenta já está instalada
	 * @param tool - Ferramenta a ser verificada
	 * @returns true se a ferramenta estiver instalada, false caso contrário
	 */
	isInstalled(tool: Tool): Promise<boolean>;

	/**
	 * Atualiza o cache/repositório do gerenciador de pacotes
	 * @throws Erro se a atualização falhar
	 */
	update(): Promise<void>;

	/**
	 * Verifica se o gerenciador de pacotes está disponível no sistema
	 * @returns true se o gerenciador estiver disponível, false caso contrário
	 */
	isAvailable(): Promise<boolean>;
}

