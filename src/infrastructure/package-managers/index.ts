/**
 * Exportações dos adapters de gerenciadores de pacotes
 */
export { HomebrewAdapter, HomebrewNotInstalledError } from "./homebrew-adapter.js";
export { HomebrewInstaller } from "./homebrew-installer.js";
export { WinGetAdapter, WinGetNotInstalledError } from "./winget-adapter.js";
export { APTAdapter, APTNotAvailableError } from "./apt-adapter.js";
export { LinuxInstaller } from "./linux-installer.js";

