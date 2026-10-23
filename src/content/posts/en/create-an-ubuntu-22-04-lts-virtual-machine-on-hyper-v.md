---
title: "Create an Ubuntu 22.04 LTS virtual machine on Hyper-V"
description: "Create an Ubuntu 22.04 LTS guest on Hyper-V, select the Linux Secure Boot template, attach installation media and check the installed guest."
pubDate: 2024-02-19
category: hyper-v
tags: [hyper-v, ubuntu, linux, windows-server-2022, virtual-machines]
translationKey: create-an-ubuntu-22-04-lts-virtual-machine-on-hyper-v
draft: true
---

An Ubuntu VM needs more than a name and a virtual disk. Its generation, firmware, installation media and network connection need to agree before the installer can start. Choosing them explicitly also gives us a clearer place to investigate a failed first boot.

This example uses Ubuntu 22.04 LTS on a Windows Server 2022 Hyper-V host. Microsoft's [Ubuntu support table](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/supported-ubuntu-virtual-machines-on-hyper-v) lists Generation 2, Secure Boot and built-in Linux Integration Services for this combination. These are illustrative settings and commands; a guest has not been deployed for this article.

[![Ubuntu guest creation checkpoints](/images/posts/2024/azc-018-checkpoints.svg)](/images/posts/2024/azc-018-checkpoints.svg)

## Prepare the host and media

Use a host with Hyper-V installed and working. Open Windows PowerShell as an administrator for this walkthrough and identify the existing switch intended for the guest:

```powershell
Get-VMSwitch | Select-Object Name, SwitchType
```

Confirm its actual connectivity, including VLAN requirements, DHCP, DNS and the intended route. Selecting an external switch does not guarantee Internet access.

Obtain the Ubuntu 22.04 LTS server installation image from Ubuntu's official distribution service and verify it using the publisher's instructions. Place it on storage the host can access. The example uses `C:\ISOs\ubuntu-22.04-server-amd64.iso` as a local filename; change the variable to match the verified download.

## Create a Generation 2 VM

The following lab configuration uses 4 GB of startup memory and a 40 GB virtual disk. These are example values, not workload sizing advice. Check the distribution and application requirements and the host's available capacity.

```powershell
$vmName = 'Ubuntu2204-Lab'
$vmRoot = 'C:\VMData\Ubuntu2204-Lab'
$switchName = 'LabExternal'
$isoPath = 'C:\ISOs\ubuntu-22.04-server-amd64.iso'

if (-not (Test-Path -LiteralPath $isoPath -PathType Leaf)) {
    throw 'Set isoPath to the verified Ubuntu installation image.'
}
Get-VMSwitch -Name $switchName -ErrorAction Stop | Out-Null
if (Get-VM -Name $vmName -ErrorAction SilentlyContinue) {
    throw 'A VM with this name already exists.'
}
New-Item -ItemType Directory -Path $vmRoot -ErrorAction Stop | Out-Null

$vmParameters = @{
    Name = $vmName
    Generation = 2
    MemoryStartupBytes = 4GB
    NewVHDPath = Join-Path $vmRoot 'Ubuntu2204-Lab.vhdx'
    NewVHDSizeBytes = 40GB
    Path = $vmRoot
    SwitchName = $switchName
}
New-VM @vmParameters
```

Replace `LabExternal` with the verified switch name and use an unused directory. Check existing files before rerunning a partially completed example. Microsoft's [VM creation guidance](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/create-a-virtual-machine-in-hyper-v) explains the generation, storage and network choices.

The hashtable passes named parameters without shell-specific continuation characters. This initial configuration uses fixed assigned memory. Dynamic Memory is supported for this guest, but enabling it is a separate sizing decision. Assess startup, minimum and maximum values against the guest's requirements rather than choosing a very low minimum simply to fit more VMs on the host.

## Select the Linux Secure Boot template

Keep the VM powered off and open its settings in Hyper-V Manager. Under **Security**, leave **Enable Secure Boot** selected and choose **Microsoft UEFI Certificate Authority**.

The template matters: Linux support for Secure Boot does not mean that the Windows template will trust its bootloader. Microsoft's [Generation 2 security guidance](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v) identifies the Windows and Linux templates.

If boot fails, check the selected template, installation image and boot order before changing security settings. Disabling Secure Boot should not be the first response to a template mismatch.

## Attach the ISO and install Ubuntu

A newly created Generation 2 VM may not have a DVD drive. In its settings, select **SCSI Controller**, add a **DVD Drive**, select the verified ISO and save the configuration.

Under **Firmware**, move the DVD drive ahead of the virtual disk for installation. Connect to the VM in Hyper-V Manager, start it and follow the Ubuntu installer.

Choose the intended target disk and network configuration. Record the hostname, administrator access method and any enabled remote service. A completed installer does not establish the environment's patching, backup or access policies.

After installation, detach the ISO through the DVD drive's media settings and confirm that the guest starts from its installed virtual disk.

## Check the guest and its dependencies

Inside Ubuntu, these read-only commands help inspect the kernel and networking:

```bash
uname -r
ip address
ip route
```

Verify the expected address and route, then check the DNS and service connectivity the workload needs. No terminal output is invented here.

Ubuntu includes the Hyper-V integration components in the distribution. Do not install Microsoft's separate downloadable Linux Integration Services package for this guest. Follow supported Ubuntu kernel and update guidance; comparing an included module's version with that separate package is not a reliable freshness check.

Keep the VM configuration and installation choices with its handover notes. Before introducing an infrastructure workload, establish its update process, backup coverage and recovery checks. The useful result is a guest whose configuration and dependencies are understood, rather than a VM that happened to boot once.

