---
title: "Review agent logs when an Arc extension fails"
description: "Diagnose Arc extension failures by separating agent diagnostics from Guest Config extension logs."
pubDate: 2025-09-20
category: cloud
tags: ["azure-arc", "troubleshooting", "vm-extensions", "azcmagent", "logs"]
translationKey: review-agent-logs-when-an-arc-extension-fails
draft: false
---

An Azure Arc-enabled server extension fails to install or report status. The portal shows a generic error or a timeout. The first thing to check is not the Azure portal, but the machine itself. The Azure Connected Machine agent and the extensions it manages write detailed logs locally. Extracting and reading those logs is the fastest way to determine whether the failure is due to network connectivity, missing dependencies, or a configuration error.

## Collect the agent logs

[![Arc Extension Failure Troubleshooting Flow](/images/posts/2025/azc-225-checkpoints.svg)](/images/posts/2025/azc-225-checkpoints.svg)

The `azcmagent` command-line tool includes a dedicated command for gathering diagnostic data. This command packages the relevant log files into a ZIP archive, which is useful for sharing with support or for offline analysis.

Run the following command on the connected machine to collect the most recent logs:

```console
azcmagent logs
```

This creates a file named `azcmagent-_TIMESTAMP_-_COMPUTERNAME_.zip` in the current directory. If the issue is older or the most recent logs do not contain the necessary context, use the `--full` flag to collect all available log files:

```console
azcmagent logs --full --output "C:\temp\full-logs.zip"
```

The `--output` flag allows you to specify a custom path and filename. On Linux, the equivalent command is:

```bash
azcmagent logs --full --output /tmp/full-logs.zip
```

These logs include output from `azcmagent` commands, including those run with the `--verbose` flag during installation or connection attempts. The verbose logs are particularly useful because they show the exact commands and responses that led to a failure. For example, if an extension installation failed due to a missing dependency, the verbose log will often capture the specific error message returned by the package manager or the extension handler.

## Check extension-specific logs

While `azcmagent logs` provides a broad view of the agent's activity, VM extensions often write their own detailed logs. These logs are managed by the Guest Config service, which handles the provisioning of extensions on Arc-enabled servers.

On Windows, the Guest Config service writes logs to:

- `%SystemDrive%\ProgramData\GuestConfig\ext_mgr_logs` for general extension manager activity.
- `%SystemDrive%\ProgramData\GuestConfig\extension_logs\<Extension>` for logs specific to a particular extension.

On Linux, the corresponding paths are:

- `/var/lib/GuestConfig/ext_mgr_logs` for general extension manager activity.
- `/var/lib/GuestConfig/extension_logs` for logs from individual extensions.

These directories contain files named after the extension. For example, if you are troubleshooting the Log Analytics agent, look for files related to `MicrosoftMonitoringAgent` or `OmsAgentForLinux`. The content of these logs varies by extension, but they typically include the exit code, any error messages, and the steps taken during installation.

## Common failure patterns

Once you have the logs, look for specific patterns that indicate the root cause.

### Network connectivity

If the extension fails to download or communicate with Azure, the logs will often show network errors. For example, a failure to acquire an authorization token might result in a message like:

```
Error occurred while sending request for Device Authorization Code: Post https://login.windows.net/.../oauth2/devicecode?api-version=1.0: dial tcp 40.126.9.7:443: connect: network is unreachable.
```

In this case, the `azcmagent check` command can help verify whether a firewall or proxy is blocking access to required endpoints such as `login.windows.net` or `management.azure.com`.

### Missing dependencies

Extensions often require specific dependencies to be installed. For example, the Log Analytics agent for Linux requires Python 2 and other packages. If these are missing, the extension log might report an error code such as `52`, indicating a missing dependency. The log will usually specify which package is missing, allowing you to install it manually or adjust the extension configuration.

### Timeout issues

On slow machines or those with slow network connections, extensions may time out during installation. The logs might show a timeout error, but the installation might succeed if retried. In such cases, checking the extension status in the portal after a retry can confirm whether the issue was transient.

## Verify the fix

After addressing the identified issue, verify that the extension is now functioning correctly. You can do this by:

1. Checking the extension status in the Azure portal. It should show as `Succeeded` or `Running`.
2. Checking the extension-specific logs to confirm that the extension is operating as expected.

If the issue persists, the collected logs from `azcmagent logs` can be submitted to Microsoft Support for further analysis. Ensure that you include the `--full` flag when collecting logs if the issue is intermittent or if the most recent logs do not show the failure.

By focusing on the local logs first, you can often resolve extension issues without needing to involve support or spend time troubleshooting in the portal. The key is to collect the right logs, look for specific error patterns, and address the root cause directly on the machine.

References for Review agent logs when an Arc extension fails: [azcmagent logs CLI reference](https://learn.microsoft.com/en-us/azure/azure-arc/servers/azcmagent-logs), [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard), [Troubleshoot Azure Arc-enabled servers VM extension issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-vm-extensions).
