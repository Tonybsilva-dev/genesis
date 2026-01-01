import * as p from "@clack/prompts";
import type { Category, Tool } from "../domain/entities/index.js";

/**
 * Resultado da seleção de ferramentas
 */
export interface ToolSelectionResult {
	/**
	 * IDs das ferramentas selecionadas
	 */
	selectedToolIds: string[];
	/**
	 * Se o usuário cancelou a operação
	 */
	cancelled: boolean;
}

/**
 * Exibe o cabeçalho e boas-vindas da CLI
 */
export function showWelcome(): void {
	p.intro("🚀 Genesis");
	p.note("Ferramenta de automação de setup de ambiente de desenvolvimento");
}

/**
 * Exibe mensagem de despedida
 */
export function showGoodbye(): void {
	p.outro("Até logo! 👋");
}

/**
 * Exibe mensagem de cancelamento
 */
export function showCancelled(): void {
	p.cancel("Operação cancelada pelo usuário.");
}

/**
 * Cria opções para o multiselect de uma categoria
 */
function createCategoryOptions(category: Category): Array<{ value: string; label: string; hint?: string }> {
	const options: Array<{ value: string; label: string; hint?: string }> = [];

	// Adiciona as ferramentas da categoria primeiro
	for (const tool of category.tools) {
		options.push({
			value: tool.id,
			label: tool.name,
			hint: tool.description,
		});
	}

	// Opção "Instalar Todas" (no final)
	options.push({
		value: "__install_all__",
		label: "📦 Instalar Todas",
		hint: "Seleciona todas as ferramentas desta categoria",
	});

	// Opção "Pular" (no final)
	options.push({
		value: "__skip__",
		label: "⏭️  Pular",
		hint: "Pula esta categoria sem selecionar nada",
	});

	return options;
}

/**
 * Processa a seleção de uma categoria
 */
function processCategorySelection(
	category: Category,
	selectedValues: (string | symbol)[]
): string[] {
	const selectedToolIds: string[] = [];

	// Se "Instalar Todas" foi selecionado
	if (selectedValues.includes("__install_all__")) {
		// Retorna todos os IDs das ferramentas da categoria
		return category.tools.map((tool) => tool.id);
	}

	// Se "Pular" foi selecionado ou nenhuma ferramenta foi selecionada
	if (selectedValues.includes("__skip__") || selectedValues.length === 0) {
		return [];
	}

	// Filtra apenas os IDs válidos de ferramentas (excluindo opções especiais)
	for (const value of selectedValues) {
		if (typeof value === "string" && value !== "__install_all__" && value !== "__skip__") {
			const tool = category.tools.find((t) => t.id === value);
			if (tool) {
				selectedToolIds.push(value);
			}
		}
	}

	return selectedToolIds;
}

/**
 * Permite ao usuário selecionar ferramentas de uma categoria
 */
export async function selectToolsFromCategory(category: Category): Promise<string[]> {
	const options = createCategoryOptions(category);

	// Mostra instruções em português antes do prompt
	p.log.info("💡 Dica: Use ESPAÇO para selecionar, ENTER para confirmar, ESC para cancelar");

	const selected = await p.multiselect({
		message: `Selecione as ferramentas da categoria: ${category.name}`,
		options,
		required: false,
	});

	// Verifica se foi cancelado
	if (p.isCancel(selected)) {
		return [];
	}

	const result = processCategorySelection(category, selected);

	// Mostra confirmação se "Instalar Todas" foi selecionado
	if (selected.includes("__install_all__")) {
		p.log.success(`✓ Todas as ${category.tools.length} ferramentas da categoria "${category.name}" foram selecionadas`);
	}

	return result;
}

/**
 * Loop principal de seleção de ferramentas por categorias
 */
export async function selectToolsFromCategories(
	categories: Category[]
): Promise<ToolSelectionResult> {
	const allSelectedToolIds: string[] = [];

	// Ordena categorias por ordem (se definida)
	const sortedCategories = [...categories].sort((a, b) => {
		const orderA = a.order ?? 999;
		const orderB = b.order ?? 999;
		return orderA - orderB;
	});

	for (const category of sortedCategories) {
		p.log.step(`Categoria: ${category.name}`);
		if (category.description) {
			p.log.info(category.description);
		}

		const selected = await selectToolsFromCategory(category);

		// Se foi cancelado, retorna imediatamente
		if (selected.length === 0 && p.isCancel(selected)) {
			return {
				selectedToolIds: allSelectedToolIds,
				cancelled: true,
			};
		}

		allSelectedToolIds.push(...selected);

		// Pula linha para melhor legibilidade
		p.log.info("");
	}

	return {
		selectedToolIds: allSelectedToolIds,
		cancelled: false,
	};
}

/**
 * Exibe um resumo das ferramentas selecionadas
 */
export function showSelectionSummary(
	selectedToolIds: string[],
	allCategories: Category[]
): void {
	if (selectedToolIds.length === 0) {
		p.log.warn("Nenhuma ferramenta foi selecionada.");
		return;
	}

	// Coleta informações das ferramentas selecionadas
	const selectedTools: Array<{ tool: Tool; category: string }> = [];

	for (const category of allCategories) {
		for (const tool of category.tools) {
			if (selectedToolIds.includes(tool.id)) {
				selectedTools.push({
					tool,
					category: category.name,
				});
			}
		}
	}

	// Agrupa por categoria para exibição
	const groupedByCategory = new Map<string, Tool[]>();
	for (const { tool, category } of selectedTools) {
		if (!groupedByCategory.has(category)) {
			groupedByCategory.set(category, []);
		}
		groupedByCategory.get(category)!.push(tool);
	}

	p.log.info(`\n📋 Resumo da seleção (${selectedToolIds.length} ferramenta(s)):\n`);

	for (const [categoryName, tools] of groupedByCategory.entries()) {
		p.log.step(categoryName);
		for (const tool of tools) {
			p.log.info(`  • ${tool.name}${tool.description ? ` - ${tool.description}` : ""}`);
		}
		p.log.info("");
	}
}

/**
 * Solicita confirmação final do usuário
 */
export async function confirmInstallation(): Promise<boolean> {
	const confirmed = await p.confirm({
		message: "Deseja prosseguir com a instalação?",
		initialValue: true,
	});

	if (p.isCancel(confirmed)) {
		return false;
	}

	return confirmed ?? false;
}

