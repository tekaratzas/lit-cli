# Lit - Manage your Linear tickets without ever leaving your Git workflow.

[![GitHub Repo stars](https://img.shields.io/github/stars/tekaratzas/lit-cli?style=social)](https://github.com/tekaratzas/lit-cli)
[![License](https://img.shields.io/github/license/tekaratzas/lit-cli)](https://github.com/tekaratzas/lit-cli/blob/main/LICENSE)
![GitHub Release](https://img.shields.io/github/v/release/tekaratzas/lit-cli)

Perfect for the engineers who love building, but hate having to track everything.

Feels like you are just using git, but you are also keeping those Linear issues nice and tidy!

**This CLI runs 100% locally. Configure your Linear API key once and you're ready to go!**

## Lit Checkout - Create Linear Issue and Git branch in one command
https://github.com/user-attachments/assets/daab979e-1066-4249-8ba8-4ae9645d62d5

## Lit Switch - Search Linear Issues + switch to correct branch in one command
https://github.com/user-attachments/assets/cc6cdcde-41a4-4e27-bd6a-09a4cb54458c

## Features

In this version 0.1, only two commands are supported

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

### Install

After cloning the repo, build and link with:

```bash
npm run install-global
```

### Configuration

You'll need a Linear API key to use `lit`. There are three ways to provide it:

**Option 1: Config file (Recommended)**

Set your API key once and it will be saved permanently:

```bash
lit config set linear-api-key <your_key>
```

Your config is stored at `~/.config/lit-cli/config.json`

**Option 2: Environment variable**

Set the environment variable in your shell:

```bash
export LINEAR_API_KEY=<your_key>
```

Add this to your `~/.zshrc` or `~/.bashrc` to make it permanent.

**Option 3: Interactive prompt**

If no API key is found, `lit` will prompt you for it when you run a command.

**Getting your Linear API Key:**
1. Go to [Linear Settings > Security/Access](https://linear.app/settings/account/security)
2. Create a personal API key
3. Use one of the methods above to configure it

### Config Commands

```bash
# Set a config value
lit config set linear-api-key <your_key>

# Get a config value
lit config get linear-api-key

# List all config values
lit config list
```

That's it. You're ready to use `lit`!