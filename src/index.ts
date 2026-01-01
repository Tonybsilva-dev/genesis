/**
 * Genesis - Ferramenta de automação de setup de ambiente de desenvolvimento
 * Cross-platform: macOS, Windows 11, Ubuntu
 */

import { detectOS, getCurrentOS } from "./domain/services/os-detector.js";
import type { OperatingSystem } from "./domain/types/os.js";
import type { Category } from "./domain/entities/index.js";
import {
	showWelcome,
	showGoodbye,
	showCancelled,
	selectToolsFromCategories,
	showSelectionSummary,
	confirmInstallation,
	showHealthReport,
} from "./ui/index.js";
import { baseCategories, findToolById } from "./domain/config/index.js";
import {
	InstallationService,
	HealthCheckService,
	AndroidSetupService,
	iOSSetupService,
} from "./application/services/index.js";
import * as p from "@clack/prompts";

/**
 * Filtra categorias baseadas no SO atual
 * Algumas categorias só fazem sentido em determinados SOs
 */
function filterCategoriesByOS(
	categories: Category[],
	os: OperatingSystem
): Category[] {
	return categories
		.map((category) => {
			// iOS só disponível no macOS
			if (category.id === "ios" && os !== "macos") {
				return null;
			}

			// Filtra ferramentas que não têm comando de instalação para o SO atual
			const filteredTools = category.tools.filter(
				(tool) => tool.installCommands[os] !== undefined
			);

			// Se não houver ferramentas disponíveis, remove a categoria
			if (filteredTools.length === 0) {
				return null;
			}

			return {
				...category,
				tools: filteredTools,
			};
		})
		.filter((category): category is Category => category !== null);
}

async function main() {
	// Detecção de SO
	const currentOS = getCurrentOS();
	console.log(`SO detectado: ${currentOS}\n`);

	// Detecção completa (com validações)
	const detection = await detectOS();
	if (!detection.isSupported) {
		console.error(`❌ Sistema operacional não suportado: ${detection.error}`);
		process.exit(1);
	}

	// Exibe boas-vindas
	showWelcome();

	// Filtra categorias baseadas no SO atual
	const availableCategories = filterCategoriesByOS(baseCategories, currentOS);

	// Loop de seleção de ferramentas
	const selection = await selectToolsFromCategories(availableCategories);

	// Verifica se foi cancelado
	if (selection.cancelled) {
		showCancelled();
		showGoodbye();
		process.exit(0);
	}

	// Exibe resumo
	showSelectionSummary(selection.selectedToolIds, availableCategories);

	// Solicita confirmação
	const confirmed = await confirmInstallation();

	if (!confirmed) {
		showGoodbye();
		process.exit(0);
	}

	// Instala as ferramentas selecionadas
	const installationService = new InstallationService();
	const toolsToInstall = selection.selectedToolIds
		.map((id) => findToolById(id))
		.filter((tool): tool is NonNullable<typeof tool> => tool !== undefined);

	if (toolsToInstall.length === 0) {
		p.log.warn("Nenhuma ferramenta válida para instalar.");
		showGoodbye();
		process.exit(0);
	}

	// Executa a instalação com feedback visual
	const results = await installationService.installTools(toolsToInstall, true);

	// Exibe resumo final
	const successful = results.filter((r) => r.success && !r.alreadyInstalled).length;
	const skipped = results.filter((r) => r.alreadyInstalled).length;
	const failed = results.filter((r) => !r.success).length;

	if (failed > 0) {
		p.log.warn("\n⚠️  Algumas instalações falharam:");
		for (const result of results) {
			if (!result.success) {
				p.log.error(`  • ${result.tool.name}: ${result.error || "Erro desconhecido"}`);
			}
		}
	}

	// Validação final de saúde (Doctor Mode)
	p.log.info("\n");
	p.log.step("Verificando saúde das ferramentas instaladas...");
	const healthCheckService = new HealthCheckService();
	const healthResults = await healthCheckService.checkTools(toolsToInstall);
	showHealthReport(healthResults);

	// Configuração pós-instalação para Android/iOS
	const hasAndroidTools = toolsToInstall.some(
		(tool) => tool.categoryId === "android"
	);
	const hasiOSTools = toolsToInstall.some((tool) => tool.categoryId === "ios");

	if (hasAndroidTools) {
		const setupAndroid = await p.confirm({
			message: "Deseja configurar o ambiente Android (ANDROID_HOME, licenças)?",
			initialValue: true,
		});

		if (!p.isCancel(setupAndroid) && setupAndroid) {
			const androidService = new AndroidSetupService();
			await androidService.setupComplete();
		}
	}

	if (hasiOSTools && currentOS === "macos") {
		const setupiOS = await p.confirm({
			message: "Deseja configurar o ambiente iOS (licenças do Xcode)?",
			initialValue: true,
		});

		if (!p.isCancel(setupiOS) && setupiOS) {
			const iosService = new iOSSetupService();
			await iosService.setupComplete();
		}
	}

	showGoodbye();
}

main().catch((error) => {
	console.error("❌ Erro fatal:", error);
	process.exit(1);
});
