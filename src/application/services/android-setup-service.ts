import { homedir } from "os";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { getCurrentOS } from "../../domain/services/os-detector.js";
import { getEnvironmentManager } from "../../infrastructure/environment/index.js";
import * as p from "@clack/prompts";

/**
 * Resultado da configuração do Android
 */
export interface AndroidSetupResult {
	success: boolean;
	message: string;
	androidHome?: string;
	javaHome?: string;
}

/**
 * Serviço para configuração do ambiente Android
 */
export class AndroidSetupService {
	private androidHome: string;
	private javaHome: string | undefined;

	constructor() {
		// Define o ANDROID_HOME padrão por SO
		const os = getCurrentOS();
		const home = homedir();

		// Primeiro verifica se já existe ANDROID_HOME definido
		const envAndroidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
		if (envAndroidHome && existsSync(envAndroidHome)) {
			this.androidHome = envAndroidHome;
			return;
		}

		// Verifica caminhos comuns do Homebrew (macOS)
		const homebrewPaths = [
			"/opt/homebrew/share/android-commandlinetools", // Apple Silicon
			"/usr/local/share/android-commandlinetools", // Intel
		];

		for (const brewPath of homebrewPaths) {
			if (existsSync(brewPath)) {
				this.androidHome = brewPath;
				return;
			}
		}

		// Caminhos padrão por SO
		switch (os) {
			case "macos":
				this.androidHome = join(home, "Library", "Android", "sdk");
				break;
			case "linux":
				this.androidHome = join(home, "Android", "Sdk");
				break;
			case "windows":
				this.androidHome = join(
					process.env.LOCALAPPDATA || home,
					"Android",
					"Sdk"
				);
				break;
			default:
				this.androidHome = join(home, "Android", "Sdk");
		}
	}

	/**
	 * Detecta se o JDK está instalado e retorna a versão
	 */
	public detectJava(): { installed: boolean; version?: string; home?: string } {
		try {
			const output = execSync("java -version 2>&1", { encoding: "utf-8" });
			const versionMatch = output.match(/version "(\d+)/);
			const version = versionMatch ? versionMatch[1] : undefined;

			// Tenta detectar JAVA_HOME
			let javaHome = process.env.JAVA_HOME;
			if (!javaHome) {
				try {
					const os = getCurrentOS();
					if (os === "macos") {
						// Tenta detectar via java_home
						javaHome = execSync("/usr/libexec/java_home 2>/dev/null", {
							encoding: "utf-8",
						}).trim();
					}
				} catch {
					// Tenta caminhos comuns para JDK
					const jdkPaths = [
						"/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home",
						"/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home",
						"/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
					];
					for (const path of jdkPaths) {
						if (existsSync(path)) {
							javaHome = path;
							break;
						}
					}
				}
			}

			this.javaHome = javaHome;

			return {
				installed: true,
				version,
				home: javaHome,
			};
		} catch {
			// Mesmo que java não esteja no PATH, verifica caminhos comuns
			const jdkPaths = [
				// Temurin JDK 17 (Homebrew)
				"/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home",
				// Zulu JDK 17 (Homebrew)
				"/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home",
				// Outros caminhos comuns
				"/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
				"/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
			];
			for (const path of jdkPaths) {
				if (existsSync(path)) {
					this.javaHome = path;
					return {
						installed: true,
						version: "17",
						home: path,
					};
				}
			}
			return { installed: false };
		}
	}

	/**
	 * Detecta se o Android SDK está instalado
	 */
	public detectAndroidSdk(): {
		installed: boolean;
		home?: string;
		hasCmdlineTools: boolean;
	} {
		// Verifica se ANDROID_HOME já está definido
		const envAndroidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
		if (envAndroidHome && existsSync(envAndroidHome)) {
			this.androidHome = envAndroidHome;
		}

		const installed = existsSync(this.androidHome);

		// Verifica vários caminhos possíveis para o sdkmanager
		const possiblePaths = [
			join(this.androidHome, "cmdline-tools", "latest", "bin", "sdkmanager"),
			join(this.androidHome, "cmdline-tools", "bin", "sdkmanager"),
			"/opt/homebrew/bin/sdkmanager", // Homebrew Apple Silicon
			"/usr/local/bin/sdkmanager", // Homebrew Intel
		];

		const hasCmdlineTools = possiblePaths.some((p) => existsSync(p));

		return {
			installed: installed || hasCmdlineTools,
			home: this.androidHome,
			hasCmdlineTools,
		};
	}

	/**
	 * Configura as variáveis de ambiente do Android
	 */
	public async configureEnvironment(): Promise<AndroidSetupResult> {
		const envManager = getEnvironmentManager();

		try {
			// Configura ANDROID_HOME
			p.log.step("Configurando ANDROID_HOME...");
			const androidHomeResult = await envManager.setVariable(
				"ANDROID_HOME",
				this.androidHome
			);
			if (!androidHomeResult.success) {
				return {
					success: false,
					message: `Falha ao configurar ANDROID_HOME: ${androidHomeResult.message}`,
				};
			}

			// Configura ANDROID_SDK_ROOT (alias)
			await envManager.setVariable("ANDROID_SDK_ROOT", this.androidHome);

			// Configura JAVA_HOME se detectado
			if (this.javaHome) {
				p.log.step("Configurando JAVA_HOME...");
				await envManager.setVariable("JAVA_HOME", this.javaHome);
			}

			// Adiciona os diretórios ao PATH
			p.log.step("Adicionando diretórios do Android ao PATH...");

			const pathsToAdd = [
				join(this.androidHome, "cmdline-tools", "latest", "bin"),
				join(this.androidHome, "platform-tools"),
				join(this.androidHome, "emulator"),
				join(this.androidHome, "tools"),
				join(this.androidHome, "tools", "bin"),
			];

			for (const path of pathsToAdd) {
				// Cria o diretório se não existir
				if (!existsSync(path)) {
					try {
						mkdirSync(path, { recursive: true });
					} catch {
						// Ignora erro - o diretório será criado quando o SDK for instalado
					}
				}
				await envManager.addToPath(path);
			}

			p.log.success("✓ Variáveis de ambiente do Android configuradas");

			return {
				success: true,
				message: "Ambiente Android configurado com sucesso",
				androidHome: this.androidHome,
				javaHome: this.javaHome,
			};
		} catch (error) {
			return {
				success: false,
				message: `Erro ao configurar ambiente: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * Aceita as licenças do Android SDK automaticamente
	 */
	public async acceptLicenses(): Promise<AndroidSetupResult> {
		const sdkInfo = this.detectAndroidSdk();

		if (!sdkInfo.hasCmdlineTools) {
			return {
				success: false,
				message:
					"sdkmanager não encontrado. Instale o Android SDK Command-line Tools primeiro.",
			};
		}

		const sdkmanagerPath = join(
			this.androidHome,
			"cmdline-tools",
			"latest",
			"bin",
			"sdkmanager"
		);

		try {
			p.log.step("Aceitando licenças do Android SDK...");

			// Executa yes | sdkmanager --licenses
			execSync(`yes | "${sdkmanagerPath}" --licenses`, {
				encoding: "utf-8",
				stdio: "pipe",
				env: {
					...process.env,
					ANDROID_HOME: this.androidHome,
					ANDROID_SDK_ROOT: this.androidHome,
				},
			});

			p.log.success("✓ Licenças do Android SDK aceitas");

			return {
				success: true,
				message: "Licenças do Android SDK aceitas com sucesso",
				androidHome: this.androidHome,
			};
		} catch (error) {
			// Se o erro for porque todas as licenças já foram aceitas, consideramos sucesso
			const errorMsg = error instanceof Error ? error.message : String(error);
			if (
				errorMsg.includes("All SDK package licenses accepted") ||
				errorMsg.includes("licenses not accepted")
			) {
				return {
					success: true,
					message: "Licenças já foram aceitas anteriormente",
					androidHome: this.androidHome,
				};
			}

			return {
				success: false,
				message: `Erro ao aceitar licenças: ${errorMsg}`,
			};
		}
	}

	/**
	 * Instala componentes básicos do Android SDK
	 */
	public async installBasicComponents(): Promise<AndroidSetupResult> {
		const sdkInfo = this.detectAndroidSdk();

		if (!sdkInfo.hasCmdlineTools) {
			return {
				success: false,
				message:
					"sdkmanager não encontrado. Instale o Android SDK Command-line Tools primeiro.",
			};
		}

		const sdkmanagerPath = join(
			this.androidHome,
			"cmdline-tools",
			"latest",
			"bin",
			"sdkmanager"
		);

		const components = [
			"platform-tools",
			"platforms;android-34",
			"build-tools;34.0.0",
		];

		try {
			p.log.step("Instalando componentes básicos do Android SDK...");

			for (const component of components) {
				p.log.info(`  Instalando ${component}...`);
				execSync(`"${sdkmanagerPath}" "${component}"`, {
					encoding: "utf-8",
					stdio: "pipe",
					env: {
						...process.env,
						ANDROID_HOME: this.androidHome,
						ANDROID_SDK_ROOT: this.androidHome,
					},
				});
			}

			p.log.success("✓ Componentes básicos instalados");

			return {
				success: true,
				message: "Componentes básicos do Android SDK instalados",
				androidHome: this.androidHome,
			};
		} catch (error) {
			return {
				success: false,
				message: `Erro ao instalar componentes: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * Executa a configuração completa do ambiente Android
	 */
	public async setupComplete(): Promise<AndroidSetupResult> {
		p.log.info("\n📱 Configurando ambiente Android...\n");

		// 1. Verifica Java
		const javaInfo = this.detectJava();
		if (!javaInfo.installed) {
			p.log.warn(
				"⚠️  JDK não detectado. Instale o JDK 17 Zulu para desenvolvimento Android."
			);
		} else {
			p.log.success(`✓ Java ${javaInfo.version} detectado`);
			if (javaInfo.home) {
				p.log.info(`  JAVA_HOME: ${javaInfo.home}`);
			}
		}

		// 2. Verifica Android SDK
		const sdkInfo = this.detectAndroidSdk();
		if (!sdkInfo.installed) {
			p.log.warn(
				"⚠️  Android SDK não detectado. Instale o Android Studio ou SDK Command-line Tools."
			);
		} else {
			p.log.success(`✓ Android SDK detectado`);
			p.log.info(`  ANDROID_HOME: ${sdkInfo.home}`);

			if (!sdkInfo.hasCmdlineTools) {
				p.log.warn("⚠️  Command-line Tools não encontrado no SDK");
			}
		}

		// 3. Configura variáveis de ambiente
		const envResult = await this.configureEnvironment();
		if (!envResult.success) {
			return envResult;
		}

		// 4. Aceita licenças (se SDK instalado)
		if (sdkInfo.hasCmdlineTools) {
			const licenseResult = await this.acceptLicenses();
			if (!licenseResult.success) {
				p.log.warn(`⚠️  ${licenseResult.message}`);
			}
		}

		p.log.success("\n✓ Configuração do ambiente Android concluída!\n");

		return {
			success: true,
			message: "Ambiente Android configurado com sucesso",
			androidHome: this.androidHome,
			javaHome: this.javaHome,
		};
	}
}

