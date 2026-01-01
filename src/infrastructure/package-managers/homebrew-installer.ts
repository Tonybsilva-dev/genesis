import { shell } from "../shell/index.js";
import { existsSync } from "fs";
import { execSync } from "child_process";
import * as p from "@clack/prompts";

/**
 * Serviço para instalar o Homebrew automaticamente
 */
export class HomebrewInstaller {
	/**
	 * Instala o Homebrew no sistema macOS
	 * Nota: A instalação do Homebrew requer interação do usuário (senha do sudo)
	 * Por isso, fornecemos instruções para instalação manual
	 */
	public static async install(): Promise<boolean> {
		p.log.step("Instalação do Homebrew");
		p.log.info("A instalação do Homebrew requer interação manual (senha do administrador).\n");
		p.log.info("📋 Instruções:\n");
		p.log.info("  1. Abra um novo terminal");
		p.log.info("  2. Execute o comando:");
		p.log.info("     /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"");
		p.log.info("  3. Ou visite: https://brew.sh\n");

		const action = await p.select({
			message: "O que você deseja fazer?",
			options: [
				{
					value: "installed",
					label: "✓ Já instalei o Homebrew - Verificar novamente",
					hint: "Verifica se o Homebrew está disponível no PATH",
				},
				{
					value: "skip",
					label: "⏭️  Pular instalação do Homebrew",
					hint: "Continua sem Homebrew (algumas ferramentas podem não ser instaladas)",
				},
				{
					value: "cancel",
					label: "❌ Cancelar tudo",
					hint: "Cancela a instalação de todas as ferramentas",
				},
			],
		});

		if (p.isCancel(action) || action === "cancel") {
			return false;
		}

		if (action === "skip") {
			p.log.info("⏭️  Pulando instalação do Homebrew. Continuando sem ele...\n");
			return false;
		}

		// Verifica se o Homebrew está disponível agora
		p.log.info("🔍 Verificando se o Homebrew está disponível...\n");
		if (await this.isAvailable()) {
			p.log.success("✓ Homebrew detectado! Continuando com a instalação...\n");
			return true;
		}

		// Se ainda não foi detectado, oferece opções novamente
		p.log.warn("⚠️  Homebrew ainda não foi detectado no PATH.\n");
		p.log.info("Possíveis causas:");
		p.log.info("  • O Homebrew não foi instalado ainda");
		p.log.info("  • O Homebrew foi instalado mas não está no PATH atual");
		p.log.info("  • É necessário reiniciar o terminal após a instalação\n");

		const retry = await p.confirm({
			message: "Deseja tentar verificar novamente?",
			initialValue: false,
		});

		if (p.isCancel(retry) || !retry) {
			return false;
		}

		// Tenta verificar mais uma vez
		if (await this.isAvailable()) {
			p.log.success("✓ Homebrew detectado! Continuando com a instalação...\n");
			return true;
		}

		p.log.warn("⚠️  Homebrew ainda não foi detectado. Continuando sem ele...\n");
		return false;
	}

	/**
	 * Verifica se o Homebrew está disponível
	 * Suporta tanto Mac Intel (/usr/local) quanto Apple Silicon (/opt/homebrew)
	 */
	public static async isAvailable(): Promise<boolean> {
		// Verifica caminhos padrão do Homebrew
		// Mac Intel: /usr/local/bin/brew
		// Mac Apple Silicon (M1/M2/M3): /opt/homebrew/bin/brew
		const brewPaths = [
			"/opt/homebrew/bin/brew", // Apple Silicon (prioridade)
			"/usr/local/bin/brew", // Intel
			"/home/linuxbrew/.linuxbrew/bin/brew", // Linux
		];

		// 1. Verifica se o arquivo existe usando Node.js (mais confiável)
		for (const brewPath of brewPaths) {
			if (existsSync(brewPath)) {
				return true;
			}
		}

		// 2. Tenta executar brew --version usando execSync (síncrono, mais confiável)
		try {
			execSync("brew --version", { stdio: "ignore" });
			return true;
		} catch {
			// Não está no PATH
		}

		// 3. Tenta executar com caminho absoluto
		for (const brewPath of brewPaths) {
			try {
				execSync(`${brewPath} --version`, { stdio: "ignore" });
				return true;
			} catch {
				// Continua tentando
			}
		}

		return false;
	}
}

