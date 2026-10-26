---
title: "Choose generation 1 or generation 2 for a Hyper-V VM"
description: "Decide between Hyper-V generation 1 and 2 VMs by checking guest OS support, boot requirements, and feature needs."
pubDate: 2024-04-13
category: hyper-v
tags: ["hyper-v", "linux", "secure-boot"]
translationKey: choose-generation-1-or-generation-2-for-a-hyper-v-vm
draft: false
---

You are about to create a new virtual machine on a Windows Server 2022 host. The first configuration choice you make is whether to create a generation 1 or generation 2 virtual machine. This decision is not reversible once the VM is created, so it requires checking your guest operating system, boot method, and feature requirements before you proceed.

The short answer is: choose generation 2 unless you are constrained by an older operating system, a specific legacy boot requirement, or an existing pre-built virtual disk that is incompatible with UEFI.

Generation 2 virtual machines are the modern default. They use UEFI firmware, support Secure Boot by default, allow booting from virtual SCSI disks (which supports larger volumes and online resizing), and enable features like hot-add of network adapters. Generation 1 virtual machines use legacy BIOS, support booting from IDE controllers and physical CD/DVD drives, and are required only for specific older operating systems or boot scenarios.

## Check the guest operating system

The first constraint is whether your chosen guest operating system is supported on generation 2. Microsoft provides detailed compatibility tables, but the general rule is that generation 2 supports most 64-bit versions of Windows and more current versions of Linux and FreeBSD.

For Windows guests, generation 2 supports:
* Windows Server 2022, 2019, 2016, 2012 R2, 2012
* Windows 11, 10, 8.1, 8

Generation 2 does **not** support:
* Windows Server 2008 R2, 2008
* Windows 7
* Any 32-bit version of Windows (including Windows 10 32-bit)

If you need to run a 32-bit Windows guest, or Windows 7/Server 2008 R2, you must use generation 1.

For Linux guests, generation 2 supports:
* Ubuntu 14.04 and later
* Red Hat Enterprise Linux and CentOS 7.x and 8.x series (6.x series supported on Windows Server 2016 and above)
* Debian 8.x and later
* Oracle Linux 7.x and 8.x series (UEK R3 not supported)
* SUSE Linux Enterprise Server 12 and 15 series
* FreeBSD 11.1 and later

If your Linux distribution is older than the versions listed above, you will need generation 1.

## Check the boot method

The second constraint is how you intend to boot the virtual machine. Generation 1 and generation 2 support different boot methods.

Generation 1 supports:
* Boot from IDE controller virtual hard disk (.VHD or .VHDX)
* Boot from IDE virtual DVD (.ISO)
* Boot from physical CD/DVD drive
* Boot from virtual floppy (.VFD)
* PXE boot using a legacy network adapter

Generation 2 supports:
* Boot from virtual SCSI disk (.VHDX)
* Boot from virtual SCSI DVD (.ISO)
* PXE boot using a synthetic network adapter (IPv4 and IPv6)

Generation 2 does **not** support:
* Boot from IDE controllers
* Boot from physical CD/DVD drives
* Boot from virtual floppy disks
* PXE boot using a legacy network adapter

If you need to boot from a physical CD/DVD drive, or use a legacy network adapter for PXE, you must use generation 1. If you are using a pre-built virtual disk (VHD or VHDX) that was created for generation 1 and is not compatible with UEFI, you must use generation 1.

## Consider feature requirements

If your guest OS and boot method are compatible with generation 2, you should evaluate whether you need any features that are only available on generation 1. In most cases, generation 2 offers more features, but there are a few exceptions.

Features available on generation 1 but not generation 2:
* Physical CD/DVD drive attachment
* Virtual floppy disk support
* Legacy network adapter (for PXE boot)

Features available on generation 2 but not generation 1:
* Secure Boot (enabled by default)
* Boot from virtual SCSI disk (supports up to 64 TB, online resize)
* Hot-add/removal of virtual network adapter
* IPv6 PXE boot
* Shielded virtual machines (Windows guests only)

If you need Secure Boot, hot-add of network adapters, or large boot volumes, generation 2 is the clear choice. If you need physical CD/DVD attachment or virtual floppy support, you must use generation 1.

## Create the virtual machine

Once you have determined the appropriate generation, you can create the virtual machine. You can use Hyper-V Manager or Windows PowerShell.

Using PowerShell, the `New-VM` cmdlet allows you to specify the generation. For example, to create a generation 2 virtual machine named `TestVM`:

```powershell
# Illustrative example: unrun code
New-VM -Name 'TestVM' -Generation 2 -MemoryStartupBytes 4GB -SwitchName 'DefaultSwitch'
```

If you are creating a generation 2 virtual machine, note that it does not have a DVD drive by default. You can add one while the VM is running if needed. Also, if you need to add a COM port for kernel debugging, you must disable Secure Boot first, as kernel debugging is not compatible with Secure Boot.

To disable Secure Boot and add a COM port:

```powershell
# Illustrative example: unrun code
Set-VMFirmware -VMName 'TestVM' -EnableSecureBoot Off
Set-VMComPort -VMName 'TestVM' -Number 1 -Path '\\.\pipe\TestPipe'
```

## Verify the configuration

After creating the virtual machine, verify that the generation is correct. In Hyper-V Manager, you can check the VM settings to confirm the firmware type (UEFI for generation 2, BIOS for generation 1) and the available boot options.

If you are using PowerShell, you can check the generation with:

```powershell
# Illustrative example: unrun code
Get-VM -Name 'TestVM' | Select-Object Name, Generation
```

This will return the generation number (1 or 2) for the virtual machine. Ensure it matches your intended configuration.

## Decision summary

Use this checklist to make your final decision:

1. **Is the guest OS supported on generation 2?**
   * If no (e.g., 32-bit Windows, Windows 7, Server 2008 R2, older Linux), use generation 1.
   * If yes, proceed to step 2.

2. **Do you need a boot method only supported by generation 1?**
   * If yes (e.g., physical CD/DVD, legacy PXE, virtual floppy), use generation 1.
   * If no, proceed to step 3.

3. **Do you need any features only available on generation 2?**
   * If yes (e.g., Secure Boot, hot-add network adapter, large boot volumes), use generation 2.
   * If no, generation 2 is still recommended as the modern default.

In most cases, the answer will be generation 2. Only if you are constrained by an older operating system or a specific legacy boot requirement should you choose generation 1.

If you are uploading VMs to Azure, note that both generation 1 and generation 2 VMs are supported as long as they use the VHD file format and have a fixed-sized disk. See [Generation 2 VMs on Azure](/azure/virtual-machines/windows/generation-2) to learn more about generation 2 capabilities supported on Azure.

Once you have created the VM, remember that you cannot change its generation. If you need to migrate a generation 1 VM to generation 2, you must create a new generation 2 VM and migrate the workload. This is not a simple conversion process.

For more details on feature compatibility, refer to the [Hyper-V feature compatibility by generation and guest](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Hyper-V-feature-compatibility-by-generation-and-guest) documentation.

tags: [hyper-v, virtual-machines, generation-1, generation-2, windows-server-2022]
diagram:
  title: Hyper-V VM Generation Decision Flow
  nodes:
    - Guest OS supported on Gen2?
    - Boot method required?
    - Feature requirements?
    - Create Gen2 VM
    - Create Gen1 VM
    - Constraint: Legacy OS/Boot
    - Constraint: No Gen2 Support
claims:
  - claim: Generation 2 virtual machines use UEFI firmware and support Secure Boot by default.
    source_id: S1
    evidence_span: "Legacy BIOS | UEFI firmware | Secure Boot"
  - claim: Generation 1 virtual machines support booting from IDE controllers and physical CD/DVD drives.
    source_id: S1
    evidence_span: "Boot from IDE Controller virtual hard disk (.VHD), virtual DVD (.ISO) or a physical CD/DVD drive"
  - claim: Generation 2 virtual machines support hot-add/removal of virtual network adapters.
    source_id: S2
    evidence_span: "Hot add/removal of virtual network adapter | 2 | Any supported guest"
  - claim: Generation 2 virtual machines do not support 32-bit Windows guests.
    source_id: S1
    evidence_span: "32-bit versions of Windows | Generation 2 | X"
  - claim: You cannot change a virtual machine's generation after it has been created.
    source_id: S1
    evidence_span: "You can't change a virtual machine's generation after you've created it."
review_questions:
  - "What is the exact process for migrating a generation 1 VM to generation 2, and are there any data loss risks?"
  - "Are there any performance benchmarks comparing generation 1 and generation 2 VMs for specific workloads?"
  - "How does Secure Boot impact the boot process for non-Windows guests, and are there known compatibility issues with specific Linux distributions?"

References for Choose generation 1 or generation 2 for a Hyper-V VM: [Should I create a generation 1 or 2 virtual machine in Hyper-V?](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/should-i-create-a-generation-1-or-2-virtual-machine-in-hyper-v), [Hyper-V feature compatibility by generation and guest](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-feature-compatibility-by-generation-and-guest).
