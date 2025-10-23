import { execSync } from 'child_process';

export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}

/**
 * Checks if git is installed on the system
 */
export function isGitInstalled(): boolean {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if we're inside a git repository
 */
export function isGitRepo(): boolean {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if there are unstaged changes in the working directory
 */
export function hasUnstagedChanges(): boolean {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf-8' });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Checks if a branch already exists
 */
export function branchExists(branchName: string): boolean {
  try {
    const output = execSync(`git branch --list ${branchName}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

export function checkForSafeGitStatus(): boolean {
  // Check if git is installed
  if (!isGitInstalled()) {
    throw new GitError(
      'Git is not installed or not found in PATH. Please install Git to continue.'
    );
  }

  // Check if we're in a git repository
  if (!isGitRepo()) {
    throw new GitError(
      'Not a git repository. Please initialize a git repo first with: git init'
    );
  }

  // Check for unstaged changes
  if (hasUnstagedChanges()) {
    throw new GitError(
      'You have unstaged changes. Please commit or stash them before creating a new branch.'
    );
  }
  return true;
}

/**
 * Creates and checks out a new git branch
 * Handles validation and error reporting
 */
export function createAndCheckoutBranch(branchName: string): void {
  checkForSafeGitStatus();

  // Check if branch already exists
  if (branchExists(branchName)) {
    throw new GitError(`Branch "${branchName}" already exists.`);
  }

  // Create and checkout the branch
  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
  } catch (error) {
    throw new GitError(`Failed to create branch "${branchName}": ${error}`);
  }
}
