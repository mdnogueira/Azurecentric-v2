---
title: "Investigate an Arc-enabled server that appears disconnected"
description: "Troubleshoot an Azure Arc-enabled server showing as disconnected by checking agent logs, network connectivity, and resource state."
pubDate: 2024-12-18
category: cloud
tags: ["azure-arc", "troubleshooting", "hybrid-compute", "azcmagent", "connectivity"]
translationKey: investigate-an-arc-enabled-server-that-appears-disconnected
draft: false
---

An Arc-enabled server showing as disconnected usually means the Azure Connected Machine agent can no longer reach the Azure Arc service, or the local agent service has stopped responding. Before you start tearing down configurations, confirm whether the issue is network-related, credential-related, or a local agent failure. The first step is always to check the agent's own logs and connectivity status from the machine itself.

## Check the local agent status and logs

The Azure Connected Machine agent runs as a service on the server. If it is not running, or if it is running but cannot authenticate, the server will appear disconnected in the Azure portal. Start by verifying the service state on the machine.

On Windows, check the status of the **Azure Connected Machine Agent** service. On Linux, check the `azcmagent` systemd service. If the service is stopped, start it and observe whether the connection state changes. If the service is running but the server remains disconnected, the agent is likely failing to communicate with Azure or has encountered an error during authentication.

The agent writes detailed logs to a local file. On Windows, this is located at `%ProgramData%\AzureConnectedMachineAgent\Log\azcmagent.log`. On Linux, it is at `/var/opt/azcmagent/log/azcmagent.log` [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard). These logs contain the output of the `azcmagent` tool commands, including verbose output if it was enabled during installation or subsequent commands. Look for error codes or messages indicating network failures, authentication errors, or service unavailability.

You can also collect a full set of logs for deeper analysis or to share with support. Run the following command on the server:

```console
azcmagent logs --full --output "/tmp/azcmagent-logs.zip"
```

This creates a ZIP archive containing the most recent log files [azcmagent logs CLI reference](https://learn.microsoft.com/en-us/azure/azure-arc/servers/azcmagent-logs). If you need logs from an older time period, the `--full` flag ensures all available logs are included. The archive is saved to the specified path, with a default name including the timestamp and computer name if no path is provided [azcmagent logs CLI reference](https://learn.microsoft.com/en-us/azure/azure-arc/servers/azcmagent-logs).

## Run the agent connectivity check

Once you have reviewed the logs, use the `azcmagent check` command to verify that the agent can reach the required Azure endpoints. This command tests network connectivity to Microsoft Entra ID and Azure Resource Manager, which are essential for the agent to function.

Run the check with verbose output to see detailed results:

```console
azcmagent check --verbose
```

The output will indicate whether specific endpoints are reachable. Common failures include:

- **Network unreachable**: The agent cannot resolve or connect to `login.windows.net` or `management.azure.com`. This often points to a firewall, proxy, or DNS issue on the server or the network path [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
- **Forbidden**: A proxy or firewall is blocking access to the endpoints, even if they are resolvable [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
- **Service unavailable**: The HIMDS service (on Windows) or the equivalent agent service (on Linux) is not responding [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).

If the check fails, address the network or service issues first. Ensure that the required endpoints are not blocked by local firewalls or corporate proxies. If you are using a Private Link Scope, ensure that the agent is configured with the correct Private Link Scope resource ID [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).

## Verify the Azure resource state

If the local agent and network appear healthy, the issue might be with the Azure resource itself. The server might have been deleted in Azure, or the resource provider might not be registered correctly.

Check the Azure portal or use the Azure CLI to verify the state of the Arc-enabled server resource:

```console
az resource show --name <server-name> --resource-group <resource-group> --namespace Microsoft.HybridCompute --resource-type machines
```

If the resource does not exist, the agent cannot connect. If the resource exists but shows an unexpected state, review the error messages in the agent logs. Common errors include:

- **Resource not found**: The server was deleted in Azure, but the agent is still trying to connect. In this case, you may need to disconnect the agent locally using `azcmagent disconnect --force-local-only` [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
- **Permission denied**: The service principal or user account used by the agent no longer has the necessary permissions. Verify that the user or service principal has the required permissions for onboarding, as detailed in the [prerequisites documentation](https://learn.microsoft.com/en-us/azure/azure-arc/servers/prerequisites#required-permissions) [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
- **Resource provider not registered**: The `Microsoft.HybridCompute` resource provider might not be registered in the subscription. Register it using `az provider register -n Microsoft.HybridCompute`.

## Review agent error codes

The agent uses specific error codes to indicate failures. Refer to the [agent error codes table](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard) in the official documentation to identify the cause of the issue. For example:

- **AZCM0026**: Network configuration error or critical service unavailable. Check endpoint reachability [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
- **AZCM0041**: Invalid credentials. Verify the service principal secret or user account permissions [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
- **AZCM0061, AZCM0064, AZCM0065, AZCM0066, AZCM0070**: Agent service not responding. Verify the service is running and restart it if necessary [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
- **AZCM0081, AZCM0105**: Error downloading the Microsoft Entra managed identity certificate. Delete the Azure resource and reconnect [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).

If the error code is not listed or the issue persists after following the suggested remediation, consider submitting a support ticket with the collected logs.

## Disconnect and reconnect if necessary

In some cases, the agent state may become corrupted, and a clean reconnection is the most reliable fix. Before doing this, ensure you have the necessary permissions and that the network is configured correctly.

1. **Disconnect the agent locally**: Run `azcmagent disconnect` on the server. If this fails, use `azcmagent disconnect --force-local-only` [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
2. **Delete the Azure resource**: If the agent reports that the resource still exists or if you suspect the Azure resource is in an inconsistent state, delete the Arc-enabled server resource in Azure. This is particularly relevant for errors like AZCM0081 or AZCM0105 [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).
3. **Reconnect the agent**: Run the `azcmagent connect` command with the correct parameters, including the resource group, tenant ID, location, and subscription ID. Use the `--verbose` flag to monitor the process.

For at-scale installations using a service principal, ensure the service principal ID and secret are correct and that the secret has not expired [Troubleshoot Azure Connected Machine agent connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/servers/troubleshoot-agent-onboard).

## Verify the connection

After addressing the issue, verify that the server is connected. In the Azure portal, the server should show as **Connected**. You can also run `azcmagent check` again to confirm that all endpoints are reachable.

If the server remains disconnected, review the logs again and check for any new error codes. Ensure that the HIMDS service (Windows) or the agent service (Linux) is running and that there are no network changes that might have occurred since the last check.

If you are still unable to resolve the issue, use the collected logs to open a support ticket with Microsoft. Provide the error codes, log excerpts, and the steps you have already taken to troubleshoot the problem.
