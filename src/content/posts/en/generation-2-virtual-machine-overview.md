---
title: "Generation 2 Virtual Machine Overview"
description: "Virtual machine generation determines the virtual hardware and functionality presented to the virtual machine. In Hyper-V on Windows Server 2012 R2 there are two supported…"
pubDate: 2013-06-25
category: hyper-v
tags: ["hyper-v", "windows-server"]
translationKey: generation-2-virtual-machine-overview
legacy: true
legacyUrl: /2013/06/generation-2-virtual-machine-overview.html
---

Virtual machine generation determines the virtual hardware and functionality presented to the virtual machine. In Hyper-V on Windows Server 2012 R2 there are two supported virtual machine generations, generation 1 and generation 2 virtual machines. Generation 2 virtual machines will be presented with a simplified virtual hardware model and supports Unified Extensible Firmware Interface (UEFI) firmware instead of BIOS based firmware. Additionally the majority of emulated (legacy) devices have been removed from generation 2 virtual machines.

In previous versions of Hyper-V there is only one type of virtual machine type. Starting with Hyper-V on Windows Server 2012 R2 Preview there are two types of virtual machines generations that can be selected when a new virtual machine is created.
  * Generation 1 - This virtual machine generation provides the same virtual hardware to the virtual machine as in previous versions of Hyper-V.
  * Generation 2 - This Virtual machine generation provides the following new functionality to a virtual machine:
      * Secure Boot (enabled by default)
      * Boot from a SCSI virtual hard drive
      * Boot from a SCSI virtual DVD drive
      * PXE boot using a standard network adapter
      * UEFI firmware support
      * IDE drives and legacy network adapter support has been removed

## Requirements

The following guest operating systems are supported as generation 2 virtual machines.
  * Windows Server 2012
  * Windows Server 2012 R2 Preview
  * 64 bit versions of Windows 8
  * 64 bit versions of Windows 8.1 Preview
  **NOTE:** Once a virtual machine has been created, you cannot change its generation.

## Generation 2 Virtual Machine Features

**PXE boot using a standard network adapter** - In previous versions of Hyper-V if you wanted to perform a remote installation of the guest operating system via PXE boot, you were required to install a legacy network adapter for PXE boot in addition to the standard network adapter that you would use after the operating system was installed.

Generation 2 virtual machines support PXE boot using a standard network adapter, so there is no need to install a legacy network adapter. The legacy network adapter has been removed from generation 2 virtual machines.

**Boot from SCSI controller** - In previous versions of Hyper-V you could not boot a virtual machine from a SCSI attached virtual hard disk or DVD drive.

Generation 2 virtual machines can boot from a virtual hard disk or DVD drive that is attached to the SCSI controller. The virtual IDE controller has been removed from generation 2 virtual machines.

**Secure Boot** - Secure Boot is a feature that helps prevent unauthorized firmware, operating systems, or UEFI drivers (also known as Option ROMs) from running at boot time. Generation 2 virtual machines can take advantage of Secure Boot.
  **Note:** Secure Boot is enabled by default for generation 2 virtual machines. This can be modified after the virtual machine has been created.

With this new generation 2 virtual machine there some caveats. You can run generation 1 and generation 2 side by side, but generation 2 does not support all of the Hyper-V supported guest operating systems. For operating systems that are not supported by generation 2 virtual machines, they will need to be installed in a generation 1 virtual machine.

Regarding performance, in the day to day running of a virtual machine there is no performance difference between a generation 1 and generation 2 virtual machines. However in the following two scenarios there is a performance improvement when using generation 2 virtual machines.
  1. Virtual machine operating system boot time can be up to 20% faster with generation 2 virtual machines.
  2. Installing the guest operating system can be up to 50% faster with generation 2 virtual machines.

The major benefits of using generation 2 virtual machine are virtual machine can boot off a SCSI device or a standard network adapter and helps prevent unauthorized firmware, operating systems, or UEFI drivers (also known as Option ROMs) from running at boot time when Secure Boot is enabled.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
