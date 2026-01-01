/**
 * Exportações dos serviços da camada de aplicação
 */
export { InstallationService, type InstallationResult } from "./installation-service.js";
export { HealthCheckService, type HealthReport, type ToolHealthInfo } from "./health-check-service.js";
export { AndroidSetupService, type AndroidSetupResult } from "./android-setup-service.js";
export { iOSSetupService, type iOSSetupResult } from "./ios-setup-service.js";
