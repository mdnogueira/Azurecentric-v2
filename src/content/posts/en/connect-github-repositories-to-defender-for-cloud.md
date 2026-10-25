---
title: "Connect GitHub repositories to Defender for Cloud"
description: "Connect GitHub to Defender for Cloud posture management and configure the Microsoft Security DevOps action for code scanning."
pubDate: 2024-09-28
category: governance
tags: ["defender-for-cloud", "github", "devops-security", "github-actions", "msdo"]
translationKey: connect-github-repositories-to-defender-for-cloud
draft: false
---

Defender for Cloud does not automatically scan your GitHub repositories for security issues. To get a complete picture of your DevOps security, you need to combine two distinct capabilities: DevOps security posture management and code scanning. The first step is to link your GitHub organization to Defender for Cloud. This creates a connector that allows Defender for Cloud to discover your repositories and apply posture assessments. However, this alone does not scan your code. To enable code scanning, you must also configure the Microsoft Security DevOps (MSDO) GitHub action in your workflows.

## Connect your GitHub organization

[![Defender for Cloud GitHub Integration Flow](/images/posts/2024/azc-097-checkpoints.svg)](/images/posts/2024/azc-097-checkpoints.svg)

Start by navigating to the **Environment settings** page in Microsoft Defender for Cloud. Select **Add environment** and choose **GitHub** from the list of available connectors [Connect your GitHub organizations](https://learn.microsoft.com/en-us/azure/defender-for-cloud/quickstart-onboard-github). You will need to provide a name for the connector, select the target Azure subscription, resource group, and region. The subscription you choose is where Defender for Cloud stores the connection details.

Next, you must authorize access. Select **Next: Configure access** and then **Authorize**. This step redirects you to GitHub to sign in with an account that has the necessary permissions. If you delay the installation of the DevOps security GitHub application, the session may time out [Connect your GitHub organizations](https://learn.microsoft.com/en-us/azure/defender-for-cloud/quickstart-onboard-github).

Once authorized, you will be prompted to install the **Defender for Cloud GitHub application**. It is recommended to grant access to **all repositories** within the selected organizations to ensure comprehensive coverage [Connect your GitHub organizations](https://learn.microsoft.com/en-us/azure/defender-for-cloud/quickstart-onboard-github). You can choose to automatically discover all existing organizations or include future ones as well. After selecting the organizations, review the configuration and select **Create**.

:::image type="content" source="/images/posts/2024/azc-097-learn-1.png" alt-text="Screenshot that shows selections for adding GitHub as a connector." lightbox="/images/posts/2024/azc-097-learn-1.png":::

Upon successful creation, the connector appears on the **Environment settings** page. Note that it may take up to eight hours for resources to appear in the Defender for Cloud inventory [Connect your GitHub organizations](https://learn.microsoft.com/en-us/azure/defender-for-cloud/quickstart-onboard-github). At this stage, you have posture visibility, but you do not yet have code scanning results.

## Configure the Microsoft Security DevOps action

To enable code scanning, you need to add the Microsoft Security DevOps GitHub action to your repository workflows. This action runs static analysis tools during your CI/CD pipeline and sends the results to Defender for Cloud [Configure the Microsoft Security DevOps GitHub action](https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-action).

First, ensure that **Workflow permissions** are set to **Read and Write** on the repository. This includes setting `id-token: write` permissions to allow federation with Defender for Cloud [Configure the Microsoft Security DevOps GitHub action](https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-action).

Navigate to your repository in GitHub and select **Actions**. Create a new workflow and choose **set up a workflow yourself**. Name the file, for example, `msdevopssec.yml`, and paste the following sample configuration:

```yml
name: MSDO
on:
  push:
    branches:
      - main

jobs:
  sample:
    name: Microsoft Security DevOps

    # Windows and Linux agents are supported
    runs-on: windows-latest

    permissions:
      contents: read
      id-token: write
      actions: read
      # Write access for security-events is only required for customers looking for MSDO results to appear in the codeQL security alerts tab on GitHub (Requires GHAS)
      security-events: write

    steps:
      # Checkout your code repository to scan
    - uses: actions/checkout@v3

      # Run analyzers
    - name: Run Microsoft Security DevOps
      uses: microsoft/security-devops-action@latest
      id: msdo
```

This example illustrates a basic workflow. The `microsoft/security-devops-action@latest` step runs the analyzers. The `id-token: write` permission is critical for the action to authenticate with Defender for Cloud securely [Configure the Microsoft Security DevOps GitHub action](https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-action). You can customize the action with configuration files or specific tool lists, but the default settings run a comprehensive set of tools including Bandit, Checkov, and Trivy [Configure the Microsoft Security DevOps GitHub action](https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-action).

Commit the file to your repository. The workflow will trigger automatically on the next push to the main branch. You can verify the action is running by navigating to the **Actions** tab in your repository [Configure the Microsoft Security DevOps GitHub action](https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-action).

:::image type="content" source="/images/posts/2024/azc-097-learn-2.png" alt-text="Screenshot that shows you where the Actions button is located." lightbox="/images/posts/2024/azc-097-learn-2.png":::

## Verify the results

After the workflow completes, the scan results should appear in Defender for Cloud. Navigate to **Microsoft Defender for Cloud** > **DevOps Security**. You should see the security findings from the MSDO action within minutes [Configure the Microsoft Security DevOps GitHub action](https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-action). If you have GitHub Advanced Security enabled, these findings may also appear in the code scanning alerts tab on GitHub [Configure the Microsoft Security DevOps GitHub action](https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-action).

It is important to distinguish between the connector and the action. The connector provides posture management and repository configuration assessments. The MSDO action provides code scanning results. Both are required for a complete DevOps security posture in Defender for Cloud. If you do not see results, check the workflow logs in GitHub to ensure the action completed successfully and that the `id-token` permission was correctly configured [Configure the Microsoft Security DevOps GitHub action](https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-action).
