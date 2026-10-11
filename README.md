# Lit - Manage your Linear tickets without ever leaving your Git workflow.

[![npm version](https://img.shields.io/npm/v/linear-lit-cli.svg)](https://www.npmjs.com/package/linear-lit-cli)
[![npm downloads](https://img.shields.io/npm/dm/linear-lit-cli.svg)](https://www.npmjs.com/package/linear-lit-cli)
[![GitHub Repo stars](https://img.shields.io/github/stars/tekaratzas/lit-cli?style=social)](https://github.com/tekaratzas/lit-cli)
[![License](https://img.shields.io/github/license/tekaratzas/lit-cli)](https://github.com/tekaratzas/lit-cli/blob/main/LICENSE)

Perfect for the engineers who love building, but hate having to track everything.

Feels like you are just using git, but you are also keeping those Linear issues nice and tidy!

**This CLI runs 100% locally. Configure your Linear API key once and you're ready to go!**

## Lit Checkout - Create Linear Issue and Git branch in one command
https://github.com/user-attachments/assets/daab979e-1066-4249-8ba8-4ae9645d62d5

## Lit Switch - Search Linear Issues + switch to correct branch in one command
https://github.com/user-attachments/assets/cc6cdcde-41a4-4e27-bd6a-09a4cb54458c

## Features

In this version 0.1, only three commands are supported

### 1. A command to switch branches via description of the Linear Issue.

```bash
lit switch "description of issue"
```

- Runs a search through Linear for issues matching the description
- If multiple hits, will ask to disambiguate
- Assigns issue to you, marks as in progress
- git checkout the branch name (creaets it if it doesn't exist)

### 2. A command to commit changes and leave a comment on the ticket.

```bash
lit commit "commit message/issue comment"
```

- Figures out correct issue based on branch
- leaves a comment on the issue
- git commit -m <message>

### 3. A command to create a new Issue and branch at the same time.

```bash
lit checkout "Issue Title" -d "Description of Issue" -t f
```

- Parses arguments: title, description (optional), issye type [bug, feature, improvement] (optional)
- Creates new Linear Issue
- Generates the Linear automation friendly branch name (exactly how Linear does it in the UI)
- Does git checkout -b LinearbranchName


## Getting Started

### Quick Setup (3 steps)

**1. Install**

Install globally via npm:

```bash
npm install -g linear-lit-cli
```

**2. Get your Linear API Key**

Visit [linear.app/settings/account/security](https://linear.app/settings/account/security) and create a personal API key.

**3. Configure (Recommended)**

Save your API key permanently with one command:

```bash
lit config set linear-api-key <your_key>
```

Your key is stored securely at `~/.config/lit-cli/config.json` and you'll never need to set it again!

Done! Now you can use `lit` from anywhere. 🎉

---

### Development Setup

Want to contribute or run from source?

```bash
git clone https://github.com/tekaratzas/lit-cli.git
cd lit-cli
npm install
npm run install-global
```

---

### Other Ways to Configure (Optional)

Already using environment variables? No problem! While `lit config set` is the easiest method, you can also:

**Environment Variable:**
```bash
export LINEAR_API_KEY=<your_key>
```
Add to `~/.zshrc` or `~/.bashrc` for persistence.

**Interactive Prompt:**  
If no API key is found, `lit` will prompt you when you run a command (useful for quick testing).

> **Note:** Priority order is: Environment variable → Config file → Interactive prompt

### Config Management

```bash
# Set your API key (recommended)
lit config set linear-api-key <your_key>

# View your config (API key is masked for security)
lit config list

# Get a specific value
lit config get linear-api-key
```

Config is stored at: `~/.config/lit-cli/config.json`

### Repository team and project

Set the Linear destination once per Git repository:

```bash
lit config set team DA --local
lit config set project "https://linear.app/your-workspace/project/your-project-0123456789ab/overview" --local
lit config list --local
```

Replace `DA` and the example project URL with your team's key and project. Team UUIDs
are also accepted; projects accept a UUID, the 12-character ID from their URL, or
the full Linear project URL. Project names are not identifiers.

These commands write `.lit.json` at the Git root, including when run from a
subdirectory or linked worktree:

```json
{
  "team": "DA",
  "project": "0123456789ab"
}
```

Commit `.lit.json` to share the destination with contributors and agents before
running `lit checkout`, which requires a clean working tree. API keys stay in the
existing user configuration or `LINEAR_API_KEY`; `.lit.json` accepts only `team`
and `project`. Remove the `project` key to work across the whole team.

- `checkout` creates tickets in that team and, when configured, that project.
- `switch` searches only that team/project and excludes completed and canceled
  tickets. It does not move existing tickets into the configured project.
- Label names are matched case-insensitively, preferring the team's label over a
  workspace-wide label. Labels belonging to other teams are never used.
- Status changes use that team's `In Progress` started state, or its only started
  state when there is no state named `In Progress`.

Invalid destinations, projects outside the selected team, and missing or ambiguous
labels/states fail before creating or updating tickets. Without a configured team,
`checkout` and `switch` use your sole team membership; if you belong to multiple
teams, configure one explicitly. `commit` continues to identify its ticket from
the current branch.

To verify changes while developing (Node.js 22.19+):

```bash
npm ci
npm test
```

---

## Usage

Once configured, you can use these commands:

```bash
# Create a new Linear issue and checkout a branch
lit checkout "Fix login bug" -d "Users can't login" -t bug

# Switch to an existing issue's branch
lit switch "login bug"

# Commit and comment on the current issue
lit commit "Fixed authentication logic"

# Manage configuration
lit config set linear-api-key <your_key>
lit config list
```

### Command Reference

**`lit checkout <title> [options]`** (alias: `co`)
- `-d, --description <text>` - Issue description
- `-t, --type <type>` - Issue type: `b`/`bug`, `f`/`feature`, `i`/`improvement`

**`lit switch <description>` (alias: `sw`)**
- Searches Linear for matching issues
- Prompts to select if multiple matches found

**`lit commit <message>` (alias: `cm`)**
- Commits with message and posts comment to Linear issue

**`lit config <command>`**
- `set <key> <value> [--local]` - Set an API key, or a repository team/project with `--local`
- `get <key> [--local]` - Get a value from the selected scope
- `list [--local]` - Show values from the selected scope

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
