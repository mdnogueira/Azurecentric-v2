---
title: "Install Hyper-V on a Windows Server 2022 host"
description: "Install the Hyper-V role on Windows Server 2022, plan the required restart, and verify the host before configuring networking, storage and virtual machines."
pubDate: 2024-02-17
category: hyper-v
tags: [hyper-v, windows-server-2022, powershell, virtualisation]
translationKey: install-hyper-v-on-a-windows-server-2022-host
draft: false
---

Installing Hyper-V enables the host to run virtual machines. It does not finish the virtualisation design. Before adding the role, decide how the server will be managed, where VM files will live and which network connections guests should use.

This walkthrough covers a Windows Server 2022 host and the Hyper-V role. It is separate from enabling Hyper-V on a Windows client. The commands are illustrative and have not been used to install a host for this article.

[![Hyper-V host preparation and installation checkpoints](/images/posts/2024/azc-017-checkpoints.svg)](/images/posts/2024/azc-017-checkpoints.svg)

## Prepare the destination server

Use Microsoft's [Hyper-V installation guidance](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/install-the-hyper-v-role-on-windows-server) as the starting point. Confirm hardware compatibility against the linked Windows Server and Hyper-V requirements before scheduling installation.

Check that the required processor virtualisation capabilities are available and enabled through the hardware's supported firmware configuration. A server running Windows Server does not, by itself, establish that its configuration is suitable for Hyper-V.

Also review software already using the machine's virtualisation features. Treat a server intended to host infrastructure VMs as a planned platform, rather than adding the role to an unrelated machine and discovering conflicts afterwards.

Record the intended hostname, management address, administrative access method and recovery route. The role installation may require a restart, so confirm the maintenance window and retain a way to reach the server if ordinary remote management is unavailable.

## Install with Windows PowerShell

Sign in to the intended host and open Windows PowerShell as an administrator. Check the role's current state first:

```powershell
Get-WindowsFeature -Name Hyper-V
```

Confirm that the console belongs to the server you intend to change. The following command installs the role and its applicable management tools:

```powershell
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools
```

Inspect the installation result, including success and restart requirements. This example leaves the restart as an explicit maintenance action. Once the server is ready for that restart, the illustrative command is:

```powershell
Restart-Computer
```

Do not treat a lost remote session during restart as an installation result. Wait for the server to return and verify the installed state from a new session.

Microsoft also documents installation with an explicit remote computer name. For a first host, keeping the example local makes the destination easier to verify and avoids mixing role installation with the separate task of preparing remote management.

## Use Server Manager when a guided installation helps

On a server with the graphical interface, open **Server Manager**, choose **Manage**, then **Add Roles and Features**. Select a role-based installation and verify the destination server before selecting **Hyper-V**.

Review the additional features offered by the wizard. It also provides pages for virtual switches, migration and default stores. Choose settings against the host design; accepting a default is not evidence that it fits the environment.

For example, identify the adapter carrying the management connection before making virtual-switch changes. Keep a separate recovery route available when changing host networking. This article does not create a switch because its adapter and connectivity choices depend on the server's network design.

Review the summary and restart options before starting installation. Record any deferred networking or storage configuration so it is not mistaken for completed work.

## Verify the host after restart

From an elevated Windows PowerShell session, check the role again:

```powershell
Get-WindowsFeature -Name Hyper-V
Get-VMHost
```

The first check confirms the installed feature state. The second queries the host through the Hyper-V management module. Investigate errors rather than treating an installed checkbox as proof that the platform is ready for workloads.

On Server Core, use PowerShell and an appropriately configured remote management station. Do not expect a local Hyper-V Manager window on a server without the graphical interface. Microsoft's installation documentation explains the distinction between the role and its management tools.

## Finish the host configuration before adding workloads

Verify VM storage locations, free capacity and the intended access permissions. Review the virtual switches and network paths, then check that the administrative tools can manage the host using the approved identities.

Keep migration, backup and recovery requirements visible if they are part of the design. Adding Hyper-V does not create a failover cluster or establish protection for the guests.

The [Hyper-V deployment guidance](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/deploy-hyper-v-on-windows-server) provides the next configuration areas. Work through the ones the host needs, then use a disposable VM to assess the intended storage and network path before introducing an infrastructure service.

A useful handover includes the host configuration, the verification results and the remaining tasks. That is what turns a role installation into a platform the operations team can support.
