/**
 * Tipos de sistema operacional suportados pelo Genesis
 */
export type OperatingSystem = 'macos' | 'windows' | 'linux';

/**
 * Resultado da detecção de sistema operacional
 */
export interface OSDetectionResult {
  os: OperatingSystem;
  version?: string;
  isSupported: boolean;
  error?: string;
}

