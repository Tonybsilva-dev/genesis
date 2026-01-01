import type { IEnvironmentManager } from "../../domain/interfaces/environment-manager.js";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { UnixEnvironmentManager } from "./unix-environment-manager.js";
import { WindowsEnvironmentManager } from "./windows-environment-manager.js";

/**
 * Cache do gerenciador de ambiente
 */
let environmentManager: IEnvironmentManager | null = null;

/**
 * Factory para obter o gerenciador de ambiente apropriado para o SO atual
 */
export function getEnvironmentManager(): IEnvironmentManager {
	if (environmentManager) {
		return environmentManager;
	}

	const os = getCurrentOS();

	switch (os) {
		case "windows":
			environmentManager = new WindowsEnvironmentManager();
			break;
		case "macos":
		case "linux":
		default:
			environmentManager = new UnixEnvironmentManager();
			break;
	}

	return environmentManager;
}

/**
 * Reseta o cache do gerenciador (útil para testes)
 */
export function resetEnvironmentManager(): void {
	environmentManager = null;
}

