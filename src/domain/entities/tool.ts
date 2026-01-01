import type { OperatingSystem } from "../types/os.js";

/**
 * Comandos de instalação específicos por sistema operacional
 */
export interface InstallationCommands {
	/**
	 * Comando de instalação para macOS (darwin)
	 */
	macos?: string;
	/**
	 * Comando de instalação para Windows (win32)
	 */
	windows?: string;
	/**
	 * Comando de instalação para Linux/Ubuntu
	 */
	linux?: string;
}

/**
 * Entidade Tool - Representa uma ferramenta que pode ser instalada
 */
export interface Tool {
	/**
	 * Identificador único da ferramenta
	 */
	id: string;
	/**
	 * Nome da ferramenta
	 */
	name: string;
	/**
	 * Comando para verificar se a ferramenta já está instalada (idempotência)
	 * Deve retornar exit code 0 se instalada, diferente de 0 caso contrário
	 * Exemplo: "command -v git" ou "where git"
	 */
	checkCommand: string;
	/**
	 * Comandos de instalação específicos por sistema operacional
	 * Deve conter pelo menos um comando para um dos SOs suportados
	 */
	installCommands: InstallationCommands;
	/**
	 * ID da categoria à qual esta ferramenta pertence
	 */
	categoryId: string;
	/**
	 * Descrição opcional da ferramenta
	 */
	description?: string;
	/**
	 * Se true, indica que é uma aplicação GUI (requer tratamento especial em alguns gerenciadores)
	 */
	isGUI?: boolean;
}

/**
 * Valida se uma Tool tem comandos de instalação válidos
 */
export function validateTool(tool: Tool): boolean {
	const { installCommands } = tool;
	return !!(installCommands.macos || installCommands.windows || installCommands.linux);
}

/**
 * Obtém o comando de instalação para um sistema operacional específico
 */
export function getInstallCommand(tool: Tool, os: OperatingSystem): string | undefined {
	switch (os) {
		case "macos":
			return tool.installCommands.macos;
		case "windows":
			return tool.installCommands.windows;
		case "linux":
			return tool.installCommands.linux;
		default:
			return undefined;
	}
}

