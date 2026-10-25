---
title: "Check time synchronisation in a Linux VM"
description: "Check Hyper-V time synchronisation for Linux VMs by verifying host integration services and guest kernel modules."
pubDate: 2024-11-25
category: hyper-v
tags: ["hyper-v", "linux", "time-synchronization", "integration-services", "troubleshooting"]
translationKey: check-time-synchronisation-in-a-linux-vm
draft: false
---

If a Linux virtual machine on Hyper-V drifts from the host time, the first thing to check is not the guest's NTP configuration, but the host-side integration service that drives the synchronisation. Hyper-V provides a dedicated Time Synchronization integration service that keeps the guest clock aligned with the host. If that service is disabled, or if the guest kernel module is missing, the Linux time will eventually diverge regardless of how well `chrony` or `systemd-timesyncd` is configured.

## Confirm the host-side integration service is enabled

The Time Synchronization service must be enabled on the Hyper-V host for the virtual machine. For Windows guests, integration services are on by default, but Linux guests require the host to have the service enabled to allow the guest kernel module to function. You can verify the state using PowerShell on the host.

Run the following command to list the integration services for the target virtual machine:

```powershell
Get-VMIntegrationService -VMName "LinuxVM"
```

Look for the entry with the name `Time Synchronization`. The `Enabled` column should show `True`. If it shows `False`, enable it using:

```powershell
Enable-VMIntegrationService -VMName "LinuxVM" -Name "Time Synchronization"
```

The service must be enabled in both the host and guest in order to function. Enabling it on the host allows the guest to use the service, but the guest must also have the necessary kernel support loaded.

## Verify the Linux kernel module is loaded

On Linux, the integration services are provided through the Linux kernel. The specific driver for time synchronisation is part of the `hv_utils` module. You need to confirm that this module is loaded inside the virtual machine.

Connect to the Linux VM and run:

```bash
lsmod | grep hv_utils
```

You should see output similar to:

```text
Module                  Size   Used by
hv_utils               20480   0
hv_vmbus               61440   8 hv_balloon,hyperv_keyboard,hv_netvsc,hid_hyperv,hv_utils,hyperv_fb,hv_storvsc
```

If `hv_utils` is not listed, the kernel module is not loaded. This typically happens on older Linux distributions or custom kernels that do not include the Hyper-V integration components by default. In such cases, you may need to update the kernel or install the Linux Integration Services package for your specific distribution.

## Check the guest service status

Even if the kernel module is loaded, the corresponding daemons must be running for the integration services to be fully functional. For Linux guests, the integration services are managed by daemons provided in the `linux-tools` package. You can check if the required daemons are active by running:

```bash
ps -ef | grep hv
```

The output should include processes related to the Hyper-V services. While the time synchronisation itself is handled by the kernel driver, the presence of the `hv_vmbus` related processes confirms that the communication channel between the host and guest is operational.

## Understand the synchronisation mechanism

The Hyper-V Time Synchronization feature ensures that the maintained time inside a virtual machine is kept synchronized with the maintained time on the host. This is a host-to-guest synchronisation mechanism. It does not replace NTP for external time sources, but it prevents the guest clock from drifting significantly from the host clock, which is crucial for cluster operations, file system consistency, and authentication protocols.

If the host time is accurate, the guest time will generally be accurate. However, if the host time is incorrect, the guest time will also be incorrect. Therefore, ensuring the host time is correct is a prerequisite for guest time accuracy.

## Troubleshooting drift

If the time is still drifting after confirming the integration service is enabled and the kernel module is loaded, consider the following:

1. **Host time accuracy**: Verify that the Hyper-V host is synchronized with a reliable external time source. If the host time is drifting, the guest time will follow.
2. **Kernel version**: Older Linux kernels may have bugs in the `hv_utils` module. Updating to a newer kernel version can resolve time synchronisation issues.

By checking the host-side integration service and the guest kernel module, you can quickly identify whether the time drift is caused by a configuration issue or a deeper problem with the virtual machine's setup.


References for Check time synchronisation in a Linux VM: [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services), [Feature Descriptions for Linux and FreeBSD virtual machines on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/feature-descriptions-for-linux-and-freebsd-virtual-machines-on-hyper-v), [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Best-Practices-for-running-Linux-on-Hyper-V).
