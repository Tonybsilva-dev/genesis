import { execSync } from "child_process";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { SudoExecutor } from "../../infrastructure/auth/index.js";
import * as p from "@clack/prompts";

/**
 * Resultado da configuração do iOS
 */
export interface iOSSetupResult {
	success: boolean;
	message: string;
	xcodeVersion?: string;
	cocoapodsVersion?: string;
}

/**
 * Serviço para configuração do ambiente iOS/macOS
 * Nota: Este serviço só funciona no macOS
 */
export class iOSSetupService {
	/**
	 * Verifica se estamos no macOS
	 */
	public isMacOS(): boolean {
		return getCurrentOS() === "macos";
	}

	/**
	 * Detecta se o Xcode Command Line Tools está instalado
	 */
	public detectXcodeTools(): { installed: boolean; path?: string } {
		if (!this.isMacOS()) {
			return { installed: false };
		}

		try {
			const path = execSync("xcode-select -p", {
				encoding: "utf-8",
			}).trim();
			return { installed: true, path };
		} catch {
			return { installed: false };
		}
	}

	/**
	 * Detecta a versão do Xcode
	 */
	public detectXcodeVersion(): string | undefined {
		if (!this.isMacOS()) {
			return undefined;
		}

		try {
			const output = execSync("xcodebuild -version", {
				encoding: "utf-8",
			});
			const match = output.match(/Xcode\s+(\d+\.\d+)/);
			return match ? match[1] : undefined;
		} catch {
			return undefined;
		}
	}

	/**
	 * Detecta se o CocoaPods está instalado
	 */
	public detectCocoaPods(): { installed: boolean; version?: string } {
		try {
			const version = execSync("pod --version", {
				encoding: "utf-8",
			}).trim();
			return { installed: true, version };
		} catch {
			return { installed: false };
		}
	}

	/**
	 * Instala o Xcode Command Line Tools
	 */
	public async installXcodeTools(): Promise<iOSSetupResult> {
		if (!this.isMacOS()) {
			return {
				success: false,
				message: "Xcode só está disponível no macOS",
			};
		}

		const existing = this.detectXcodeTools();
		if (existing.installed) {
			return {
				success: true,
				message: "Xcode Command Line Tools já está instalado",
			};
		}

		try {
			p.log.step("Instalando Xcode Command Line Tools...");
			p.log.info("Uma janela de instalação pode aparecer. Por favor, siga as instruções.\n");

			// xcode-select --install abre uma janela de diálogo
			execSync("xcode-select --install", {
				stdio: "inherit",
			});

			return {
				success: true,
				message: "Instalação do Xcode Command Line Tools iniciada",
			};
		} catch (error) {
			// O erro pode ocorrer se já estiver instalado ou se o usuário cancelou
			const errorMsg = error instanceof Error ? error.message : String(error);
			if (errorMsg.includes("already installed")) {
				return {
					success: true,
					message: "Xcode Command Line Tools já está instalado",
				};
			}

			return {
				success: false,
				message: `Erro ao instalar Xcode Tools: ${errorMsg}`,
			};
		}
	}

	/**
	 * Verifica se o Xcode completo está instalado (não apenas Command Line Tools)
	 */
	public hasFullXcode(): boolean {
		try {
			const path = execSync("xcode-select -p", { encoding: "utf-8" }).trim();
			// Se o path contém "Xcode.app", é o Xcode completo
			return path.includes("Xcode.app");
		} catch {
			return false;
		}
	}

	/**
	 * Aceita as licenças do Xcode
	 */
	public async acceptXcodeLicense(): Promise<iOSSetupResult> {
		if (!this.isMacOS()) {
			return {
				success: false,
				message: "Xcode só está disponível no macOS",
			};
		}

		// Verifica se o Xcode completo está instalado
		if (!this.hasFullXcode()) {
			p.log.info("ℹ️  Apenas Command Line Tools instalado (Xcode completo não detectado)");
			p.log.info("   Para desenvolvimento iOS nativo, instale o Xcode pela App Store.");
			return {
				success: true,
				message: "Command Line Tools instalado. Xcode completo opcional para desenvolvimento iOS.",
			};
		}

		try {
			p.log.step("Aceitando licença do Xcode...");

			// Verifica se há pendências de licença
			try {
				execSync("xcodebuild -checkFirstLaunchStatus", {
					stdio: "pipe",
				});
				// Se não lançar erro, não há pendências
				return {
					success: true,
					message: "Licença do Xcode já foi aceita",
				};
			} catch {
				// Há pendências, precisa aceitar
			}

			// Solicita privilégios de admin
			const hasPrivileges = await SudoExecutor.requestPrivileges();
			if (!hasPrivileges) {
				return {
					success: false,
					message: "Privilégios de administrador necessários para aceitar a licença",
				};
			}

			// Aceita a licença
			const result = await SudoExecutor.exec("xcodebuild -license accept");
			if (!result.success) {
				return {
					success: false,
					message: `Erro ao aceitar licença: ${result.stderr}`,
				};
			}

			p.log.success("✓ Licença do Xcode aceita");

			return {
				success: true,
				message: "Licença do Xcode aceita com sucesso",
			};
		} catch (error) {
			return {
				success: false,
				message: `Erro ao aceitar licença: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * Executa a configuração completa do ambiente iOS
	 */
	public async setupComplete(): Promise<iOSSetupResult> {
		if (!this.isMacOS()) {
			return {
				success: false,
				message: "Configuração iOS só está disponível no macOS",
			};
		}

		p.log.info("\n🍎 Configurando ambiente iOS/macOS...\n");

		// 1. Verifica Xcode Tools
		const xcodeTools = this.detectXcodeTools();
		if (!xcodeTools.installed) {
			p.log.warn("⚠️  Xcode Command Line Tools não detectado");
			const installResult = await this.installXcodeTools();
			if (!installResult.success) {
				return installResult;
			}
		} else {
			p.log.success(`✓ Xcode Command Line Tools instalado`);
			p.log.info(`  Path: ${xcodeTools.path}`);
		}

		// 2. Verifica versão do Xcode
		const xcodeVersion = this.detectXcodeVersion();
		if (xcodeVersion) {
			p.log.success(`✓ Xcode ${xcodeVersion} detectado`);
		}

		// 3. Aceita licença do Xcode
		const licenseResult = await this.acceptXcodeLicense();
		if (!licenseResult.success) {
			p.log.warn(`⚠️  ${licenseResult.message}`);
		}

		// 4. Verifica CocoaPods
		const cocoapods = this.detectCocoaPods();
		if (cocoapods.installed) {
			p.log.success(`✓ CocoaPods ${cocoapods.version} instalado`);
		} else {
			p.log.warn("⚠️  CocoaPods não detectado. Instale com: brew install cocoapods");
		}

		p.log.success("\n✓ Configuração do ambiente iOS concluída!\n");

		return {
			success: true,
			message: "Ambiente iOS configurado com sucesso",
			xcodeVersion,
			cocoapodsVersion: cocoapods.version,
		};
	}
}

