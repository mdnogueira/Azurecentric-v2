---
title: "Choose a supported Linux distribution for Hyper-V"
description: "Selecting a supported Linux distribution for Hyper-V requires checking LIS integration, kernel version, and secure boot compatibility."
pubDate: 2025-08-30
category: hyper-v
tags: ["hyper-v", "linux", "secure-boot", "integration-services"]
translationKey: choose-a-supported-linux-distribution-for-hyper-v
draft: false
---

You are planning a Linux virtual machine on a Windows Server 2025 Hyper-V host. The first technical decision is not the VM size or the network topology, but the specific Linux distribution and version you choose. This choice determines whether you rely on built-in kernel drivers or need separate integration services, and it dictates how you handle secure boot and memory management.

Hyper-V supports both emulated and Hyper-V-specific devices for Linux virtual machines. When running with emulated devices, no additional software is required to be installed. However, emulated devices do not provide high performance and cannot leverage the rich virtual machine management infrastructure that Hyper-V offers. To make full use of all benefits, it is best to use Hyper-V-specific devices, which require Linux Integration Services (LIS). The availability and management of these drivers depend entirely on the Linux distribution vendor.

## Built-in drivers versus downloadable packages

Most modern Linux distributions include LIS directly in their kernel. When a distribution lists LIS as "Built in," the Microsoft-provided downloadable LIS package is not compatible with that distribution and should not be installed. The kernel module version numbers for built-in LIS will differ from the standalone download package, which is expected and does not indicate an outdated driver.

For example, Ubuntu LTS releases from 16.04 through 24.04 include built-in LIS. Similarly, Red Hat Enterprise Linux (RHEL) and CentOS 8.x and 9.x series include built-in LIS that are certified by Red Hat for use on Hyper-V. Microsoft explicitly advises against downloading and installing separate LIS packages for RHEL, as doing so may limit your Red Hat support. The built-in drivers are sufficient for running high-performance synthetic devices.

If you are using a distribution based on an older kernel that does not include the latest LIS enhancements, Microsoft may provide a separate download. However, for most current LTS releases, the built-in drivers are the correct path. You should verify the specific support page for your chosen distribution to confirm whether LIS is built-in or requires a separate install.

## Secure boot and Generation 2 constraints

Hyper-V Generation 2 virtual machines use UEFI firmware and have secure boot enabled by default. This is a security feature, but it can prevent certain Linux distributions from booting if their bootloader is not signed with a key trusted by Hyper-V's secure boot database.

Some Linux virtual machines will not boot with secure boot enabled. If you encounter this issue, you can disable secure boot in the **Firmware** section of the virtual machine settings in Hyper-V Manager. Alternatively, you can disable it using PowerShell:

```powershell
Set-VMFirmware -VMName "VMname" -EnableSecureBoot Off
```

This command is illustrative; you must replace "VMname" with your actual virtual machine name. Disabling secure boot is a valid workaround for compatibility, but it reduces the security posture of the VM. If possible, check your distribution vendor's documentation for guidance on secure boot compatibility with Hyper-V.

For Ubuntu Generation 2 VMs, if you are copying a VHD from an existing VM to create a new one, you may need to perform specific steps inside the guest OS before the new VM can boot. This includes copying the ubuntu directory to a new boot directory and renaming the shimx64.efi file to bootx64.efi. These steps are necessary because the UEFI boot loader path differs between the original and the new VM. This is a specific workaround for certain Ubuntu images where the boot path differs, not a universal requirement for all Ubuntu Gen 2 VMs.

## Dynamic memory and performance considerations

Dynamic memory is supported on 64-bit Linux virtual machines, but it requires careful configuration. If you enable dynamic memory on Windows Server, you must specify the Startup memory, Minimum memory, and Maximum memory parameters in multiples of 128 megabytes (MB). Failure to do so can lead to hot-add failures, and you may not see any memory increase in the guest operating system.

Dynamic memory operations can fail if the guest operating system is running too low on memory. Best practices include setting the startup and minimal memory to equal or greater than the amount recommended by the distribution vendor. Applications that consume most of the available RAM are limited to using up to 80 percent of the available memory when dynamic memory is enabled.

For RHEL/CentOS, hot-add support is not enabled by default. To enable it, you need to create a udev rule. Create a file named `/etc/udev/rules.d/100-balloon.rules` with the following content:

```bash
SUBSYSTEM=="memory", ACTION=="add", ATTR{state}="online"
```

Then reboot the system. This rule is also removed when LIS is uninstalled, so it must be recreated if you need dynamic memory after uninstallation. Note that this specific requirement applies to RHEL/CentOS distributions; other distributions like Ubuntu may have different default behaviors for dynamic memory hot-add.

## Verification steps

Before deploying, verify the following:

1. Check the official Microsoft support page for your Linux distribution to confirm LIS availability (built-in or downloadable).
2. Ensure your VM is Generation 2 if you need features like secure boot or UEFI.
3. If secure boot prevents booting, decide whether to disable it or find a secure boot-compatible kernel.
4. Configure dynamic memory settings in multiples of 128 MB if you plan to use it.
5. For RHEL/CentOS, create the udev rule for hot-add if needed.

These steps ensure that your Linux VM runs on supported drivers and avoids common configuration pitfalls.

References for Choose a supported Linux distribution for Hyper-V: [Supported Linux and FreeBSD virtual machines for Hyper-V on Windows Server and Windows](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/supported-linux-and-freebsd-virtual-machines-for-hyper-v-on-windows), [Supported Ubuntu virtual machines on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Supported-Ubuntu-virtual-machines-on-Hyper-V), [CentOS and Red Hat Enterprise Linux VMs on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Supported-CentOS-and-Red-Hat-Enterprise-Linux-virtual-machines-on-Hyper-V).
