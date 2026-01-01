import { $, ProcessOutput } from "zx";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { ShellError } from "./shell-error.js";

const execAsync = promisify(exec);

/**
 * Opções para execução de comandos shell
 */
export interface ShellOptions {
	/**
	 * Se true, exibe o comando antes de executá-lo
	 */
	verbose?: boolean;
	/**
	 * Se true, não lança exceção em caso de erro (retorna null)
	 */
	silent?: boolean;
	/**
	 * Diretório de trabalho para o comando
	 */
	cwd?: string;
}

/**
 * Resultado da execução de um comando shell
 */
export interface ShellResult {
	/**
	 * Código de saída do comando
	 */
	exitCode: number;
	/**
	 * Saída padrão (stdout)
	 */
	stdout: string;
	/**
	 * Saída de erro (stderr)
	 */
	stderr: string;
	/**
	 * Comando executado
	 */
	command: string;
}

/**
 * Wrapper para execução de comandos shell usando zx
 * Encapsula a função $ do zx com tratamento de erros e logging
 */
export class ShellWrapper {
	private verbose: boolean = false;

	/**
	 * Define o modo verbose globalmente
	 */
	public setVerbose(verbose: boolean): void {
		this.verbose = verbose;
	}

	/**
	 * Executa um comando shell usando template literal do zx
	 * Exemplo: await shell.execute`echo "Hello"`
	 */
	public async execute(
		command: TemplateStringsArray,
		...args: any[]
	): Promise<ShellResult> {
		return this.executeWithOptions({}, command, ...args);
	}

	/**
	 * Executa um comando shell a partir de uma string
	 * Usa child_process.exec diretamente (mais confiável para strings)
	 * Exemplo: await shell.executeString("echo Hello")
	 */
	public async executeString(
		command: string,
		options?: ShellOptions
	): Promise<ShellResult> {
		const verbose = options?.verbose ?? this.verbose;
		const silent = options?.silent ?? false;
		const cwd = options?.cwd;

		// Exibe o comando se verbose estiver ativo
		if (verbose) {
			console.log(`$ ${command}`);
		}

		try {
			const { stdout, stderr } = await execAsync(command, {
				cwd,
				maxBuffer: 10 * 1024 * 1024, // 10MB
			});

			return {
				exitCode: 0,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
				command,
			};
		} catch (error: any) {
			const shellError = new ShellError(
				`Comando falhou com exit code ${error.code || 1}`,
				error.code || 1,
				command,
				error.stdout?.trim() || "",
				error.stderr?.trim() || ""
			);

			// Se silent=true, retorna resultado em vez de lançar exceção
			if (silent) {
				return {
					exitCode: error.code || 1,
					stdout: error.stdout?.trim() || "",
					stderr: error.stderr?.trim() || "",
					command,
				};
			}

			throw shellError;
		}
	}

	/**
	 * Executa um comando de forma interativa com output em tempo real
	 * Útil para comandos que podem demorar ou precisar de interação
	 * Exemplo: await shell.executeInteractive("brew install --cask zulu@17")
	 */
	public async executeInteractive(
		command: string,
		options?: { cwd?: string; timeout?: number }
	): Promise<ShellResult> {
		const cwd = options?.cwd;
		const timeout = options?.timeout ?? 300000; // 5 minutos padrão

		console.log(`$ ${command}`);

		return new Promise((resolve, reject) => {
			const [cmd, ...args] = command.split(" ");
			const child = spawn(cmd, args, {
				cwd,
				stdio: "inherit",
				shell: true,
			});

			const timeoutId = setTimeout(() => {
				child.kill("SIGTERM");
				reject(
					new ShellError(
						`Comando excedeu o timeout de ${timeout / 1000}s`,
						124,
						command,
						"",
						"Timeout"
					)
				);
			}, timeout);

			child.on("close", (code) => {
				clearTimeout(timeoutId);
				resolve({
					exitCode: code ?? 0,
					stdout: "",
					stderr: "",
					command,
				});
			});

			child.on("error", (error) => {
				clearTimeout(timeoutId);
				reject(
					new ShellError(
						`Erro ao executar comando: ${error.message}`,
						1,
						command,
						"",
						error.message
					)
				);
			});
		});
	}

	/**
	 * Executa um comando shell com opções
	 */
	public async executeWithOptions(
		options: ShellOptions,
		command: string | TemplateStringsArray,
		...args: any[]
	): Promise<ShellResult> {
		const verbose = options.verbose ?? this.verbose;
		const silent = options.silent ?? false;
		const cwd = options.cwd;

		// Constrói a string do comando para logging
		const commandString = typeof command === "string"
			? command
			: String.raw(command, ...args);

		// Exibe o comando se verbose estiver ativo
		if (verbose) {
			console.log(`$ ${commandString}`);
		}

		// Salva o diretório atual para restaurar depois
		const originalCwd = process.cwd();

		try {
			// Configura o diretório de trabalho se especificado
			if (cwd) {
				process.chdir(cwd);
			}

			// Executa o comando usando zx
			// zx usa template literals, então precisamos usar a sintaxe correta
			let result: ProcessOutput;
			if (typeof command === "string") {
				// Para strings simples, cria um TemplateStringsArray válido
				// O zx requer que o array tenha a propriedade 'raw'
				const templateArray = [command] as unknown as TemplateStringsArray;
				Object.defineProperty(templateArray, "raw", {
					value: [command],
					writable: false,
				});
				result = await $(templateArray);
			} else {
				// Para template strings, passa diretamente
				result = await $(command, ...args);
			}

			return {
				exitCode: result.exitCode,
				stdout: result.stdout.trim(),
				stderr: result.stderr.trim(),
				command: commandString,
			};
		} catch (error) {
			// zx lança ProcessOutput em caso de erro
			if (error instanceof ProcessOutput) {
				const shellError = new ShellError(
					`Comando falhou com exit code ${error.exitCode}`,
					error.exitCode,
					commandString,
					error.stdout.trim(),
					error.stderr.trim()
				);

				// Se silent=true, retorna resultado em vez de lançar exceção
				if (silent) {
					return {
						exitCode: error.exitCode,
						stdout: error.stdout.trim(),
						stderr: error.stderr.trim(),
						command: commandString,
					};
				}

				throw shellError;
			}

			// Outros tipos de erro
			const errorMessage = error instanceof Error ? error.message : String(error);
			const shellError = new ShellError(
				`Erro ao executar comando: ${errorMessage}`,
				1,
				commandString,
				"",
				errorMessage
			);

			if (silent) {
				return {
					exitCode: 1,
					stdout: "",
					stderr: errorMessage,
					command: commandString,
				};
			}

			throw shellError;
		} finally {
			// Restaura o diretório de trabalho original
			if (cwd) {
				process.chdir(originalCwd);
			}
		}
	}

	/**
	 * Executa um comando e retorna apenas o stdout como string
	 * Útil para comandos que retornam texto simples
	 */
	public async executeAndGetOutput(
		command: string | TemplateStringsArray,
		...args: any[]
	): Promise<string> {
		const result = await this.execute(command, ...args);
		return result.stdout;
	}

	/**
	 * Verifica se um comando foi executado com sucesso (exit code 0)
	 */
	public async executeAndCheck(
		command: string | TemplateStringsArray,
		...args: any[]
	): Promise<boolean> {
		try {
			const result = await this.execute(command, ...args);
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}
}

/**
 * Instância singleton do ShellWrapper
 */
export const shell = new ShellWrapper();

