---
title: "Configure a virtual network adapter and VLAN"
description: "Configure Hyper-V virtual network adapters and VLANs using GUI and PowerShell, clarifying tagging scope and prerequisites."
pubDate: 2024-11-20
category: hyper-v
tags: ["hyper-v", "azure-virtual-network", "vlan", "powershell", "windows-server", "troubleshooting"]
translationKey: configure-a-virtual-network-adapter-and-vlan
draft: false
---

You need to isolate virtual machine traffic on a Windows Server Hyper-V host. The most direct way to achieve this is by configuring VLAN IDs on the virtual network adapter. This ensures that traffic leaving the virtual machine is tagged correctly before it reaches the physical switch.

VLANs rely on 802.1q tagging. This means both the physical network adapter on the host and the physical switch it connects to must support this standard. Without this support, the tags will not be processed correctly by the network infrastructure. The host configuration happens in two stages: first, you configure the virtual switch to handle the management OS and the virtual machines; second, you assign specific VLAN IDs to the individual virtual network adapters.

## Prerequisites and permissions

Before configuring VLANs, ensure the following:

*   A physical network adapter that supports 802.1q VLAN tagging.
*   A physical network switch that supports 802.1q VLAN tagging.
*   Administrator privileges on the Hyper-V host to modify virtual switch settings and virtual machine configurations.

## Configuring the virtual switch

The virtual switch acts as the bridge between the virtual machines and the physical network. You can configure the management operating system to use a specific VLAN ID. This is useful if you want the host itself to communicate on a specific network segment.

To configure the virtual switch via the GUI:

1.  Open **Hyper-V Manager**.
2.  Select **Virtual Switch Manager** from the **Actions** pane on the right.
3.  Under **Virtual Switches** on the left, select the virtual switch connected to the physical network adapter.
4.  In the right pane, under **VLAN ID**, select **Enable virtual LAN identification for management operating system**.
5.  Enter the desired VLAN ID number.
6.  Select **OK**.

This setting applies specifically to the management operating system. It does not automatically tag traffic from virtual machines connected to the switch. VM traffic remains untagged unless you explicitly configure a VLAN ID on each virtual network adapter.

## Configuring the virtual machine adapter

Each virtual machine can be assigned a specific VLAN ID. This allows different virtual machines on the same virtual switch to communicate on different network segments. You can configure this via the GUI or PowerShell.

### Using Hyper-V Manager

1.  Right-click the virtual machine in **Hyper-V Manager** and select **Settings**.
2.  Under **Hardware** in the left pane, select the **Network Adapter**.
3.  In the right pane, under **VLAN ID**, select **Enable virtual LAN identification**.
4.  Enter the VLAN ID that matches the network segment you want the virtual machine to use.
5.  Select **OK**.

In this default access mode, the virtual machine sends untagged frames. The Hyper-V virtual switch adds the 802.1q tag before forwarding the traffic to the physical network adapter. The virtual machine operating system is unaware of the VLAN tag.

### Using PowerShell

PowerShell provides a more scriptable approach, especially for bulk configurations. The `Set-VMNetworkAdapterVlan` cmdlet allows you to configure the VLAN ID for a virtual network adapter.

```powershell
# Example: Set VLAN ID 100 for a virtual network adapter
Set-VMNetworkAdapterVlan -VMName "MyVirtualMachine" -VMNetworkAdapterName "Network Adapter" -Access -VlanId 100
```

This command sets the virtual network adapter to access mode with VLAN ID 100. As noted, the VM itself sends untagged traffic, and the host handles the tagging.

## Handling multiple VLANs

If a virtual machine needs to communicate on multiple VLANs, you have two options:

1.  **Multiple Network Adapters:** Connect additional virtual network adapters to the virtual switch and assign different VLAN IDs to each. Ensure that the IP addresses and routing within the virtual machine are configured correctly to handle traffic on these different segments.
2.  **Trunk Mode:** Configure the virtual network adapter in trunk mode. This allows the adapter to send and receive traffic tagged with multiple VLAN IDs. You can achieve this using the `Set-VMNetworkAdapterVlan` cmdlet.

The source documentation references `Set-VMNetworkAdapterVlan` for trunk mode configuration but does not provide the specific parameter syntax for defining allowed VLAN IDs in this mode. You should consult the official PowerShell help for `Set-VMNetworkAdapterVlan` to determine the correct parameters for your specific version of Windows Server. Trunk mode is useful when the virtual machine itself needs to handle VLAN tagging, such as in a virtual router or firewall scenario.

## Verification

After configuring the VLANs, verify the settings:

*   **GUI:** Check the **VLAN ID** setting in the virtual machine's network adapter settings in Hyper-V Manager.
*   **PowerShell:** Use the `Get-VMNetworkAdapterVlan` cmdlet to retrieve the current VLAN configuration for a virtual network adapter.

```powershell
Get-VMNetworkAdapterVlan -VMName "MyVirtualMachine" -VMNetworkAdapterName "Network Adapter"
```

This command will display the VLAN mode (Access or Trunk) and the associated VLAN ID(s).

## Troubleshooting

If virtual machines cannot communicate on the expected VLANs, check the following:

*   **Physical Switch Configuration:** Ensure the physical switch port connected to the Hyper-V host is configured as a trunk port (if using trunk mode) or an access port (if using access mode) with the correct VLAN IDs allowed.
*   **VLAN ID Mismatch:** Verify that the VLAN ID configured on the virtual network adapter matches the VLAN ID expected by the physical network infrastructure.
*   **Driver Support:** Ensure the physical network adapter driver on the Hyper-V host supports 802.1q VLAN tagging.
*   **Hyper-V Virtual Switch:** Confirm that the virtual switch is correctly configured and connected to the physical network adapter.

By carefully configuring the virtual switch and virtual network adapters, you can effectively isolate and manage network traffic for your virtual machines on a Windows Server Hyper-V host.

References for Configure a virtual network adapter and VLAN: [Configure virtual local area networks for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/configure-virtual-local-area-networks-for-hyper-v), [Configure virtual local area networks for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/configure-virtual-local-areal-networks-for-hyper-v).
