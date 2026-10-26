---
title: "Configure networking inside an Ubuntu Hyper-V guest"
description: "Configure Ubuntu networking on Windows Server 2022 Hyper-V using external switches, correct adapters, and static MACs."
pubDate: 2024-07-31
category: hyper-v
tags: ["ubuntu", "linux", "hyper-v", "windows-server", "virtual-switch", "windows-server-2022"]
translationKey: configure-networking-inside-an-ubuntu-hyper-v-guest
draft: false
---

You need an Ubuntu guest on Windows Server 2022 to reach the network. The first step is creating a virtual switch on the host, then ensuring the guest uses the correct adapter type and a stable MAC address. This avoids the common issue where Linux loses its network configuration after a restart or failover.

## Create the virtual switch on the host

The virtual switch is the software layer that connects your virtual machines to the physical network. You can create it using Hyper-V Manager or PowerShell. Administrative rights are required on the Windows Server 2022 host.

If you prefer PowerShell, open an elevated session and identify the physical network adapter you want to use:

```powershell
Get-NetAdapter
```

Create an external virtual switch by binding it to that adapter. Replace `<switch-name>` and `<netadapter-name>` with your values:

```powershell
New-VMSwitch -Name Exampleswitchname -NetAdapterName Examplenetadaptername
```

This command binds the switch to the physical NIC. PowerShell execution continues silently unless you use specific flags to force confirmation. If you use Hyper-V Manager, you will be prompted to confirm that this may disrupt network connectivity on the host. Select **Yes** to continue.

The host's management OS can share this adapter if you enable that option later, but for the guest, the switch is now ready. Note that enabling management OS sharing reconfigures the host's IP stack on the bound NIC, which may disrupt existing remote connections to the host.

## Configure the Ubuntu virtual machine

When you create the Ubuntu virtual machine, you must attach it to the switch you just created. The type of network adapter you choose matters for performance and stability.

Use the Hyper-V-specific network adapter, not the legacy network adapter. The Hyper-V-specific adapter is designed for performance and is the recommended choice for supported guest operating systems like Ubuntu. The legacy adapter emulates older hardware and is only necessary if you need to boot from a network for installation. If both are attached, Linux may show random interface names, which complicates configuration.

You can add the adapter via Hyper-V Manager or PowerShell. In Hyper-V Manager, select the virtual machine, go to **Settings**, and add a **Network Adapter**. Select the virtual switch you created. If you are using PowerShell, you can connect an existing VM like this:

```powershell
Add-VMNetworkAdapter -VMName Examplevmname -SwitchName Exampleswitchname
```

## Set a static MAC address

Linux networking configuration is often tied to the MAC address of the network interface. If the MAC address changes, the network configuration may be lost. This is particularly important if you plan to use failover clustering.

Configure a static MAC address for the virtual network adapter. You can do this in Hyper-V Manager by selecting the virtual machine, going to **Settings**, selecting the **Network Adapter**, and setting a specific MAC address. Alternatively, use PowerShell:

```powershell
Set-VMNetworkAdapter -VMName Examplevmname -StaticMacAddress ExampleMACaddress
```

Replace `<MAC-address>` with a valid MAC address in the format `00-11-22-33-44-55`. This ensures the guest always sees the same hardware address, preserving your network settings.

## Verify connectivity in Ubuntu

Once the VM is running, log in to Ubuntu. Check the network interface configuration. The interface name might be something like `eth0` or `ens4`. Use `ip addr` to see the assigned IP address and `ping` to test connectivity.

If you encounter issues, ensure the virtual switch is correctly bound to the physical adapter on the host. Also, verify that the Ubuntu guest has the Hyper-V integration services installed, which provide the drivers for the Hyper-V-specific network adapter.

This setup provides a stable network connection for your Ubuntu guest. The key is using the correct adapter type and a static MAC address to prevent configuration drift. If you need more advanced networking features, such as VLANs, you can configure those on the virtual switch using PowerShell cmdlets like `Set-VMNetworkAdapterVlan`.

For further details on virtual switch creation, refer to the [Create and configure a virtual switch with Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/Create-a-virtual-switch-for-Hyper-V-virtual-machines) documentation. For planning considerations, see [Plan for Hyper-V networking in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/plan-hyper-v-networking-in-windows-server). For Linux-specific best practices, including file system tuning and I/O schedulers, consult [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v).
