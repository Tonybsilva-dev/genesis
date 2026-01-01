import type { Tool } from "./tool.js";

/**
 * Entidade Category - Agrupa ferramentas relacionadas
 */
export interface Category {
	/**
	 * Identificador único da categoria
	 */
	id: string;
	/**
	 * Nome da categoria
	 */
	name: string;
	/**
	 * Descrição da categoria
	 */
	description?: string;
	/**
	 * Lista de ferramentas pertencentes a esta categoria
	 */
	tools: Tool[];
	/**
	 * Se true, permite seleção múltipla de ferramentas nesta categoria
	 * Se false, apenas uma ferramenta pode ser selecionada
	 */
	allowsMultipleSelection: boolean;
	/**
	 * Ordem de exibição da categoria (para ordenação na UI)
	 */
	order?: number;
}

/**
 * Adiciona uma ferramenta a uma categoria
 */
export function addToolToCategory(category: Category, tool: Tool): void {
	// Verifica se a ferramenta já está na categoria
	if (!category.tools.find((t) => t.id === tool.id)) {
		category.tools.push(tool);
	}
}

/**
 * Remove uma ferramenta de uma categoria
 */
export function removeToolFromCategory(category: Category, toolId: string): boolean {
	const index = category.tools.findIndex((t) => t.id === toolId);
	if (index !== -1) {
		category.tools.splice(index, 1);
		return true;
	}
	return false;
}

/**
 * Busca uma ferramenta em uma categoria pelo ID
 */
export function findToolInCategory(category: Category, toolId: string): Tool | undefined {
	return category.tools.find((t) => t.id === toolId);
}

