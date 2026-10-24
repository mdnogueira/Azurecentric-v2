---
title: "Connect a Linux server to Azure Arc"
description: "Connect a Linux server to Azure Arc using the azcmagent CLI, covering prerequisites, installation, authentication, and verification."
pubDate: 2025-07-30
category: cloud
tags: ["azure-arc", "linux", "connected-machine", "azcmagent", "onboarding"]
translationKey: connect-a-linux-server-to-azure-arc
draft: false
---

You have a Linux server outside Azure that needs to appear in the Azure portal. The first step is not running a command, but ensuring the environment meets the baseline requirements for the Azure Connected Machine agent. If the prerequisites are missing, the onboarding process will fail.

The Connected Machine agent is the component that bridges the physical or virtual machine to Azure. It runs as a service and handles communication with the Azure control plane. On Linux, this is typically managed via systemd. The agent supports a wide range of distributions, including Ubuntu 18.04, 20.04, and 22.04 LTS, RHEL 7, 8, and 9, and Debian 11 and 12 [Connected Machine agent prerequisites](https://learn.microsoft.com/en-us/azure/azure-arc/servers/prerequisites). However, support is limited to x86-64 architectures; 32-bit or ARM-based systems are not supported [Connected Machine agent prerequisites](https://learn.microsoft.com/en-us/azure/azure-arc/servers/prerequisites).

[![Azure Arc Linux Onboarding Flow](/images/posts/2025/azc-206-checkpoints.svg)](/images/posts/2025/azc-206-checkpoints.svg)

## Prerequisites and permissions

Before attempting to connect the server, you must verify two distinct areas: the local software environment and the Azure identity permissions.

On the Linux server itself, the agent requires `systemd`, `wget`, `openssl`, and `gnupg` (for Debian-based systems) [Connected Machine agent prerequisites](https://learn.microsoft.com/en-us/azure/azure-arc/servers/prerequisites). You do not need to install the agent manually from a binary; the official onboarding script handles the installation. However, the server must have outbound internet access to the Azure Arc endpoints. If your network uses a proxy, you must configure the agent to use it before or during onboarding.

In Azure, you need specific permissions to create the resource representation. To onboard a machine, you must have the **Azure Connected Machine Onboarding** role or the **Contributor** role on the target resource group [Connected Machine agent prerequisites](https://learn.microsoft.com/en-us/azure/azure-arc/servers/prerequisites). Note that this role allows you to create the Azure Arc-enabled server resource, but it does not grant you permissions to manage the underlying operating system or other resources within that group. If you only need to read or modify the connected machine resource later, you will need the **Azure Connected Machine Resource Administrator** role [Connected Machine agent prerequisites](https://learn.microsoft.com/en-us/azure/azure-arc/servers/prerequisites).

You also need to ensure the relevant Azure resource providers are registered in your subscription. The following providers must be registered for Azure Arc-enabled servers to function correctly:

* `Microsoft.HybridCompute`
* `Microsoft.GuestConfiguration`
* `Microsoft.HybridConnectivity`

You can register these using Azure CLI or PowerShell. For example, using Azure CLI:

```bash
az provider register --namespace 'Microsoft.HybridCompute'
az provider register --namespace 'Microsoft.GuestConfiguration'
az provider register --namespace 'Microsoft.HybridConnectivity'
```

This step is often overlooked. If the providers are not registered, the onboarding command may appear to succeed locally, but the resource will not appear in the portal, or subsequent operations will fail with provider errors.

## Installing the agent

The `azcmagent` command-line interface is used to connect the server, but the agent binary must be present on the system first. Microsoft provides an onboarding script that downloads and installs the agent package for supported Linux distributions [Connected Machine agent prerequisites](https://learn.microsoft.com/en-us/azure/azure-arc/servers/prerequisites).

Run the following command as root or with `sudo` to download and install the agent:

```bash
curl -sL https://aka.ms/InstallAzureArcConnectedMachineAgent | bash
```

This script detects the operating system and installs the appropriate package. Once the installation completes, the agent service is registered with systemd but is not yet connected to Azure. You can verify the installation by checking the service status:

```bash
systemctl status azcmagent
```

The service should be active and running, but it will not have any configuration until you run the connect command.

## Onboarding with azcmagent

The primary tool for connecting a Linux server is the `azcmagent` command-line interface. The `azcmagent connect` command creates the metadata representation of the server in Azure and associates the local agent with it [azcmagent connect CLI reference](https://learn.microsoft.com/en-us/azure/azure-arc/servers/azcmagent-connect). It requires your subscription ID, resource group name, and the Azure region where you want the resource to reside.

### Authentication

Linux servers typically do not have a graphical browser available for interactive login. Therefore, the **device code login** method is the standard approach for interactive onboarding. This generates a code that you enter in a browser on a different device [azcmagent connect CLI reference](https://learn.microsoft.com/en-us/azure/azure-arc/servers/azcmagent-connect).

For automated or scripted deployments, a **service principal** is more appropriate. You can authenticate using a service principal with a secret or a certificate. If using a secret, it is recommended to store it in a configuration file rather than passing it directly in the command line to avoid exposure in shell history or logs [azcmagent connect CLI reference](https://learn.microsoft.com/en-us/azure/azure-arc/servers/azcmagent-connect).

### The connection command

Here is an example of connecting a server using device code login. This is an illustrative example; ensure you replace the placeholders with your actual values.

```bash
azcmagent connect \
  --subscription-id "your-subscription-id" \
  --resource-group "your-resource-group" \
  --location "eastus" \
  --use-device-code
```

If you are using a service principal with a secret, the command would look like this:

```bash
azcmagent connect \
  --subscription-id "your-subscription-id" \
  --resource-group "your-resource-group" \
  --location "eastus" \
  --service-principal-id "your-app-id" \
  --service-principal-secret "your-secret" \
  --tenant-id "your-tenant-id"
```

The command will attempt to connect to Azure. If the network check fails, you can use the `--ignore-network-check` flag, but this should only be done if you are certain the network connectivity is correct and the check is a false positive [azcmagent connect CLI reference](https://learn.microsoft.com/en-us/azure/azure-arc/servers/azcmagent-connect).

## Verification and next steps

Once the command completes, you should verify that the server is visible in the Azure portal. Navigate to the resource group you specified and look for the new Azure Arc-enabled server resource. If it does not appear immediately, wait a few minutes for the agent to establish its heartbeat.

You can also verify the agent status locally by running:

```bash
azcmagent status
```

This will show the connection state and any recent errors. If the agent is not reporting correctly, check the logs located in `/var/log/azure/azure-arc/` for detailed troubleshooting information [Connected Machine agent prerequisites](https://learn.microsoft.com/en-us/azure/azure-arc/servers/prerequisites).

If you plan to use Azure Policy or Guest Configuration to manage the server, ensure that `Microsoft.GuestConfiguration` is registered and that the server has the necessary extensions installed. For SQL Server instances on the Linux server, automatic connection to Azure Arc can be enabled, but you may need to opt out by adding a specific tag if you do not want this behaviour [Connect Windows Server machines to Azure through Azure Arc Setup](https://learn.microsoft.com/en-us/azure/azure-arc/servers/onboard-windows-server).

The connection is now established. The server is managed as an Azure resource, allowing you to apply policies, monitor health, and manage configurations centrally. The next step is to configure the specific management capabilities you need, such as Azure Update Manager or VM Insights, depending on your operational requirements.
