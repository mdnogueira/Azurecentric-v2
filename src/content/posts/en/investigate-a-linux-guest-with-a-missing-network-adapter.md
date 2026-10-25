---
title: "Investigate a Linux guest with a missing network adapter"
description: "Troubleshoot a missing Linux network adapter on Hyper-V by verifying synthetic hardware, removing legacy conflicts, and checking driver status."
pubDate: 2024-09-25
category: hyper-v
tags: ["hyper-v", "linux", "networking", "integration-services", "troubleshooting"]
translationKey: investigate-a-linux-guest-with-a-missing-network-adapter
draft: false
---

You open a Linux virtual machine on a Windows Server 2022 host and find the network interface is missing. There is no `eth0`, no `ens192`, just a shell prompt and a silent network stack. The first thing to check is not the IP configuration, but the virtual hardware and the drivers that drive it.

Hyper-V relies on synthetic drivers for performance and functionality. The synthetic network adapter is the primary interface for Linux guests, and it depends on the `hv_netvsc` kernel module. If that module is not loaded, or if the virtual hardware is not attached, the guest cannot see the network hardware.

## Check the synthetic network driver

The synthetic network adapter is provided by the `hv_netvsc` driver, which is part of the Linux kernel integration services included in modern distributions. You need to confirm that this driver is loaded and that the underlying VMBus channel is active.

Run the following command to list loaded modules related to Hyper-V networking:

```bash
lsmod | grep hv_netvsc
```

If the output is empty, the driver is not loaded. This usually happens if the kernel is too old to include the driver, or if the module is blacklisted. In that case, you may need to update the kernel or check for conflicting configurations.

## Remove legacy network adapters

A common cause of missing or misidentified network adapters in Linux guests is the presence of legacy network adapters. Hyper-V supports legacy network adapters for compatibility with older operating systems, but they use different drivers and can conflict with synthetic adapters.

If both a legacy and a Hyper-V-specific network adapter are attached to a virtual machine, Linux may assign unpredictable interface names or fail to recognize the synthetic adapter entirely. The best practice is to remove all legacy network adapters when using Hyper-V-specific network adapters.

1. Shut down the virtual machine.
2. Open Hyper-V Manager and select the virtual machine.
3. Go to **Settings**.
4. Under **Network Adapter**, ensure only the synthetic adapter is present.
5. Remove any **Legacy Network Adapter** entries.
6. Start the virtual machine.

After restarting, check the network interfaces again with `ip link` or `ifconfig -a`. The synthetic adapter should now appear with a standard name like `eth0` or `ens192`.

## Verify integration services

Even with the correct synthetic adapter, the guest must have the Hyper-V integration services enabled to communicate with the host. The integration services include the network driver, time synchronization, and heartbeat.

On the host, you can check the status of the integration services for the virtual machine using PowerShell:

```powershell
Get-VMIntegrationService -VMName "LinuxVM"
```

Look for services such as **Heartbeat** and **Time Synchronization**. These services should be enabled. If they are disabled, the guest may not have full functionality, although the synthetic network adapter itself is controlled by the VM's network adapter settings in Hyper-V, not the Integration Services toggle.

In the guest, the integration services are managed by the kernel. The `hv_utils` module provides core services, and the `hv_netvsc` module handles networking. You can verify that the `hv_utils` module is loaded:

```bash
lsmod | grep hv_utils
```

If the module is not loaded, check the kernel logs for errors:

```bash
dmesg | grep hv
```

## Check for MAC address conflicts

If the network adapter is present but not functioning, check the MAC address. Linux may lose its network configuration if the MAC address changes, which can happen during live migration or if the virtual machine settings are modified.

For failover clustering, it is recommended to use static MAC addresses for Linux virtual machines. You can set a static MAC address in Hyper-V Manager:

1. Shut down the virtual machine.
2. Go to **Settings** > **Network Adapter**.
3. Under **Advanced Features**, set the **MAC address** to a static value.
4. Start the virtual machine.

In the guest, ensure that the network configuration file (e.g., `/etc/network/interfaces` or a NetworkManager configuration) matches the static MAC address. If the MAC address has changed, update the configuration file and restart the network service.

## Verify the network interface

Once the synthetic adapter is present and the integration services are enabled, verify that the network interface is up and configured correctly.

Use the `ip` command to check the status of the interface:

```bash
ip link show
```

Look for the interface associated with the synthetic adapter. It should be in the `UP` state. If it is `DOWN`, bring it up:

```bash
sudo ip link set dev <interface_name> up
```

Check the IP configuration:

```bash
ip addr show
```

If the interface has no IP address, configure it using DHCP or a static IP, depending on your network setup.


Reference: [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).
