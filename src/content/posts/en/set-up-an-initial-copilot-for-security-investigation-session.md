---
title: "Set up an initial Copilot for Security investigation session"
description: "Contribute to the Copilot for Security community repository by forking, branching, and submitting a pull request for a new plugin."
pubDate: 2024-08-08
category: security-copilot
tags: ["microsoft-security-copilot", "plugins", "contribution", "github", "git"]
translationKey: set-up-an-initial-copilot-for-security-investigation-session
draft: false
---

The Microsoft Copilot for Security community repository is a place where users can contribute plugins and other resources to help the wider security community. If you have developed a KQL plugin or a workflow that you believe would be useful to others, the process involves forking the repository, making your changes in a local branch, and submitting a pull request for review.

This guide walks you through the technical steps to contribute code to the `Azure/Copilot-For-Security` repository. It assumes you have a GitHub account and are familiar with basic Git operations.

## Fork the repository

The first step is to create your own copy of the repository. This allows you to make changes without affecting the main community repository.

1. Navigate to the Copilot for Security community page on GitHub.
2. Ensure you are on the `master` branch.
3. Click the **Fork** button and select **Create a new fork**.

This creates a copy of the repository under your own GitHub account. You will now have your own `Copilot-For-Security` repository that you can modify freely.

## Clone the fork to your local machine

Next, you need to clone your fork to your local development environment. You can use Git Bash, GitHub Desktop, or any Git client.

1. Create a directory on your local machine where you will work. For example, `C:\Users\(username)\Documents\GitForks`.
2. Open your terminal or Git Bash and navigate to that directory.
3. Run the following commands:

```bash
git init
git clone https://github.com/(username)/Copilot-For-Security-Fork.git
cd Copilot-For-Security-Fork
```

Replace `(username)` with your GitHub username. This clones your fork into a local directory.

## Set the upstream remote

To keep your fork in sync with the original community repository, you need to add the original repository as an `upstream` remote. This allows you to pull updates from the main repository into your fork.

Run the following command:

```bash
git remote add upstream https://github.com/Azure/Copilot-For-Security
```

Verify that the remotes are set correctly by running:

```bash
git remote -v
```

You should see two remotes: `origin` pointing to your fork, and `upstream` pointing to the Azure community repository.

## Create a new branch

It is best practice to work on a separate branch for each contribution. This keeps your changes isolated and makes it easier to manage multiple contributions.

1. First, sync your local repository with the upstream `main` branch to ensure you have the latest changes:

```bash
git pull upstream main
```

2. Create a new branch for your contribution. Use a descriptive name for the branch.

```bash
git checkout -b my-kql-plugin
```

## Make your changes

Now you can create and edit your files. For example, if you are contributing a KQL plugin, you might create a new folder under `Community Based Plugins` and add a `.yml` file.

1. Open your local repository in Visual Studio Code or your preferred editor.
2. Create the necessary files and directories.
3. Stage your changes by clicking the **Source Control** icon in VS Code, entering a commit message, and clicking the **+** to stage them.
4. Commit the changes by clicking the checkmark.

## Push your changes and create a pull request

Once you are happy with your changes, you need to push them to your fork on GitHub and then create a pull request to the main repository.

1. Push your branch to your fork:

```bash
git push origin my-kql-plugin
```

2. Go to your fork on GitHub. You should see a prompt to **Compare & pull request** for your new branch.
3. Click **Compare & pull request**.
4. In the pull request description, provide a clear summary of your changes and what the plugin does. This helps reviewers understand your contribution.
5. Click **Create pull request**.

The pull request will trigger automated checks. If these pass, it will be reviewed by the community maintainers. Once approved, your changes will be merged into the main repository.

## Sync your local repository after merge

After your pull request is merged, you should update your local repository to reflect the changes.

1. Pull the latest changes from the `upstream` repository:

```bash
git pull upstream main
```

2. Verify that your changes are now in your local `main` branch.

This ensures that your local repository is up to date with the community repository.


Reference: [README](https://github.com/Azure/Security-Copilot/blob/a6f3ba73e1ad766d5279b63bd333414e3a59b89a/README.md).
