/**
 * Exceção customizada para erros de execução de comandos shell
 */
export class ShellError extends Error {
	public readonly exitCode: number;
	public readonly command: string;
	public readonly stdout: string;
	public readonly stderr: string;

	constructor(
		message: string,
		exitCode: number,
		command: string,
		stdout: string = "",
		stderr: string = ""
	) {
		super(message);
		this.name = "ShellError";
		this.exitCode = exitCode;
		this.command = command;
		this.stdout = stdout;
		this.stderr = stderr;

		// Mantém o stack trace correto
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ShellError);
		}
	}

	/**
	 * Retorna uma representação completa do erro
	 */
	public toString(): string {
		return `${this.name}: ${this.message}\n` +
			`  Comando: ${this.command}\n` +
			`  Exit Code: ${this.exitCode}\n` +
			(this.stdout ? `  Stdout: ${this.stdout}\n` : "") +
			(this.stderr ? `  Stderr: ${this.stderr}\n` : "");
	}
}

