---
title: "Build a repeatable virtual machine with PowerShell"
description: "Build a repeatable Windows Server 2022 VM in Hyper-V using PowerShell, then configure it via PowerShell Direct without network dependencies."
pubDate: 2024-07-27
category: hyper-v
tags: ["hyper-v", "powershell-direct", "windows-server-2022", "virtualization", "automation"]
translationKey: build-a-repeatable-virtual-machine-with-powershell
draft: false
---

You need a Windows Server 2022 virtual machine that you can build consistently, without relying on network connectivity or remote management protocols during the initial setup. The challenge is that standard remote management (WinRM, SSH) requires the VM to be booted, networked, and configured—creating a circular dependency for the first configuration step.

PowerShell Direct resolves this by allowing you to run commands inside a guest VM directly from the Hyper-V host, bypassing the network stack entirely. This approach ensures that your baseline configuration is repeatable and deterministic, regardless of the host's network state.

[![PowerShell Direct VM Configuration Flow](/images/posts/2024/azc-075-checkpoints.svg)](/images/posts/2024/azc-075-checkpoints.svg)

## Prerequisites and constraints

Before writing any code, you must confirm the environment supports PowerShell Direct. According to Microsoft documentation, PowerShell Direct requires the host to run Windows 10 or Windows Server 2016 or later, and the virtual machine must also run Windows 10 or Windows Server 2016 or later [Manage Windows virtual machines with PowerShell Direct](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-windows-virtual-machines-with-powershell-direct). Since we are targeting Windows Server 2022, this requirement is satisfied.

You must also have administrative privileges on the Hyper-V host. Specifically, you need to be logged in as a member of the Hyper-V Administrators group [Manage Windows virtual machines with PowerShell Direct](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-windows-virtual-machines-with-powershell-direct). This is distinct from local Administrator rights on the guest; it is a host-level permission required to initiate the virtual hardware session.

Finally, you need a virtual switch. If your VM requires network access after creation, you must have an existing virtual switch (External, Internal, or Private) available. You can list available switches using:

```powershell
Get-VMSwitch * | Format-Table Name
```

## Step 1: Create the virtual machine

We will create a Generation 2 virtual machine with a new virtual hard disk. Generation 2 is the recommended configuration for Windows Server 2022 because it supports UEFI-based boot and VHDX disks, which are standard for modern Windows Server versions [Create a virtual machine in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/create-a-virtual-machine-in-hyper-v).

Assume the following variables for repeatability:
- `VMName`: "BaseServer2022"
- `Memory`: 4GB
- `DiskSize`: 60GB
- `VHDXPath`: "C:\\HyperV\\VHDs\\BaseServer2022.vhdx"
- `VMPath`: "C:\\HyperV\\VMs"
- `SwitchName`: "ExternalSwitch" (adjust to your environment)

The command to create the VM with a new disk is:

```powershell
New-VM -Name "BaseServer2022" `
       -MemoryStartupBytes 4GB `
       -BootDevice VHD `
       -NewVHDPath "C:\HyperV\VHDs\BaseServer2022.vhdx" `
       -NewVHDSizeBytes 60GB `
       -Path "C:\HyperV\VMs" `
       -Generation 2 `
       -Switch "ExternalSwitch"
```

This command creates the VM configuration and the virtual hard disk. It does not start the VM, nor does it install an operating system. You must attach a Windows Server 2022 ISO to the DVD drive and boot the VM manually or via script before PowerShell Direct can function, as PowerShell Direct requires the VM to be "running locally on the host and booted" [Manage Windows virtual machines with PowerShell Direct](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-windows-virtual-machines-with-powershell-direct).

## Step 2: Boot and prepare the guest

Start the VM:

```powershell
Start-VM -Name "BaseServer2022"
```

At this stage, you must complete the Windows Server Out-of-Box Experience (OOBE) or use an unattend.xml file to automate the initial setup. PowerShell Direct cannot interact with the VM until the operating system is loaded and the guest services are active. If you are automating this fully, ensure your ISO or deployment script handles the initial user creation and network configuration.

## Step 3: Configure the VM using PowerShell Direct

Once the VM is booted and the guest OS is running, you can connect to it without configuring WinRM or enabling remote PowerShell on the network. You need valid credentials for the guest OS. For example, if you created a local admin account named `AdminUser` with password `P@ssw0rd!` during OOBE, you can proceed.

### Option A: Interactive Session

For ad-hoc configuration, use `Enter-PSSession`:

```powershell
$cred = Get-Credential -UserName "AdminUser" -Message "Enter guest credentials"
Enter-PSSession -VMName "BaseServer2022" -Credential $cred
```

You are now inside the VM. Any command you run, such as `Get-Service` or `Install-WindowsFeature`, executes on the guest. Exit with `Exit-PSSession`.

### Option B: Scripted Configuration (Recommended for Repeatability)

For a repeatable baseline, use `Invoke-Command` with a script block. This allows you to define the entire configuration state in a single command.

```powershell
$scriptBlock = {
    # Example: Install Hyper-V role and restart
    Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart
}

Invoke-Command -VMName "BaseServer2022" -ScriptBlock $scriptBlock -Credential $cred
```

This method is superior for repeatability because the script block can be stored in a file and version-controlled. You can run the same script against multiple VMs with different names, ensuring identical configuration.

## Verification

To verify the configuration, run a query that confirms the state change:

```powershell
Invoke-Command -VMName "BaseServer2022" -ScriptBlock { Get-WindowsFeature -Name Hyper-V } -Credential $cred
```

If the `InstallState` is `Installed`, the baseline configuration is successful. You can now clone this VM or use it as a template for further automation.

## Cleanup

When you are done, shut down the VM:

```powershell
Stop-VM -Name "BaseServer2022" -TurnOff
```

If you no longer need the VM, remove it entirely:

```powershell
Remove-VM -Name "BaseServer2022" -Force
```

This approach gives you a deterministic, network-independent method to build and configure Windows Server 2022 VMs. By leveraging PowerShell Direct, you eliminate the variability introduced by network configuration delays or WinRM setup failures, ensuring that your baseline is always consistent.
