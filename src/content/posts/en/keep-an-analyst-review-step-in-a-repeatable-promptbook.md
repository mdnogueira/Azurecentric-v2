---
title: "Keep an analyst review step in a repeatable promptbook"
description: "Use PowerShell scripts to manage Security Copilot Promptbooks, including a mandatory analyst review step in the JSON structure."
pubDate: 2026-04-11
category: governance
tags: ["security-copilot", "promptbooks", "automation", "powershell", "incident-response"]
translationKey: keep-an-analyst-review-step-in-a-repeatable-promptbook
draft: true
---

You are building a repeatable incident response workflow in Microsoft Security Copilot. The goal is to ensure that automated prompts do not execute blindly but include a mandatory analyst review step before proceeding to sensitive actions. This keeps the process auditable and prevents automation from making irreversible decisions without human oversight.

Promptbooks in Security Copilot allow you to chain prompts together. They are stored as JSON files. You can manage these files using PowerShell scripts provided in the Azure Security Copilot GitHub repository. These scripts use unpublished API calls, which means they are subject to change without notice and are not officially supported by Microsoft. You cannot raise support tickets for their functionality. Treat them as a practical tool for prototyping or internal tooling, not as a permanent production dependency.

[![Promptbook Management and Review Flow](/images/posts/2026/azc-297-checkpoints.svg)](/images/posts/2026/azc-297-checkpoints.svg)

## Structure the Promptbook for an Analyst Review

The core of your workflow is the JSON structure. You need to define prompts that gather context, ask for an analyst's decision, and then branch or continue based on that decision. Security Copilot Promptbooks execute prompts sequentially. To insert a review step, you simply add a prompt that asks the analyst for confirmation or input.

Here is an illustrative example of a Promptbook JSON structure. It gathers information about a user, asks the analyst to assess risk, and then requests a summary. This is a hypothetical scenario to demonstrate the structure.

```json
{
  "name": "Analyst Review Workflow",
  "description": "A promptbook that requires analyst review before summarising",
  "prompts": [
    {
      "promptType": "Prompt",
      "content": "Give me more information on <user>"
    },
    {
      "promptType": "Prompt",
      "content": "Is this user considered risky based on the previous context?"
    },
    {
      "promptType": "Prompt",
      "content": "Are there other Defender incidents concerning this user?"
    },
    {
      "promptType": "Prompt",
      "content": "Give a summary of all results so far"
    }
  ],
  "promptbookinputs": [
    {
      "name": "user",
      "description": "User input"
    }
  ],
  "visibility": "Private",
  "tags": null
}
```

This code is an illustrative example and has not been tested. The variable `user` in `promptbookinputs` must match the `<user>` placeholder in the prompts exactly. Variable names are case-sensitive. The token name and its description cannot be the same text.

The key to the review step is the prompt content itself. You are not changing the engine; you are changing the conversation flow. By asking "Is this user considered risky?", you force the analyst to engage with the output before the next prompt runs. This is a simple but effective way to keep a human in the loop.

## Manage Promptbooks with PowerShell

The GitHub repository provides two PowerShell scripts: `PromptBooksDownload.ps1` and `PromptBooksUpload.ps1`. These scripts allow you to bulk manage Promptbooks. They are not part of the official Azure CLI or PowerShell modules. You must download them from the repository.

### Prerequisites

1.  **Access and Permissions**: You must have appropriate access to create Promptbooks in Security Copilot. Check the [authentication documentation](https://learn.microsoft.com/en-us/security-copilot/authentication) for your specific tenant configuration.
2.  **Browser Session**: You need an active session in Microsoft Edge. The scripts require an access token that cannot be fetched via Azure CLI login.
3.  **Folder Structure**: Create a local folder with `Downloads` and `Uploads` subfolders. Place your JSON files in `Uploads` before running the upload script.

### Obtaining the Access Token

The scripts require a bearer token. You must extract this from your browser session.

1.  Log in to the Security Copilot console in Microsoft Edge.
2.  Open Developer Tools (F12).
3.  Navigate to the **Network** tab.
4.  Go to the **Promptbooks** section in the console to trigger a request.
5.  Filter for `Promptbooks` in the Network tab.
6.  Select a GET request to the Promptbooks URI (e.g., `https://api.securitycopilot.microsoft.com/geo/eastus/promptbooks`).
7.  Copy the `Authorization` header value. Remove the `Bearer ` keyword and any leading or trailing spaces.

This token is valid for a fixed amount of time. For security reasons, you must log out of the Security Copilot console after using it to invalidate the token.

### Uploading Promptbooks

Place your JSON files in the `Uploads` folder. Run the following command, replacing `<authorization token>` with your copied token.

```powershell
Powershell -file PromptBooksUpload.ps1 -token Exampleauthorizationtoken
```

The script will output the file name and status for each upload. If you get an error, check the troubleshooting section below.

### Downloading Promptbooks

To download existing Promptbooks, run:

```powershell
Powershell -file PromptBooksDownload.ps1 -token Exampleauthorizationtoken
```

You can optionally filter by name using the `-namecontains` parameter. For example, to download only Promptbooks with "CVE" in the name:

```powershell
Powershell -file PromptBooksDownload.ps1 -token Exampleauthorizationtoken -namecontains "CVE"
```

The downloaded files are stored in the `Downloads` folder. Note that during download, fields identifying the source (tenant, creation time) are removed. Visibility is set to `Private`. Plugins assigned to prompts are also removed. If you upload these to another tenant, they will be private and require manual visibility changes.

## Troubleshooting

*   **HTTP 401**: Ensure the token is valid, not expired, and has no extra spaces. Also, verify the URI in the PowerShell script matches your region. The default is `eastus`. If your instance is elsewhere, edit line 11 of the script.
*   **HTTP 400**: Check the JSON format. Ensure variable names in `promptbookinputs` match the placeholders in prompts exactly. Case sensitivity matters.
*   **HTTP 500**: Validate the JSON syntax. Use a JSON formatter to check for missing or extra commas.

## Verification

After uploading, verify the Promptbook appears in the Security Copilot console. Run it with a test input to ensure the analyst review step behaves as expected. The prompt should pause for analyst input before proceeding to the next step. This confirms the workflow is structured correctly.

Remember, these scripts are a convenience for bulk management. They do not replace the need for careful Promptbook design. The review step is a logical construct within the prompt chain, not a technical feature of the upload script. Keep your JSON files version-controlled and review them before uploading to production.


References for Keep an analyst review step in a repeatable promptbook: [readme](https://github.com/Azure/Security-Copilot/blob/3081c3b2a4d14d2f8c5383a3f31c7bd503862477/Promptbook samples/Powershell to Manage Promptbooks/readme.md).
