import { Request, Response } from 'express';
import os from 'os';
import { execSync } from 'child_process';

export interface DiagnosticCheck {
  id: string;
  name: string;
  category: 'runtime' | 'package_manager' | 'vcs' | 'container' | 'system';
  installed: boolean;
  version?: string;
  details?: string;
  status: 'passed' | 'warning' | 'failed';
  recommendation?: string;
  installCommand?: string;
}

export interface DiagnosticsResult {
  timestamp: string;
  system: {
    platform: string;
    arch: string;
    cpus: number;
    totalMemoryGB: number;
    freeMemoryGB: number;
  };
  checks: DiagnosticCheck[];
  overallStatus: 'all_passed' | 'has_warnings' | 'has_failures';
}

function runCommandSafe(command: string, timeoutMs: number = 2000): string | null {
  try {
    const output = execSync(command, {
      timeout: timeoutMs,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return output.trim();
  } catch {
    return null;
  }
}

export async function getDiagnostics(_req: Request, res: Response): Promise<void> {
  const checks: DiagnosticCheck[] = [];

  // 1. Node.js Check
  const nodeVersion = process.version; // e.g. "v20.10.0"
  const majorVersion = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
  if (majorVersion >= 18) {
    checks.push({
      id: 'node',
      name: 'Node.js Runtime',
      category: 'runtime',
      installed: true,
      version: nodeVersion,
      details: `Active Node.js runtime (${nodeVersion}) meets modern LTS standards (>= v18.0.0).`,
      status: 'passed',
    });
  } else if (majorVersion >= 14) {
    checks.push({
      id: 'node',
      name: 'Node.js Runtime',
      category: 'runtime',
      installed: true,
      version: nodeVersion,
      details: `Node.js ${nodeVersion} is older than recommended LTS (v18+).`,
      status: 'warning',
      recommendation: 'Upgrade to Node.js 18 or 20 LTS for optimum compatibility.',
      installCommand: 'nvm install --lts && nvm use --lts',
    });
  } else {
    checks.push({
      id: 'node',
      name: 'Node.js Runtime',
      category: 'runtime',
      installed: true,
      version: nodeVersion,
      details: `Unsupported Node.js version (${nodeVersion}).`,
      status: 'failed',
      recommendation: 'Install modern Node.js LTS.',
      installCommand: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
    });
  }

  // 2. npm Check
  const npmVersion = runCommandSafe('npm -v');
  if (npmVersion) {
    checks.push({
      id: 'npm',
      name: 'npm Package Manager',
      category: 'package_manager',
      installed: true,
      version: `v${npmVersion}`,
      details: `Default Node package manager available.`,
      status: 'passed',
    });
  } else {
    checks.push({
      id: 'npm',
      name: 'npm Package Manager',
      category: 'package_manager',
      installed: false,
      status: 'failed',
      details: 'npm binary could not be found in PATH.',
      recommendation: 'Reinstall Node.js or run corepack enable.',
      installCommand: 'corepack enable',
    });
  }

  // 3. Optional alternative Package Managers (pnpm, yarn, bun)
  const pnpmVersion = runCommandSafe('pnpm -v');
  if (pnpmVersion) {
    checks.push({
      id: 'pnpm',
      name: 'pnpm Package Manager',
      category: 'package_manager',
      installed: true,
      version: `v${pnpmVersion}`,
      details: 'Fast, disk space efficient package manager ready.',
      status: 'passed',
    });
  }

  const yarnVersion = runCommandSafe('yarn -v');
  if (yarnVersion) {
    checks.push({
      id: 'yarn',
      name: 'Yarn Package Manager',
      category: 'package_manager',
      installed: true,
      version: `v${yarnVersion}`,
      details: 'Classic/Modern Yarn package manager ready.',
      status: 'passed',
    });
  }

  const bunVersion = runCommandSafe('bun -v');
  if (bunVersion) {
    checks.push({
      id: 'bun',
      name: 'Bun Runtime & Package Manager',
      category: 'runtime',
      installed: true,
      version: `v${bunVersion}`,
      details: 'All-in-one JavaScript runtime and toolkit detected.',
      status: 'passed',
    });
  }

  // 4. Git Check
  const gitRaw = runCommandSafe('git --version');
  if (gitRaw) {
    const gitUser = runCommandSafe('git config user.name');
    const gitEmail = runCommandSafe('git config user.email');
    const hasIdentity = Boolean(gitUser && gitEmail);

    checks.push({
      id: 'git',
      name: 'Git Version Control',
      category: 'vcs',
      installed: true,
      version: gitRaw.replace(/^git version\s*/i, 'v'),
      details: hasIdentity
        ? `Configured as ${gitUser} <${gitEmail}>`
        : 'Git is installed, but user.name / user.email are not set.',
      status: hasIdentity ? 'passed' : 'warning',
      recommendation: hasIdentity
        ? undefined
        : 'Configure your git author credentials so your commits are attributed correctly.',
      installCommand: hasIdentity
        ? undefined
        : 'git config --global user.name "Your Name" && git config --global user.email "you@example.com"',
    });
  } else {
    checks.push({
      id: 'git',
      name: 'Git Version Control',
      category: 'vcs',
      installed: false,
      status: 'failed',
      details: 'Git is not installed or not found in system PATH.',
      recommendation: 'Install Git to clone repositories and manage version control.',
      installCommand: process.platform === 'darwin' ? 'brew install git' : 'sudo apt update && sudo apt install git -y',
    });
  }

  // 5. Docker Check
  const dockerVersionRaw = runCommandSafe('docker --version');
  if (dockerVersionRaw) {
    const dockerInfo = runCommandSafe('docker ps', 1500);
    const daemonRunning = dockerInfo !== null;

    checks.push({
      id: 'docker',
      name: 'Docker Engine',
      category: 'container',
      installed: true,
      version: dockerVersionRaw.replace(/^Docker version\s*/i, 'v').split(',')[0],
      details: daemonRunning
        ? 'Docker daemon is active and responsive.'
        : 'Docker CLI is installed, but the daemon is not running.',
      status: daemonRunning ? 'passed' : 'warning',
      recommendation: daemonRunning
        ? undefined
        : 'Start Docker Desktop to run containerized services and databases.',
      installCommand: process.platform === 'darwin' ? 'open -a Docker' : 'sudo systemctl start docker',
    });
  } else {
    checks.push({
      id: 'docker',
      name: 'Docker Engine',
      category: 'container',
      installed: false,
      status: 'warning',
      details: 'Docker CLI not detected. Required if your stack relies on containerized databases.',
      recommendation: 'Install Docker Desktop if your project uses Docker Compose or containerized services.',
      installCommand: process.platform === 'darwin' ? 'brew install --cask docker' : 'https://docs.docker.com/engine/install/',
    });
  }

  // System metrics
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const freeMemGB = Number((freeMem / (1024 * 1024 * 1024)).toFixed(1));
  const totalMemGB = Number((totalMem / (1024 * 1024 * 1024)).toFixed(1));

  if (freeMemGB < 0.8) {
    checks.push({
      id: 'memory',
      name: 'Available System Memory',
      category: 'system',
      installed: true,
      details: `Low available memory: ${freeMemGB} GB free out of ${totalMemGB} GB total.`,
      status: 'warning',
      recommendation: 'Close unused heavy processes to ensure fast builds and compilation.',
    });
  }

  // Calculate overall status
  const hasFailed = checks.some((c) => c.status === 'failed');
  const hasWarning = checks.some((c) => c.status === 'warning');
  const overallStatus: DiagnosticsResult['overallStatus'] = hasFailed
    ? 'has_failures'
    : hasWarning
    ? 'has_warnings'
    : 'all_passed';

  const result: DiagnosticsResult = {
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemoryGB: totalMemGB,
      freeMemoryGB: freeMemGB,
    },
    checks,
    overallStatus,
  };

  res.json(result);
}
