# Lit

[![GitHub Repo stars](https://img.shields.io/github/stars/tekaratzas/lit-cli?style=social)](https://github.com/tekaratzas/lit-cli)
[![License](https://img.shields.io/github/license/tekaratzas/lit-cli)](https://github.com/tekaratzas/lit-cli/blob/main/LICENSE)
![GitHub Release](https://img.shields.io/github/v/release/tekaratzas/lit-cli)


## lit checkout - Create Linear Issue and Git branch in one command
https://github.com/user-attachments/assets/daab979e-1066-4249-8ba8-4ae9645d62d5

## lit switch - Search Linear Issues + switch to correct branch in one command
https://github.com/user-attachments/assets/cc6cdcde-41a4-4e27-bd6a-09a4cb54458c

Linear + Git in one CLI. Don't let Linear drift from the code.

Perfect for the engineer who loves building, hates tracking.

Feels like you are just using git, but you are also keeping those Linear issues nice and tidy!

**This CLI runs locally and is BYOK.**

## Features

In this version 0, only two commands are supported

### 1. A command to create a new Issue and Branch at the same time.

lit checkout "Issue Title" -d "Description of Issue" -t f

- Parses arguments
- Creates new Linear Issue
- Generates the Linear automation friendly branch name (exactly how Linear does it in the UI)
- Does git checkout -b LinearbranchName

### 2. A command to switch branches via description of the Linear Issue.

lit switch "description of issue"

- Runs a search through Linear for issues matching the description
- If multiple hits, will ask to disambiguate
- Assigns issue to you, marks as in progress
- git checkout the branch name

## Getting Started

### Install

After cloning the repo, build and link with:

```
npm run install-global
```

### API Keys

You'll need just one API key:

**Linear API Key:**
1. Go to [Linear Settings > Security/Access](https://linear.app/settings/account/security)
2. Create a personal API key
3. Set environment variable: `export LINEAR_API_KEY=<your_key>`


Alternatively, add to a `.env` file in the project root and the CLI will load them automatically.

That's it. You're ready to use `lit`!

