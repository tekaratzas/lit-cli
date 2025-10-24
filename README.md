# Lit

[![GitHub Repo stars](https://img.shields.io/github/stars/tekaratzas/lit-cli?style=social)](https://github.com/tekaratzas/lit-cli)
[![License](https://img.shields.io/github/license/tekaratzas/lit-cli)](https://github.com/tekaratzas/lit-cli/blob/main/LICENSE)
![GitHub Release](https://img.shields.io/github/v/release/tekaratzas/lit-cli)

Linear + Git in one CLI. Don't let Linear drift from the code.

Feels like you are just using git, but you are also keeping those Linear issues nice and tidy!

**This CLI runs locally and is BYOK.**

In this version 0. Only two commands are supported

### 1. A command to create a new Issue and Branch at the same time.

lit checkout -b "description of problem"

- Runs description through ChatGPT 4o-mini to generate issue title, description + determine if it's a bug/Feature/Improvement.
- Creates new Linear Issue
- Generates the Linear automation friendly branch name (exactly how Linear does it in the UI)
- Does git checkout -b LinearbranchName

### 2. A command to switch branches via discription of the Linear Issue.

lit switch "description of issue"

- Runs a search through Linear for issues matching the description
- if multiple hits, will ask to disambiguate
- Assigns issue to you, marks in Progress
- git checkout the branch name

## Getting Started

### Install

After cloning the repo, build and link with:

```
npm run install-global
```

### API Keys

You'll need two API keys:

**Linear API Key:**
1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Create a personal API key
3. Set environment variable: `export LINEAR_API_KEY=<your_key>`

**OpenAI API Key:**
1. Go to [OpenAI Platform > API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Set environment variable: `export OPENAI_API_KEY=<your_key>`

Alternatively, add both to a `.env` file in the project root and the CLI will load them automatically.

That's it. You're ready to use `lit`!

