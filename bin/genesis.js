#!/usr/bin/env node

/**
 * Genesis CLI - Entry point
 * Ferramenta de automação de setup de ambiente de desenvolvimento
 * 
 * @author Antonio B. Silva
 * @license MIT
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importa e executa o código principal
const mainPath = join(__dirname, '..', 'dist', 'index.js');
await import(mainPath);

