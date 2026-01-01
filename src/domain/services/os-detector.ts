import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { release } from "os";
import type { OperatingSystem, OSDetectionResult } from "../types/os.js";

/**
 * Mapeia process.platform para os tipos internos do Genesis
 */
function mapPlatformToOS(platform: string): OperatingSystem | null {
	switch (platform) {
		case "darwin":
			return "macos";
		case "win32":
			return "windows";
		case "linux":
			return "linux";
		default:
			return null;
	}
}

/**
 * Detecta o sistema operacional atual
 * Retorna o tipo de SO e valida se é suportado
 */
export async function detectOS(): Promise<OSDetectionResult> {
	const platform = process.platform;
	const mappedOS = mapPlatformToOS(platform);

	if (!mappedOS) {
		return {
			os: "linux", // fallback
			isSupported: false,
			error: `Sistema operacional não suportado: ${platform}`,
		};
	}

	// Validações específicas por SO
	if (mappedOS === "windows") {
		return await validateWindows();
	}

	if (mappedOS === "linux") {
		return await validateLinux();
	}

	// macOS não precisa de validação adicional
	return {
		os: "macos",
		isSupported: true,
	};
}

/**
 * Valida se é Windows 11
 */
async function validateWindows(): Promise<OSDetectionResult> {
	const osRelease = release();

	// Windows 11 tem versão 10.0.22000 ou superior
	const majorVersion = parseInt(osRelease.split(".")[0], 10);
	const buildNumber = parseInt(osRelease.split(".")[2] || "0", 10);

	const isWindows11 = majorVersion >= 10 && buildNumber >= 22000;

	if (!isWindows11) {
		return {
			os: "windows",
			version: osRelease,
			isSupported: false,
			error: `Windows 11 é necessário. Versão detectada: ${osRelease}`,
		};
	}

	return {
		os: "windows",
		version: osRelease,
		isSupported: true,
	};
}

/**
 * Valida se é Ubuntu (lendo /etc/os-release)
 */
async function validateLinux(): Promise<OSDetectionResult> {
	const osReleasePath = "/etc/os-release";

	if (!existsSync(osReleasePath)) {
		return {
			os: "linux",
			isSupported: false,
			error: "Arquivo /etc/os-release não encontrado",
		};
	}

	try {
		const content = await readFile(osReleasePath, "utf-8");
		const lines = content.split("\n");

		let id: string | undefined;
		let versionId: string | undefined;

		for (const line of lines) {
			if (line.startsWith("ID=")) {
				// Remove aspas se houver
				id = line.split("=")[1]?.trim().replace(/^"|"$/g, "");
			} else if (line.startsWith("VERSION_ID=")) {
				versionId = line.split("=")[1]?.trim().replace(/^"|"$/g, "");
			}
		}

		if (id?.toLowerCase() !== "ubuntu") {
			return {
				os: "linux",
				version: versionId,
				isSupported: false,
				error: `Distribuição não suportada. Detectado: ${id}. Apenas Ubuntu é suportado.`,
			};
		}

		return {
			os: "linux",
			version: versionId,
			isSupported: true,
		};
	} catch (error) {
		return {
			os: "linux",
			isSupported: false,
			error: `Erro ao ler /etc/os-release: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

/**
 * Função auxiliar para obter o SO atual de forma síncrona (sem validações)
 * Útil para casos onde não precisamos validar versão específica
 */
export function getCurrentOS(): OperatingSystem {
	const mappedOS = mapPlatformToOS(process.platform);
	return mappedOS || "linux"; // fallback
}
