---
title: "Use promptbooks for repeatable security investigations"
description: "Use unofficial PowerShell scripts to export and import Microsoft Security Copilot promptbooks as JSON, noting the lack of support and API volatility."
pubDate: 2025-01-26
category: governance
tags: []
translationKey: use-promptbooks-for-repeatable-security-investigations
draft: false
---

You need to move a security investigation workflow between environments, but the Microsoft Security Copilot interface does not offer a direct export or import button for promptbooks. The only available method relies on community-supplied PowerShell scripts that interact with the underlying API. These scripts are not officially supported by Microsoft, use unpublished API calls, and are subject to change without notice. You should treat them as a temporary automation tool rather than a stable operational component. If the API structure changes, these scripts will break, and Microsoft support cannot assist with their functionality.

## Understanding the Promptbook structure

A promptbook is a JSON object that defines a sequence of prompts and any required inputs. The structure is straightforward but strict. It contains a name, a description, an array of prompts, and an array of inputs. Each prompt in the list is executed in sequence. The inputs allow you to define variables that users must provide when running the promptbook.

A typical promptbook looks like this:

```json
{
  "name": "User Risk Investigation",
  "description": "Investigate a specific user account for risk indicators",
  "prompts": [
    {
      "promptType": "Prompt",
      "content": "Give me more information on <user>"
    },
    {
      "promptType": "Prompt",
      "content": "Is this user considered risky"
    },
    {
      "promptType": "Prompt",
      "content": "Are there other Defender incidents concerning this user"
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

Notice the `promptbookinputs` array. This defines the variables that the promptbook expects. In the prompts above, `<user>` is a placeholder that will be replaced by the value provided in the `user` input. The variable names are case-sensitive. If the name in the prompt does not match the name in the inputs array exactly, the upload will fail. The token name and its description cannot be the same text.

## Preparing the environment

You will need PowerShell installed on your local machine. You also need the two scripts provided in the Azure Security Copilot GitHub repository: `PromptBooksDownload.ps1` and `PromptBooksUpload.ps1`. These scripts expect a specific folder structure. Create a root folder for your operation. Inside it, create two subfolders named `Downloads` and `Uploads`. The scripts will use these directories to store the JSON files.

The scripts interact with the Security Copilot API, which is region-specific. The default configuration in the scripts assumes the `eastus` region. If your Security Copilot instance is hosted in a different region, you must edit line 11 of both PowerShell scripts to update the URI. Failure to do so will result in upload failures.

## Obtaining an access token

The Azure CLI cannot currently fetch the token required for these scripts. You must obtain it from an active browser session. Open Microsoft Edge and sign in to the Security Copilot console. Complete the multi-factor authentication process if prompted.

Once logged in, press `F12` to open the Developer Tools. Navigate to the Network tab. In the console, go to the Promptbooks section. This action will trigger a network request. Filter the network log for `promptbooks`. You should see a GET request to a URI similar to `https://api.securitycopilot.microsoft.com/geo/eastus/promptbooks`.

Select that request and look at the Headers. Find the `Authorization` header. The value will start with `Bearer `. Copy the entire token string, but exclude the `Bearer ` prefix and any trailing spaces. This token is your authorization key for the scripts. Treat this token as a secret. It grants access to your Security Copilot instance. Do not store it in plain text files or share it.

## Downloading existing promptbooks

To export your current promptbooks, open a PowerShell window in the root folder where you placed the scripts. Run the download script, passing your token as an argument. You can optionally filter by name using the `-namecontains` parameter.

```powershell
Powershell -file PromptBooksDownload.ps1 -token Exampleyouraccesstoken
```

If you only want promptbooks related to a specific topic, such as CVEs, you can use:

```powershell
Powershell -file PromptBooksDownload.ps1 -token Exampleyouraccesstoken -namecontains "CVE"
```

The script will download all matching promptbooks into the `Downloads` folder. Each promptbook is saved as a separate JSON file. The filename is derived from the promptbook name, with spaces and special characters removed.

Note that the download process removes certain metadata for security reasons. Fields that identify the source tenant or creation time are stripped. The visibility of all downloaded promptbooks is set to `Private`. If you plan to upload these to another tenant, you will need to manually change the visibility if you want them to be visible in the organization. The `Plugins` field assigned to each prompt is also removed during download. This means any promptbook relying on specific plugins will lose that integration upon download and re-upload. You must manually re-assign plugins after uploading if they were present in the original promptbook.

## Uploading promptbooks

To import promptbooks, place your JSON files in the `Uploads` folder. Ensure each promptbook is in its own file. Then run the upload script with your token.

```powershell
Powershell -file PromptBooksUpload.ps1 -token Exampleyouraccesstoken
```

The script will iterate through each file in the `Uploads` folder and attempt to upload it to your Security Copilot instance. It will output the filename and the status of each upload. If successful, the promptbook will appear in your console.

## Troubleshooting common errors

If you encounter errors, check the HTTP status code returned by the script.

*   **HTTP 401**: This indicates an authentication issue. Ensure your token is valid and has not expired. Check for leading or trailing spaces when you paste the token. Also, verify that the region in the script URI matches your Security Copilot instance region.
*   **HTTP 400**: This usually points to a JSON format error. Check the variable names in your `promptbookinputs` array against the placeholders in your prompts. The names must match exactly, including case. The token name and its description cannot be the same text.
*   **HTTP 500**: This often indicates a malformed JSON file. Check for missing or extra commas. Use a JSON formatter to validate your files before uploading.

## Security and maintenance

Once you have completed your download or upload tasks, log out of the Security Copilot console in your browser. This invalidates the access token. While the token has a fixed expiration time, explicit logout ensures it cannot be reused. This is a critical security step, especially if you are working in a shared environment.

Keep in mind that these scripts use unpublished API calls. Microsoft may change the API structure or the JSON schema without notice. If you find that the scripts no longer work, check the GitHub repository for updates. Do not raise support tickets for issues related to the functionality of these scripts, as they are not officially supported.

For a deeper understanding of how to build and use promptbooks within the interface, refer to the official Microsoft Learn documentation on [Using Promptbooks](https://learn.microsoft.com/en-us/security-copilot/using-promptbooks) and [Build your own promptbooks](https://learn.microsoft.com/en-us/security-copilot/build-promptbooks). Ensure you have the appropriate permissions to create promptbooks in your tenant before attempting to upload them.

tags: [security-copilot, promptbooks, automation, powershell, json, security-investigation]
diagram:
  title: Promptbook Export and Import Flow
  nodes:
    - Browser Session: User logs into Security Copilot and retrieves API token via DevTools.
    - PowerShell Scripts: Download or Upload scripts execute with the token and target folder.
    - JSON Files: Promptbooks are stored as individual JSON files in Downloads/Uploads folders.
    - API Endpoint: Scripts send requests to the region-specific Security Copilot API.
    - Security Copilot Instance: Promptbooks are created or retrieved based on the script action.
claims:
  - claim: The PowerShell scripts use unpublished API calls and are not officially supported by Microsoft.
    source_id: S1
    evidence_span: "This method to upload Promptbooks uses unpublished API calls that are subject to change without notice. This is not an officially supported method from Microsoft"
  - claim: Downloaded promptbooks have their visibility set to Private and source metadata removed.
    source_id: S1
    evidence_span: "During the download process, certain fields from the Promptbook that can identify the source... are removed... Also the visibility for all Promptbooks is set to 'Private'"
  - claim: The scripts require the URI to match the region of the Security Copilot instance.
    source_id: S1
    evidence_span: "If your Security Copilot instance is not in 'eastus' you will have to change the URI in line 11 so the URI contains the correct region. The upload will fail is this is not corrected."
  - claim: Variable names in promptbook inputs must match prompt placeholders exactly and are case-sensitive.
    source_id: S1
    evidence_span: "Make sure the variable sed in Promptbook inputs matches the specification in prompts and it is case-sensitive."
review_questions:
  - "What is the long-term support strategy if Microsoft changes the unpublished API structure?"
  - "Are there any official Microsoft-supported methods for bulk promptbook management planned for future releases?"
  - "How does the removal of the 'Plugins' field affect promptbooks that rely on specific security plugins?"
}

References for Use promptbooks for repeatable security investigations: [readme](https://github.com/Azure/Security-Copilot/blob/3081c3b2a4d14d2f8c5383a3f31c7bd503862477/Promptbook samples/Powershell to Manage Promptbooks/readme.md).
