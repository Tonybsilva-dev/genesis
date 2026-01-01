/**
 * Exportações do módulo UI
 */
export {
	showWelcome,
	showGoodbye,
	showCancelled,
	selectToolsFromCategory,
	selectToolsFromCategories,
	showSelectionSummary,
	confirmInstallation,
} from "./cli.js";
export type { ToolSelectionResult } from "./cli.js";
export { showHealthReport, showHealthSummary } from "./health-report.js";
