import * as p from "@clack/prompts";
import type { HealthCheckResult } from "../application/services/health-check-service.js";

/**
 * Exibe um relatório de saúde em formato tabular
 */
export function showHealthReport(results: HealthCheckResult[]): void {
	if (results.length === 0) {
		p.log.warn("Nenhuma ferramenta para verificar.");
		return;
	}

	p.log.info("\n📊 Relatório de Saúde (Doctor Mode)\n");

	// Cabeçalho da tabela
	const header = "Ferramenta".padEnd(30) + "Status".padEnd(15) + "Caminho/Versão";
	p.log.info(header);
	p.log.info("-".repeat(header.length));

	// Linhas da tabela
	for (const result of results) {
		const toolName = result.tool.name.padEnd(30);
		const status = result.isInstalled
			? "✓ Instalado".padEnd(15)
			: "✗ Não encontrado".padEnd(15);

		let details = "";
		if (result.isInstalled) {
			if (result.binaryPath) {
				details = result.binaryPath;
			} else if (result.version) {
				details = result.version;
			} else {
				details = "OK";
			}
		} else {
			details = result.message;
		}

		// Limita o tamanho dos detalhes para não quebrar a tabela
		if (details.length > 50) {
			details = details.substring(0, 47) + "...";
		}

		const line = toolName + status + details;
		if (result.isInstalled) {
			p.log.info(line);
		} else {
			p.log.error(line);
		}
	}

	p.log.info("-".repeat(header.length));

	// Estatísticas
	const installed = results.filter((r) => r.isInstalled).length;
	const failed = results.filter((r) => !r.isInstalled).length;

	p.log.info(`\n✅ ${installed} instalada(s) | ❌ ${failed} não encontrada(s)\n`);
}

/**
 * Exibe um resumo simples do relatório de saúde
 */
export function showHealthSummary(results: HealthCheckResult[]): void {
	const installed = results.filter((r) => r.isInstalled).length;
	const failed = results.filter((r) => !r.isInstalled).length;
	const total = results.length;

	if (failed === 0) {
		p.log.success(`✓ Todas as ${total} ferramentas estão instaladas e acessíveis`);
	} else {
		p.log.warn(`⚠️  ${installed}/${total} ferramentas instaladas. ${failed} não encontrada(s).`);
	}
}

