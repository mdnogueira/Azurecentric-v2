---
title: "Understand Linux integration services on Hyper-V"
description: "Verify Linux Hyper-V integration services are active on Windows Server 2022 using kernel modules and daemons."
pubDate: 2024-06-08
category: hyper-v
tags: []
translationKey: understand-linux-integration-services-on-hyper-v
draft: true
---

You have a Linux virtual machine running on a Windows Server 2022 Hyper-V host. The guest is performing adequately, but you need to confirm that the integration services are actually active and functioning. Unlike Windows guests, where these services appear as standard Windows services, Linux integration services are embedded in the kernel and managed through specific daemons and kernel modules. If these components are not running, features like time synchronization, heartbeat monitoring, and dynamic memory will fail or behave unpredictably.

The first thing to check is whether the core kernel module is loaded. Linux integration services rely on the `hv_utils` module to communicate with the Hyper-V host. You can verify its presence by running:

```bash
lsmod | grep hv_utils
```

If the module is loaded, the output will list `hv_utils` along with its size and dependencies. The documentation notes that `hv_utils` is the primary driver for these services [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). If the module is not listed, the integration services are not active, and you may need to check your kernel version or ensure the correct kernel headers are installed for your distribution.

Once the module is confirmed, you need to verify that the associated daemons are running. These daemons handle specific tasks such as key-value pair exchange, file copying, and volume shadow copy requests. You can list the running processes related to Hyper-V by executing:

```bash
ps -ef | grep hv
```

This command will show you the active daemons. Common daemons include `hv_kvp_daemon` for key-value pair exchange, `hv_vss_daemon` for live backups, and `hv_fcopy_daemon` for file copying [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). If you see these processes running, the services are active. If they are missing, they may not be supported on your specific Linux version or may not be installed. You can check for available daemons by running:

```bash
compgen -c hv_
```

This will list all available Hyper-V daemon commands on your system. If a required daemon is missing, consult your distribution's documentation for the correct package to install [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

It is important to understand that enabling a service in the host automatically starts the corresponding daemon in the guest. When you enable a service in Hyper-V, it triggers the service to start running in the guest operating system [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). You do not need to manually start daemons as a standard verification step. Manual intervention is only required if a daemon has stopped unexpectedly or if you are troubleshooting a specific failure.

For example, if you suspect the key-value pair daemon has stopped, you can stop it using its process ID and then restart it as root:

```bash
sudo kill -15 `pidof hv_kvp_daemon`
sudo hv_kvp_daemon
```

You can verify that the daemon is running by checking the process list again. Note that these daemons run as root, so you will need appropriate permissions to start or stop them [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

Another critical aspect is the version of the integration services. Some features may not work correctly if the guest's integration services are not current. For Linux, the integration services are part of the kernel, so updating the kernel will typically bring you to the latest version. The documentation recommends keeping integration services up to date to get the best performance and most recent features for your virtual machines [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). There is no separate version query command for Linux guests; the version is tied to the kernel release.

When managing these services, remember that stopping an integration service may severely affect the host's ability to manage your virtual machine. For example, stopping the heartbeat service will prevent the host from tracking the state of the virtual machine [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services). Therefore, it is best practice to only control integration services from the Hyper-V host using the appropriate tools, such as Hyper-V Manager or PowerShell cmdlets like `Enable-VMIntegrationService` and `Disable-VMIntegrationService` [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

If you need to troubleshoot issues with integration services, start by checking the kernel module and daemons as described above. If they are running correctly, check the host-side configuration to ensure the services are enabled for the virtual machine. You can do this by right-clicking the virtual machine in Hyper-V Manager, selecting **Settings**, and then selecting **Integration Services** to see which services are enabled [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

Finally, keep in mind that Linux integration services are generally provided through the Linux kernel, and the `hv_utils` module is the primary component. By ensuring that this module is loaded and the necessary daemons are running, you can ensure that your Linux virtual machine is fully integrated with the Hyper-V host and can take advantage of all available features.

To verify that everything is working correctly, you can perform a simple test by enabling a service in the host, such as Guest Service Interface, and then checking if the corresponding daemon is running in the guest. If the daemon starts automatically, the integration is working as expected. If not, you may need to manually start the daemon and ensure it is configured to start on boot.

For more detailed information on specific features and their configurations, refer to the [Feature Descriptions for Linux and FreeBSD virtual machines on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/feature-descriptions-for-linux-and-freebsd-virtual-machines-on-hyper-v) and [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Best-Practices-for-running-Linux-on-Hyper-V) documentation.

tags: [hyper-v, linux, integration-services, virtualization, windows-server-2022]
diagram: {title:
