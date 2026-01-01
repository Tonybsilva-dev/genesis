import { execSync } from "child_process";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import type { OperatingSystem } from "../../domain/types/os.js";

/**
 * Resultado da verificação de privilégios
 */
export interface PrivilegeCheckResult {
	isAdmin: boolean;
	canElevate: boolean;
	os: OperatingSystem;
	message?: string;
}

/**
 * Verifica se o processo atual tem privilégios de administrador/root
 */
export class PrivilegeChecker {
	/**
	 * Verifica se está rodando como administrador/root
	 */
	public static isAdmin(): boolean {
		const os = getCurrentOS();

		switch (os) {
			case "macos":
			case "linux":
				return this.isUnixRoot();
			case "windows":
				return this.isWindowsAdmin();
			default:
				return false;
		}
	}

	/**
	 * Verifica privilégios completos com detalhes
	 */
	public static check(): PrivilegeCheckResult {
		const os = getCurrentOS();
		const isAdmin = this.isAdmin();

		return {
			isAdmin,
			canElevate: this.canElevate(),
			os,
			message: isAdmin
				? "Rodando com privilégios de administrador"
				: "Rodando como usuário normal",
		};
	}

	/**
	 * Verifica se é possível elevar privilégios
	 */
	public static canElevate(): boolean {
		const os = getCurrentOS();

		switch (os) {
			case "macos":
			case "linux":
				// Verifica se sudo está disponível
				try {
					execSync("which sudo", { stdio: "ignore" });
					return true;
				} catch {
					return false;
				}
			case "windows":
				// No Windows, sempre é possível tentar elevar via UAC
				return true;
			default:
				return false;
		}
	}

	/**
	 * Verifica se é root no Unix
	 */
	private static isUnixRoot(): boolean {
		try {
			// process.getuid() retorna 0 para root
			return process.getuid?.() === 0;
		} catch {
			return false;
		}
	}

	/**
	 * Verifica se é administrador no Windows
	 */
	private static isWindowsAdmin(): boolean {
		try {
			// Tenta criar uma sessão de rede (requer privilégios de admin)
			execSync("net session", { stdio: "ignore", windowsHide: true });
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Verifica se o sudo está em cache (sem precisar de senha)
	 */
	public static isSudoCached(): boolean {
		const os = getCurrentOS();

		if (os === "windows") {
			return false; // Windows não tem sudo
		}

		try {
			// sudo -n verifica se pode executar sem senha
			execSync("sudo -n true", { stdio: "ignore" });
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Valida as credenciais de sudo (pede senha se necessário)
	 * Retorna true se as credenciais foram validadas com sucesso
	 */
	public static async validateSudo(): Promise<boolean> {
		const os = getCurrentOS();

		if (os === "windows") {
			return this.isWindowsAdmin();
		}

		try {
			// sudo -v valida as credenciais (pode pedir senha)
			execSync("sudo -v", { stdio: "inherit" });
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Mantém o cache do sudo ativo executando sudo -v periodicamente
	 * Retorna uma função para parar o keep-alive
	 */
	public static startSudoKeepAlive(intervalMs: number = 60000): () => void {
		const os = getCurrentOS();

		if (os === "windows") {
			return () => {}; // No-op no Windows
		}

		const interval = setInterval(() => {
			try {
				execSync("sudo -v", { stdio: "ignore" });
			} catch {
				// Ignora erros - provavelmente o sudo expirou
			}
		}, intervalMs);

		// Retorna função para parar o keep-alive
		return () => clearInterval(interval);
	}
}

