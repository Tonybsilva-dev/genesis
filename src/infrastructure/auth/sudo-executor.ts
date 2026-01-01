import { exec, execSync, spawn } from "child_process";
import { promisify } from "util";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { PrivilegeChecker } from "./privilege-checker.js";
import * as p from "@clack/prompts";

const execAsync = promisify(exec);

/**
 * Resultado da execução com sudo
 */
export interface SudoExecResult {
	success: boolean;
	stdout: string;
	stderr: string;
	exitCode: number;
}

/**
 * Executor de comandos com privilégios elevados
 */
export class SudoExecutor {
	private static keepAliveStop: (() => void) | null = null;

	/**
	 * Solicita privilégios de administrador ao usuário de forma amigável
	 * Retorna true se os privilégios foram obtidos
	 */
	public static async requestPrivileges(): Promise<boolean> {
		const os = getCurrentOS();

		// Se já é admin, não precisa fazer nada
		if (PrivilegeChecker.isAdmin()) {
			return true;
		}

		// Se o sudo já está em cache, não precisa pedir senha
		if (os !== "windows" && PrivilegeChecker.isSudoCached()) {
			return true;
		}

		// Mostra aviso ao usuário
		p.log.warn("⚠️  Esta operação requer privilégios de administrador.");

		if (os === "windows") {
			return this.requestWindowsPrivileges();
		} else {
			return this.requestUnixPrivileges();
		}
	}

	/**
	 * Solicita privilégios no Unix via sudo
	 */
	private static async requestUnixPrivileges(): Promise<boolean> {
		p.log.info("Você será solicitado a digitar sua senha de administrador.");
		p.log.info("Isso é necessário para instalar ferramentas do sistema.\n");

		const shouldContinue = await p.confirm({
			message: "Deseja continuar e fornecer a senha?",
			initialValue: true,
		});

		if (p.isCancel(shouldContinue) || !shouldContinue) {
			p.log.warn("Operação cancelada. Algumas ferramentas podem não ser instaladas.");
			return false;
		}

		try {
			// Usa spawn para permitir interação com o terminal
			return new Promise((resolve) => {
				const child = spawn("sudo", ["-v"], {
					stdio: "inherit",
				});

				child.on("close", (code) => {
					if (code === 0) {
						p.log.success("✓ Privilégios de administrador obtidos.\n");
						// Inicia o keep-alive para manter o sudo ativo
						this.startKeepAlive();
						resolve(true);
					} else {
						p.log.error("✗ Falha ao obter privilégios de administrador.");
						resolve(false);
					}
				});

				child.on("error", () => {
					p.log.error("✗ Erro ao solicitar privilégios.");
					resolve(false);
				});
			});
		} catch {
			return false;
		}
	}

	/**
	 * Solicita privilégios no Windows
	 */
	private static async requestWindowsPrivileges(): Promise<boolean> {
		p.log.info("No Windows, o UAC (Controle de Conta de Usuário) pode solicitar permissão.");
		p.log.info("Por favor, aceite a solicitação quando aparecer.\n");

		const shouldContinue = await p.confirm({
			message: "Deseja continuar?",
			initialValue: true,
		});

		if (p.isCancel(shouldContinue) || !shouldContinue) {
			p.log.warn("Operação cancelada. Algumas ferramentas podem não ser instaladas.");
			return false;
		}

		// No Windows, não podemos elevar privilégios em runtime facilmente
		// O processo precisa ser reiniciado com privilégios elevados
		// Retornamos true e confiamos que o UAC vai aparecer quando necessário
		return true;
	}

	/**
	 * Executa um comando com sudo
	 */
	public static async exec(command: string): Promise<SudoExecResult> {
		const os = getCurrentOS();

		// No Windows, executa diretamente (o UAC vai lidar se necessário)
		if (os === "windows") {
			return this.execDirect(command);
		}

		// No Unix, verifica se precisa de sudo
		if (PrivilegeChecker.isAdmin() || PrivilegeChecker.isSudoCached()) {
			// Se já é root ou sudo está em cache, executa com sudo
			const sudoCommand = PrivilegeChecker.isAdmin() ? command : `sudo ${command}`;
			return this.execDirect(sudoCommand);
		}

		// Precisa solicitar privilégios primeiro
		const hasPrivileges = await this.requestPrivileges();
		if (!hasPrivileges) {
			return {
				success: false,
				stdout: "",
				stderr: "Privilégios de administrador não foram obtidos",
				exitCode: 1,
			};
		}

		return this.execDirect(`sudo ${command}`);
	}

	/**
	 * Executa um comando diretamente
	 */
	private static async execDirect(command: string): Promise<SudoExecResult> {
		try {
			const { stdout, stderr } = await execAsync(command, {
				maxBuffer: 10 * 1024 * 1024,
			});

			return {
				success: true,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
				exitCode: 0,
			};
		} catch (error: any) {
			return {
				success: false,
				stdout: error.stdout?.trim() || "",
				stderr: error.stderr?.trim() || error.message || "",
				exitCode: error.code || 1,
			};
		}
	}

	/**
	 * Inicia o keep-alive do sudo
	 */
	private static startKeepAlive(): void {
		if (this.keepAliveStop) {
			return; // Já está rodando
		}

		this.keepAliveStop = PrivilegeChecker.startSudoKeepAlive(60000); // 1 minuto

		// Para o keep-alive quando o processo terminar
		process.on("exit", () => {
			this.stopKeepAlive();
		});
	}

	/**
	 * Para o keep-alive do sudo
	 */
	public static stopKeepAlive(): void {
		if (this.keepAliveStop) {
			this.keepAliveStop();
			this.keepAliveStop = null;
		}
	}
}

