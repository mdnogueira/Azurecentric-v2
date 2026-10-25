---
title: "Configure a Windows Server 2022 host using PowerShell"
description: "Configure Windows Server 2022 using PowerShell: install roles, manage features, and remove payload files."
pubDate: 2024-04-06
category: windows-server
tags: ["windows-server-2022", "powershell", "server-configuration", "roles-and-features", "features-on-demand"]
translationKey: configure-a-windows-server-2022-host-using-powershell
draft: false
---

You have a Windows Server 2022 host that needs to be configured. PowerShell allows you to automate role installation, manage features, and optimise disk space by removing unnecessary files. This guide walks you through the essential steps to get your server ready for its intended workload.

## Prerequisites and Permissions

[![Windows Server 2022 Configuration Flow](/images/posts/2024/azc-035-checkpoints.svg)](/images/posts/2024/azc-035-checkpoints.svg)

Before you begin, ensure you have administrator rights on the local server or the target remote server. If you are logged on with an account that does not have administrator rights on the target server, you will need to provide an account that does. For local installations, run Windows PowerShell as Administrator.

Windows PowerShell is a task-based command-line shell and scripting language designed especially for system administration. It is built on the .NET Framework and helps IT professionals control and automate the administration of the Windows operating system and applications that run on Windows [1].

## Installing Roles and Features

To install roles and features, use the `Install-WindowsFeature` cmdlet. This cmdlet functions similarly to the GUI-based Add Roles and Features Wizard, but with a key difference: management tools and snap-ins for a role are not included by default in PowerShell. To include them, you must add the `IncludeManagementTools` parameter [2].

First, open a Windows PowerShell session with elevated user rights. You can do this by right-clicking **Windows PowerShell** on the taskbar and selecting **Run as Administrator** [2].

Next, view a list of available and installed roles and features on the local server by typing `Get-WindowsFeature` and pressing Enter. If you want information about a remote server, run `Get-WindowsFeature -computerName <computer_name>` [2].

To install a role, such as the Active Directory Domain Services role and the Group Policy Management feature on a remote server named `ContosoDC1`, use the following command:

```powershell
Install-WindowsFeature -Name AD-Domain-Services,GPMC -computerName ContosoDC1 -IncludeManagementTools -Restart
```

This command installs the specified roles and features, includes management tools, and automatically restarts the destination server if required by the installation [2].

## Removing Feature Files to Optimise Disk Space

Windows Server 2022 supports Features on Demand, which allows you to remove role and feature files (payload) from the operating system to conserve disk space. These files can be installed from remote locations or installation media instead of from the local computer [3].

To remove feature files, use the `Uninstall-WindowsFeature` cmdlet with the `-remove` parameter. This cmdlet can both uninstall roles and delete their feature files [3].

For example, to uninstall the Remote Desktop Licensing role service and delete its feature files from a server named `contoso_1`, use:

```powershell
Uninstall-WindowsFeature -Name rdS-Licensing -computerName contoso_1 -remove
```

Be cautious when removing feature files. If you delete feature files for a role service or subfeature, and no other role services or subfeatures for the parent role or feature remain installed, then files for the entire parent role or feature are deleted [3]. To view all feature files that would be deleted without actually deleting them, add the `whatif` parameter to the command [3].

## Verifying Installation and Cleanup

After installation, verify the installed roles and features by running `Get-WindowsFeature` again. You can also check the **Roles and Features** tile in Server Manager if you are using the GUI [2].

If you have removed feature files, you can install roles and features on the server in the future by specifying an alternate source path, or a share on which required role and feature files are stored. The source path or file share must grant **Read** permissions to the computer account of the destination server [2].

To end a Windows PowerShell session, type `exit` [1].

References for Configure a Windows Server 2022 host using PowerShell: [PowerShell](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/powershell), [Install or Uninstall Roles, Role Services, or Features](https://learn.microsoft.com/en-us/windows-server/administration/server-manager/install-or-uninstall-roles-role-services-or-features), [Configure Features on Demand in Windows Server](https://learn.microsoft.com/en-us/windows-server/administration/server-manager/configure-features-on-demand-in-windows-server).
