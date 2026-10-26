---
title: "Check kernel changes after a Linux guest update"
description: "Verify Linux Hyper-V integration services after kernel updates by checking kernel modules and daemons."
pubDate: 2026-09-11
category: hyper-v
tags: ["hyper-v", "linux", "kernel", "integration-services", "troubleshooting"]
translationKey: check-kernel-changes-after-a-linux-guest-update
draft: false
---

Linux kernel updates are routine, but they change the environment inside the virtual machine. The integration services that keep the guest responsive to the host are not separate packages you install manually; they are built into the kernel. When the kernel updates, the drivers and daemons update with it. You still need to verify the state after the update to ensure the new kernel includes the expected drivers and that the user-space daemons are running.

The first thing to check is whether the core kernel module is loaded. The Linux integration services driver is named `hv_utils`. It provides the foundation for several key services, including time synchronization and shutdown coordination. You can verify its presence with a simple module check.

```bash
lsmod | grep hv_utils
```

If the output shows `hv_utils` listed, the driver is loaded. The output typically includes size and usage information, confirming the module is active in the kernel. If the module is missing, the kernel update may have failed to include the necessary drivers, or the system is booting an older kernel version that does not have the integration components. In that case, you need to ensure the correct kernel is selected in the bootloader or that the update process completed successfully.

Next, you need to confirm that the user-space daemons are running. The kernel module handles the low-level communication with the hypervisor, but several daemons manage higher-level functions. The `hv_kvp_daemon` allows the host to query and set key-value pairs, which is essential for identity and configuration exchange. The `hv_vss_daemon` is required for live backups using the Volume Shadow Copy Service. The `hv_fcopy_daemon` enables file copying between the host and guest. You can check if these processes are active by listing processes containing `hv`.

```bash
ps -ef | grep hv
```

A healthy system will show processes like `hv_vmbus_con`, `hv_vmbus_ctl`, `hv_kvp_daemon`, and `hv_vss_daemon`. The presence of these daemons indicates that the integration services are operational at the user level. If any are missing, the daemon may not have started automatically, or it might not be installed on your distribution. You can see what daemons are available on the system by running `compgen -c hv_`.

If you need to restart a daemon, for example after a configuration change, you can stop it using its process ID and start it again. Hyper-V daemons run as root, so you will need elevated permissions. To stop the KVP daemon, you can use `pidof` to find the process ID and then send a termination signal.

```bash
sudo kill -15 `pidof hv_kvp_daemon`
```

Verify that the process is gone by running `ps -ef | grep hv` again. Then, start the daemon manually as root.

```bash
sudo hv_kvp_daemon
```

Confirm it is running with a new process ID. This manual restart is rarely needed after a standard kernel update, as the system services should handle the restart automatically. However, it is useful for troubleshooting if a specific daemon fails to start.

It is important to understand that enabling a service in the host does not guarantee it works in the guest if the guest kernel is outdated. The integration services must be supported by the specific kernel version running in the guest. Microsoft documents which Linux distributions and kernel versions are supported for Hyper-V on Windows. If you are running a custom kernel or an older distribution, you may need to consult the supported Linux virtual machines documentation to ensure your kernel includes the necessary integration components.

For Windows guests, you can check the integration services version using a registry query. Linux guests do not have a similar registry key; the version is tied to the kernel version itself. You can check the kernel version with `uname -r` and compare it against the supported versions. If the kernel version is current and the `hv_utils` module is loaded, the integration services are likely functioning correctly.

After a kernel update, always verify the integration services. Check the `hv_utils` module, confirm the daemons are running, and ensure the kernel version is supported. This simple verification prevents subtle issues like time drift or backup failures that can arise from mismatched host and guest components.

If you encounter issues, start by checking the kernel version and the loaded modules. If the modules are present but the daemons are not running, check the system logs for errors during startup. If the modules are missing, ensure the correct kernel is selected in the bootloader. For persistent issues, consult the supported Linux virtual machines documentation for your specific distribution and kernel version.

If you are managing multiple Linux guests, consider automating the verification of integration services. A simple script that checks for the `hv_utils` module and running daemons can be scheduled to run after updates. This provides early warning if an update breaks the integration components, allowing you to address the issue before it impacts production workloads.

References for Check kernel changes after a Linux guest update: [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services), [Feature Descriptions for Linux and FreeBSD virtual machines on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/feature-descriptions-for-linux-and-freebsd-virtual-machines-on-hyper-v), [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v).
