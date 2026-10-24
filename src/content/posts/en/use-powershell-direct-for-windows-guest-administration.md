---
title: "Use PowerShell Direct for Windows guest administration"
description: "Use PowerShell Direct to manage Windows VMs on a Hyper-V host without network or remote management configuration."
pubDate: 2026-03-30
category: hyper-v
tags: ["hyper-v", "powershell-direct", "windows-server", "virtualization", "automation"]
translationKey: use-powershell-direct-for-windows-guest-administration
draft: true
---

You have a Windows virtual machine on a Hyper-V host, but the network is down, the guest OS hasn't finished booting, or you simply don't want to configure WinRM or remote management endpoints. PowerShell Direct lets you run commands inside that virtual machine directly from the host, bypassing the network stack entirely.

This capability is particularly useful for initial guest configuration, troubleshooting boot issues, or automating setup in isolated environments. It works regardless of the network configuration or remote management settings on either the Hyper-V host or the virtual machine.

[![PowerShell Direct Connection Flow](/images/posts/2026/azc-293-checkpoints.svg)](/images/posts/2026/azc-293-checkpoints.svg)

## Prerequisites and scope

PowerShell Direct is not available for every virtual machine configuration. Before attempting to connect, verify that the environment meets the following requirements:

*   **Host operating system:** Windows 10, Windows Server 2016, or later running Hyper-V.
*   **Guest operating system:** Windows 10, Windows Server 2016, or later. Older guests (e.g., Windows Server 2012 R2) are not supported by PowerShell Direct and require Virtual Machine Connection (VMConnect) or a network connection.
*   **VM State:** The virtual machine must be running locally on the host and must be booted. It must have at least one configured user profile.
*   **Host Permissions:** You must be logged into the host computer as a Hyper-V administrator.
*   **Guest Credentials:** You must supply valid user credentials for the virtual machine. The host does not have implied administrator access to the guest; you cannot use the `-RunAsAdministrator` flag when connecting to virtual machines.

You can use the `Get-VM` cmdlet to check which virtual machines are running on the host and to verify that your current credentials have the Hyper-V administrator role.

## Interactive sessions with Enter-PSSession

The most straightforward way to use PowerShell Direct is to start an interactive session. This behaves like a standard PowerShell session, but the commands you type execute on the virtual machine.

Open Windows PowerShell as Administrator on the Hyper-V host. You can create a session using either the virtual machine name or its GUID:

```powershell
Enter-PSSession -VMName ExampleVMName
```

or

```powershell
Enter-PSSession -VMId ExampleVMId
```

When prompted, enter the credentials for a user account on the virtual machine. Once connected, your PowerShell prompt will change to include the virtual machine name as a prefix, for example:

```output
[VMName]: PS C:\>
```

Any command you run from this prompt executes on the virtual machine. You can test the connection by running `ipconfig` or `hostname`. When you are finished, close the session using:

```powershell
Exit-PSSession
```

## One-off commands with Invoke-Command

If you need to run a single command or a script without maintaining an interactive session, use the `Invoke-Command` cmdlet. This is ideal for automation scripts where you want to execute a task and then disconnect.

To run a single command:

```powershell
Invoke-Command -VMName ExampleVMName -ScriptBlock { command }
```

To run a script file located on the host machine:

```powershell
Invoke-Command -VMName ExampleVMName -FilePath C:\host\script_path\script.ps1
```

In both cases, you will be prompted for the virtual machine's credentials. The command runs on the virtual machine, and the connection closes automatically once the command completes. If the command produces output, you will see it in your host console.

## Persistent sessions and file transfer

For more complex workflows, you can create a persistent session using `New-PSSession`. This allows you to reference the same session multiple times without passing credentials repeatedly and preserves variables across calls. Persistent sessions are supported in Windows builds 14280 and later.

```powershell
$s = New-PSSession -VMName ExampleVMName -Credential (Get-Credential)
```

Note that you must explicitly specify credentials with the `-Credential` flag. There is a known issue in earlier builds where omitting this flag can cause the guest service to hang, requiring a restart of the `vmicvmsession` service.

Once the session is established, you can copy files between the host and the guest:

```powershell
# Copy from host to guest
Copy-Item -ToSession $s -Path C:\host_path\data.txt -Destination C:\guest_path`

# Copy from guest to host
Copy-Item -FromSession $s -Path C:\guest_path\data.txt -Destination C:\host_path`
```

When you are done, remove the session to free resources:

```powershell
Remove-PSSession $s
```

## Troubleshooting common errors

PowerShell Direct surfaces a limited set of error messages. If a connection fails, check the following:

*   **"A remote session might have ended":** This usually means the virtual machine is not running, the guest OS does not support PowerShell Direct, or the OS is still booting/waiting for user input. Use `Get-VM` to verify the VM state.
*   **"Parameter set can't be resolved":** You cannot use the `-RunAsAdministrator` flag with virtual machines. You must provide explicit credentials.
*   **"The credential is invalid":** The supplied credentials were incorrect, or the Administrator account is not set as an active user. Ensure the guest has at least one configured user profile.
*   **"The input VMName parameter doesn't resolve to any virtual machine":** You may not be a Hyper-V Administrator, or the virtual machine does not exist. Verify your host permissions and the VM name.

If you encounter the "remote session might have ended" error on a persistent session, sign in to the virtual machine using VMConnect and restart the service:

```powershell
Restart-Service -Name vmicvmsession
```

## Verification

To confirm PowerShell Direct is working, run a simple command like `hostname` or `whoami` inside the session. The output should reflect the virtual machine's identity, not the host's. If the command executes successfully, you have established a valid PowerShell Direct session.

For further details, refer to the [Manage Windows virtual machines with PowerShell Direct](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-windows-virtual-machines-with-powershell-direct) documentation.
