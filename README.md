# Lit

[![GitHub Repo stars](https://img.shields.io/github/stars/tekaratzas/lit-cli?style=social)](https://github.com/tekaratzas/lit-cli)
[![License](https://img.shields.io/github/license/tekaratzas/lit-cli)](https://github.com/tekaratzas/lit-cli/blob/main/LICENSE)
![GitHub Release](https://img.shields.io/github/v/release/tekaratzas/lit-cli)

Linear + Git in one CLI. 

Feels like you are just using git, but you are also keeping those Linear issues nice and tidy!

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

After you cloned the repo, you will need to build + link. I added little helper to make this easier.

```
npm run install-global
```

Next, you need both your personal Linear API Key + an OpenAI API Key. Once you have them, simple exports will do the trick.

```
export LINEAR_API_KEY=<linear api key>
export OPENAI_API_KEY=<openAI api key>
```

Now you should be able to run lit!

