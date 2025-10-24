/**
 * Generates a git branch name from user info, issue ID, and title
 * Format: {username}/{issueId}-{slugified-title}
 * Example: thomas/ter-20-add-support-for-linear-cli-integration
 */
export function generateBranchName(
  username: string,
  issueIdentifier: string,
  issueTitle: string
): string {
  // Slugify the title: lowercase, replace spaces/special chars with hyphens
  const slugifiedTitle = issueTitle
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  return `${username.toLowerCase()}/${issueIdentifier}-${slugifiedTitle}`;
}
