---
title: "Check storage and network drivers in a Linux guest"
description: "Verify Linux Hyper-V integration drivers and daemons using host PowerShell and guest commands."
pubDate: 2025-10-22
category: hyper-v
tags: ["hyper-v", "linux", "integration-services", "troubleshooting", "drivers"]
translationKey: check-storage-and-network-drivers-in-a-linux-guest
draft: false
---

You have a Linux virtual machine on a Windows Server 2025 host. It is not behaving as expected, or you are preparing it for production and want to confirm the integration components are active. The first thing to check is whether the synthetic drivers are loaded and the management daemons are running.

Hyper-V Integration Services enhance virtual machine performance and provide convenience features by leveraging two-way communication with the Hyper-V host [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). Many of these services are conveniences, such as guest file copy, while others are important to the virtual machine's functionality, such as synthetic device drivers [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). The driver components are not intended to be serviced manually [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

## Check the host-side configuration

Before looking inside the guest, confirm that the host has enabled the relevant integration services for the virtual machine. You need to know the virtual machine name and have appropriate permissions on the host.

Run the following PowerShell command on the Windows Server 2025 host:

```powershell
Get-VMIntegrationService -VMName "LinuxVM"
```

The output lists all integration services available on the Hyper-V host and whether the host has enabled the virtual machine to use them [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). Look for services such as Heartbeat, Time Synchronization, and Shutdown. If a service is disabled on the host, it will not function in the guest, regardless of the guest's configuration.

## Verify the guest kernel drivers

Linux integration services are generally provided through the Linux kernel [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). The Linux integration services driver is named **hv_utils** [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). Synthetic storage and network adapters rely on this foundation.

Connect to the Linux guest and run:

```bash
lsmod | grep hv_utils
```

If the **hv_utils** module is loaded, you should see output similar to:

```bash
Module                  Size   Used by
hv_utils               20480   0
hv_vmbus               61440   8 hv_balloon,hyperv_keyboard,hv_netvsc,hid_hyperv,hv_utils,hyperv_fb,hv_storvsc
```

The presence of **hv_netvsc** and **hv_storvsc** in the "Used by" column confirms that the synthetic network and storage drivers are active [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). If **hv_utils** is missing, the kernel may not have the necessary Hyper-V modules compiled or loaded. In that case, check the kernel version and ensure it is a supported Linux distribution for Hyper-V on Windows [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

## Confirm the management daemons

The kernel drivers handle the synthetic hardware, but several daemons manage higher-level features such as time synchronization, file copy, and volume shadow copy requests. To find out if the required daemons are running, use this command inside the guest:

```bash
ps -ef | grep hv
```

The output should show processes like **hv_kvp_daemon** and **hv_vss_daemon** [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). Integration service daemons that might be listed include:

* **hv_vss_daemon**: This daemon is required to create live Linux virtual machine backups [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).
* **hv_kvp_daemon**: This daemon allows setting and querying intrinsic and extrinsic key value pairs [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).
* **hv_fcopy_daemon**: This daemon implements a file copying service between the host and guest [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

If any of these are missing, they might not be supported on your system or they might not be installed [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). You can see what daemons are available by running:

```bash
compgen -c hv_
```

## Troubleshooting missing or unresponsive services

If the host shows a service as enabled but the guest is not responding, check the guest's service status. For example, if Heartbeat is failing, ensure the time synchronization service is running in the guest. Linux guests using current kernels contain integration services built in, but there may be optional updates available [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). You will receive the latest integration components when you update the kernel [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

To restart a specific daemon, such as the KVP daemon, use the process ID (PID) to stop it. To find the PID, look at the second column of the output from `ps -ef`, or use `pidof` [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). Hyper-V daemons run as root, so you will need root permissions [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

```bash
sudo kill -15 `pidof hv_kvp_daemon`
```

To verify that all `hv_kvp_daemon` processes are gone, run:

```bash
ps -ef | grep hv_kvp_daemon
```

To start the daemon again, run the daemon as root:

```bash
sudo hv_kvp_daemon
```

To verify that the `hv_kvp_daemon` process is listed with a new process ID, run:

```bash
ps -ef | grep hv_kvp_daemon
```

## Next steps

Once you have confirmed the drivers and daemons are active, verify the specific functionality you need. For example, check if file copy works by enabling Guest Service Interface on the host and ensuring the **hv_fcopy_daemon** is running in the guest [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). If you are using dynamic memory, ensure the **hv_balloon** module is loaded and the **hv_kvp_daemon** is running to report memory statistics [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

If issues persist, check the kernel logs for errors related to **hv_vmbus** or **hv_utils**. Also, ensure the Linux kernel version is supported for Hyper-V on Windows Server 2025 [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).
