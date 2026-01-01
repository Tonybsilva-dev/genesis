#!/usr/bin/env bun
/**
 * Script de release para gerar binários para todas as plataformas
 */

import { existsSync, mkdirSync, rmSync, readdirSync, statSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const DIST_DIR = "dist";
const VERSION = process.env.VERSION || "1.0.0";

interface BuildTarget {
	name: string;
	target: string;
	extension: string;
}

const TARGETS: BuildTarget[] = [
	{ name: "macos-arm64", target: "bun-darwin-arm64", extension: "" },
	{ name: "macos-x64", target: "bun-darwin-x64", extension: "" },
	{ name: "linux-x64", target: "bun-linux-x64", extension: "" },
	{ name: "linux-arm64", target: "bun-linux-arm64", extension: "" },
	{ name: "windows-x64", target: "bun-windows-x64", extension: ".exe" },
];

function log(message: string): void {
	console.log(`\x1b[36m[Release]\x1b[0m ${message}`);
}

function error(message: string): void {
	console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
}

function success(message: string): void {
	console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
}

function cleanDist(): void {
	if (existsSync(DIST_DIR)) {
		log("Limpando diretório dist...");
		rmSync(DIST_DIR, { recursive: true });
	}
	mkdirSync(DIST_DIR, { recursive: true });
}

function buildTarget(target: BuildTarget): boolean {
	const outfile = join(DIST_DIR, `genesis-${target.name}${target.extension}`);
	const command = `bun build ./src/index.ts --compile --target=${target.target} --outfile ${outfile}`;

	log(`Compilando para ${target.name}...`);

	try {
		execSync(command, { stdio: "inherit" });
		success(`✓ ${target.name} compilado com sucesso`);
		return true;
	} catch (e) {
		error(`✗ Falha ao compilar para ${target.name}`);
		return false;
	}
}

function getFileSize(filepath: string): string {
	const stats = statSync(filepath);
	const bytes = stats.size;

	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showSummary(): void {
	log("\n📦 Resumo dos binários gerados:\n");

	const files = readdirSync(DIST_DIR);
	for (const file of files) {
		const filepath = join(DIST_DIR, file);
		const size = getFileSize(filepath);
		console.log(`   ${file.padEnd(30)} ${size}`);
	}

	console.log();
	success(`Release v${VERSION} concluído!`);
	log(`Binários disponíveis em: ./${DIST_DIR}/\n`);
}

async function main(): Promise<void> {
	console.log("\n🚀 Genesis Release Builder\n");
	log(`Versão: ${VERSION}`);

	// Limpa e prepara o diretório
	cleanDist();

	// Compila para todos os targets
	let successCount = 0;
	let failCount = 0;

	for (const target of TARGETS) {
		if (buildTarget(target)) {
			successCount++;
		} else {
			failCount++;
		}
	}

	console.log();

	if (failCount > 0) {
		error(`${failCount} compilação(ões) falharam`);
	}

	if (successCount > 0) {
		showSummary();
	}

	process.exit(failCount > 0 ? 1 : 0);
}

main();

