---
title: "Investigate a VM that cannot boot from installation media"
description: "Troubleshoot a Hyper-V VM failing to boot from installation media by verifying generation, boot order, and ISO attachment."
pubDate: 2025-01-15
category: hyper-v
tags: []
translationKey: investigate-a-vm-that-cannot-boot-from-installation-media
draft: false
---

You have created a virtual machine in Hyper-V, attached an installation ISO, and started the machine, but it does not boot from the media. The screen is black, or it falls through to a "No bootable device" message. This is usually a configuration issue rather than a failure of the installation media itself.

The first thing to check is the virtual machine generation. Generation 1 and Generation 2 virtual machines use different firmware interfaces and boot sequences. If you are trying to boot from a standard ISO file, the generation determines whether the virtual machine can access that media as a bootable device.

## Check the virtual machine generation

Hyper-V distinguishes between Generation 1 and Generation 2 virtual machines at creation time. You cannot change the generation after the virtual machine is created.

*   **Generation 1** virtual machines use the legacy BIOS firmware interface. They boot from IDE controllers. In the Hyper-V Manager wizard, the **Installation Options** page allows you to specify that the virtual machine should boot from a network adapter, a floppy disk, or a CD/DVD drive. If you selected "Install an operating system later" or explicitly chose to boot from a CD/DVD drive, the virtual machine will attempt to boot from the first available IDE CD/DVD drive.
*   **Generation 2** virtual machines use UEFI firmware. They boot from a SCSI controller and require the installation media to be UEFI-bootable. The boot order is managed differently, and the virtual machine will look for a UEFI-compatible boot sector on the attached media.

If you created the virtual machine using PowerShell, the `-Generation` parameter determines this. For example:

```powershell
New-VM -Name TestVM -MemoryStartupBytes 4GB -BootDevice VHD -VHDPath .\VMs\Test.vhdx -Path .\VMData -Generation 2 -Switch ExternalSwitch
```

In this case, the virtual machine is Generation 2. If you attach a standard ISO to a Generation 1 virtual machine but the boot order is set to boot from the hard disk first, it will skip the ISO. Conversely, if you attach a non-UEFI ISO to a Generation 2 virtual machine, it will not boot.

## Verify the boot order and IDE/SCSI configuration

The most common reason for a VM not booting from installation media is that the boot order does not prioritise the optical drive, or the drive is not connected to the correct controller type for the generation.

1.  Open **Hyper-V Manager** and select the virtual machine.
2.  Right-click the virtual machine and select **Settings**.
3.  Check the **Firmware** section (for Generation 2) or the **BIOS** section (for Generation 1).
    *   For **Generation 1**, ensure the CD/DVD Drive is connected to an IDE controller and that the ISO is attached to that drive. The boot order in the BIOS setup (accessed by pressing a key during startup, often F2 or Del) must list the CD/DVD drive before the hard disk. Hyper-V Manager provides a **BIOS** settings page where you can manually reorder boot devices. If the hard disk is listed first, the VM will attempt to boot from it even if an ISO is attached.
    *   For **Generation 2**, check the **Firmware** settings. The boot order list should include the CD/DVD Drive. Generation 2 virtual machines use SCSI controllers for both hard disks and DVD drives. UEFI boot requires the ISO to be attached to the SCSI DVD drive. If the ISO is attached to an IDE controller, Generation 2 virtual machines will not recognise it as a bootable device.

If you created the virtual machine using the wizard, the **Installation Options** page sets the default boot behaviour. If you selected "Install an operating system later," the virtual machine will boot from the hard disk by default. You must manually change the boot order in the **BIOS** or **Firmware** settings to prioritise the optical drive.

## Confirm the ISO is attached and valid

Even with the correct generation and boot order, the virtual machine will not boot if the ISO is not attached or is corrupted.

1.  In the virtual machine **Settings**, navigate to the **SCSI Controller** or **IDE Controller** where the CD/DVD Drive is located.
2.  Ensure the **Connection** is set to **Image file** and that the path to the ISO is correct.
3.  Verify the ISO file is not corrupted. A common mistake is attaching an ISO that does not contain a bootable sector for the target architecture (e.g., attaching a 32-bit ISO to a 64-bit-only UEFI environment, though most modern installation media are hybrid).

If you are using PowerShell, you can attach the ISO using the `Set-VMDvdDrive` cmdlet:

```powershell
Set-VMDvdDrive -VMName TestVM -ControllerNumber 0 -ControllerLocation 1 -Path "C:\ISOs\WindowsServer2025.iso"
```

This command attaches the ISO to the virtual DVD drive. Note that the controller number and location must match the virtual machine's configuration. You can verify the current configuration using `Get-VMDvdDrive -VMName TestVM`.

## Test the boot

After verifying the generation, boot order, and ISO attachment, start the virtual machine.

```powershell
Start-VM -Name TestVM
```

Connect to the virtual machine using Hyper-V Manager. Right-click the virtual machine and select **Connect**. Watch the screen during the initial boot process. If the virtual machine is configured correctly, you should see the boot menu from the installation media. If the screen remains black or displays a "No bootable device" message, re-check the generation and boot order. For Generation 2 virtual machines, ensure the ISO is UEFI-bootable. For Generation 1, ensure the ISO is BIOS-bootable and that the IDE controller is correctly configured.

If the issue persists, consider creating a new virtual machine with the correct generation and explicitly selecting the installation media during creation. This ensures the boot order and controller configuration are set correctly from the start.

tags: [hyper-v, virtual-machines, troubleshooting, boot-issues, windows-server]
diagram: {title: 

References for Investigate a VM that cannot boot from installation media: [Create a virtual machine in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/create-a-virtual-machine-in-hyper-v), [Generation 1 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-1-virtual-machine-security-settings-for-hyper-v).
