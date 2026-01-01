/**
 * Exportações das entidades do domínio
 */
export type { Tool, InstallationCommands } from "./tool.js";
export type { Category } from "./category.js";
export {
	validateTool,
	getInstallCommand,
} from "./tool.js";
export {
	addToolToCategory,
	removeToolFromCategory,
	findToolInCategory,
} from "./category.js";

