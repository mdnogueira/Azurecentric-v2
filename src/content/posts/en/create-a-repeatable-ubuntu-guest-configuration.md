---
title: "Create a repeatable Ubuntu guest configuration"
description: "Create a repeatable Ubuntu guest configuration on Hyper-V using export, import, and generation 2 best practices."
pubDate: 2026-07-20
category: hyper-v
tags: ["hyper-v", "ubuntu", "virtual-machines", "linux", "export-import", "generation-2"]
translationKey: create-a-repeatable-ubuntu-guest-configuration
draft: true
---

You have a Windows Server 2025 host running Hyper-V and you need to deploy Ubuntu virtual machines that behave identically every time. The most reliable way to achieve this is not to build each machine from scratch, but to create one reference configuration, export it, and import it as needed.

This approach works because Hyper-V virtual machines are defined by a set of configuration files and virtual hard disks. When you export a virtual machine, you gather all required files into one unit, including the virtual hard disk files, configuration files, and any checkpoint files [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines). Importing that export allows you to register the virtual machine on the same host or a new one, effectively cloning the guest state.

[![Ubuntu Guest Configuration Workflow](/images/posts/2026/azc-333-checkpoints.svg)](/images/posts/2026/azc-333-checkpoints.svg)

## Prepare the reference Ubuntu virtual machine

Start by creating a generation 2 virtual machine. Generation 2 is the recommended choice for modern operating systems because it removes legacy hardware emulation, which simplifies the boot process and improves performance [Create a virtual machine in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/create-a-virtual-machine-in-hyper-v).

You can create the virtual machine using Hyper-V Manager or PowerShell. Using PowerShell gives you precise control over the parameters. For example, to create a generation 2 virtual machine with a new virtual hard disk and connect it to a virtual switch, you might use:

```powershell
New-VM -Name UbuntuRef -MemoryStartupBytes 4GB -BootDevice VHD -NewVHDPath .\VMs\UbuntuRef.vhdx -Path .\VMData -NewVHDSizeBytes 40GB -Generation 2 -Switch ExternalSwitch
```

This command creates the virtual machine structure but does not install the operating system. You need to attach an Ubuntu installation ISO to the virtual machine's DVD drive and start the virtual machine to perform the installation. During installation, follow standard Ubuntu procedures. Once the installation is complete and the system is updated, shut down the virtual machine.

## Apply Linux-specific best practices

Before exporting, you should apply specific configurations recommended for running Linux on Hyper-V. These adjustments ensure stability and performance.

First, configure the virtual network adapter. Use the Hyper-V-specific virtual Ethernet adapter rather than a legacy network adapter. Legacy adapters can cause unpredictable network interface names in Linux, such as `_tmp12000801310`, which complicates network configuration [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v). If you have both types attached, remove the legacy adapter [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v).

Second, consider the virtual hard disk format. If you are using a dynamic VHDX, you can reduce real disk space consumption by using a 1 MB block size instead of the default 32 MB. You can create such a disk using PowerShell:

```powershell
New-VHD -Path C:\MyVHDs\UbuntuRef.vhdx -SizeBytes 40GB -Dynamic -BlockSizeBytes 1MB
```

When creating the ext4 file system inside the guest, specify the number of groups to be 4096 to improve space efficiency with dynamic VHDX files [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v).

Third, adjust the GRUB menu timeout. In generation 2 virtual machines, the legacy hardware timer is removed, causing the GRUB menu countdown to be too fast for manual intervention. Modify `/etc/default/grub` in the guest to set `GRUB_TIMEOUT=100000` (or equivalent in `grub.conf`) to prevent the system from booting immediately without allowing you to access advanced options [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v).

Fourth, set the disk I/O scheduler. For Linux kernels using the `blk-mq` subsystem, which is common in modern Ubuntu versions, set the scheduler to `none` to pass scheduling decisions to the hypervisor. You can verify the current scheduler at `/sys/class/block/<diskname>/queue/scheduler` and write `none` to the file to change it [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v).

## Export the reference configuration

With the reference virtual machine configured and shut down, you can export it. An export gathers all the necessary files into a single location, creating a portable package [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

You can perform the export using Hyper-V Manager by right-clicking the virtual machine and selecting **Export**, or using PowerShell:

```powershell
Export-VM -Name UbuntuRef -Path C:\VMExports
```

The export process copies the virtual hard disk, configuration files, and any checkpoints to the specified path. This folder now contains a complete snapshot of your reference Ubuntu configuration.

## Import as a repeatable instance

To deploy a new virtual machine, you import the exported configuration. Hyper-V offers three import types, each with distinct behaviours regarding the virtual machine ID and file locations [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

1. **Register in-place**: This type assumes the export files are already in the location where you want to run the virtual machine. It retains the original virtual machine ID. If a virtual machine with that ID is already registered, you must delete it first. The export files become the running state files and cannot be removed [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

2. **Restore**: This type allows you to specify a new location for the virtual machine files. It retains the original virtual machine ID. The exported files remain intact and can be removed or imported again. If a virtual machine with that ID is already running, you must delete it first [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

3. **Copy**: This type is similar to restore but generates a new unique ID for the imported virtual machine. This allows you to import the same virtual machine multiple times to the same host without ID conflicts [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

For creating a repeatable instance from a reference, the **Copy** import type is usually the most appropriate. It ensures the new virtual machine has a unique identity, avoiding conflicts with the reference or other instances.

Using PowerShell, you can perform a copy import with:

```powershell
Import-VM -Path 'C:\VMExports\UbuntuRef\UbuntuRef.vmcx' -Copy -GenerateNewId
```

This command imports the virtual machine, generates a new ID, and moves the files to the default Hyper-V location. You can then start the virtual machine and verify that it boots correctly.

## Verification and next steps

After importing, start the virtual machine and connect to it using VMConnect or PowerShell:

```powershell
Start-VM -Name UbuntuNew
VMConnect.exe localhost "UbuntuNew"
```

Check that the network interface names are consistent (e.g., `eth0` or `enp0s1` rather than random names) and that the GRUB menu timeout is as expected. Verify that the disk I/O scheduler is set to `none` for the appropriate subsystem.

If you need to create additional instances, repeat the import process. Each import with `-GenerateNewId` will produce a new virtual machine with a unique ID, allowing you to scale your Ubuntu deployments consistently from the same reference configuration.

If you encounter issues with PXE booting on generation 2 virtual machines, note that the PIT timer is not present, which can terminate network connections to the PXE TFTP server. In such cases, you may need to use a legacy bootloader or configure a serial console for installation [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v).
