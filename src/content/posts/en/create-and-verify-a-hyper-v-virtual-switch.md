---
title: "Create and verify a Hyper-V virtual switch"
description: "Create and verify a Hyper-V virtual switch on Windows Server 2022 using PowerShell, covering switch types and basic configuration."
pubDate: 2024-06-05
category: hyper-v
tags: ["hyper-v", "virtual-switch", "windows-server-2022", "networking", "powershell"]
translationKey: create-and-verify-a-hyper-v-virtual-switch
draft: true
---

You need a virtual switch to give your Hyper-V virtual machines network access. The first decision is which type of switch matches your connectivity requirements. An external switch binds to a physical network adapter and provides connectivity to the outside network. An internal switch allows communication between the host and the virtual machines but not to an external network. A private switch restricts communication to the virtual machines only, excluding the host.

The Hyper-V role must be installed on the Windows Server 2022 host before you can create a switch. You also need administrative rights to run the necessary PowerShell cmdlets. If you are configuring an external switch, be aware that binding a virtual switch to a physical network adapter can disrupt your current network connectivity. You will need to confirm this disruption during the creation process.

[![Hyper-V Virtual Switch Creation Flow](/images/posts/2024/azc-056-checkpoints.svg)](/images/posts/2024/azc-056-checkpoints.svg)

## Identify the correct network adapter

Before creating the switch, you must identify the physical network adapter you intend to bind. For an external switch, this is the adapter that provides the network path you want the virtual machines to use. For internal or private switches, no physical adapter is required, but you still need to know the available network interfaces on the host for verification purposes.

Run the following command in an elevated PowerShell session to list the network adapters:

```powershell
Get-NetAdapter
```

Review the output to find the name of the adapter you want to use. Use the name exactly as it appears in the output to avoid ambiguity. If you are setting up an external switch, ensure this adapter is not currently in use by another critical service that cannot tolerate a brief interruption.

## Create the virtual switch

You can create a virtual switch using the `New-VMSwitch` cmdlet. The command structure differs slightly depending on the switch type you are creating.

### External virtual switch

To create an external switch, specify the switch name and the network adapter name. The following command creates a switch named `ExternalSwitch` and binds it to the adapter named `Ethernet0`:

```powershell
New-VMSwitch -Name ExternalSwitch -NetAdapterName Ethernet0
```

If you are running this interactively, you may receive a warning that the change may disrupt network connectivity. Select **Yes** to proceed. The switch is now created and bound to the physical adapter.

### Internal or private virtual switch

For internal or private switches, you do not bind to a physical adapter. Instead, you specify the switch type. The following command creates an internal switch named `InternalSwitch`:

```powershell
New-VMSwitch -Name InternalSwitch -SwitchType Internal
```

To create a private switch, replace `Internal` with `Private`:

```powershell
New-VMSwitch -Name PrivateSwitch -SwitchType Private
```

## Configure management operating system sharing

An external virtual switch allows you to share the selected network adapter with the management operating system. This setting allows the Hyper-V host to use the virtual switch and its configured features, such as Quality of Service (QoS) or security settings [Plan for Hyper-V networking in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/plan-hyper-v-networking-in-windows-server).

To enable this sharing, use the `Set-VMSwitch` cmdlet:

```powershell
Set-VMSwitch -Name ExternalSwitch -AllowManagementOS $true
```

This command modifies the existing switch. If you are configuring this on a remote host, ensure you have the necessary permissions. Note that the connectivity warning associated with binding a physical adapter occurs only during the initial creation of the external switch, not when enabling management OS sharing afterwards.

## Verify the configuration

After creating the switch, you should verify that it exists and is configured correctly. Use the `Get-VMSwitch` cmdlet to list all virtual switches on the host:

```powershell
Get-VMSwitch
```

Check the `SwitchType` column to confirm the switch type. For an external switch, verify that the `NetAdapterName` column shows the correct physical adapter. For internal and private switches, the `NetAdapterName` field is not present in the output, as these switches are not bound to physical adapters.

To further verify connectivity, you can create a test virtual machine and connect it to the switch. However, if you only need to confirm the switch configuration, the `Get-VMSwitch` output is sufficient. For more advanced configurations, such as VLAN identification, you can use the `Set-VMNetworkAdapterVlan` cmdlet to tag traffic or set port modes. This requires additional parameters and should be done carefully to ensure compatibility with your network infrastructure.

## VLAN configuration

You can specify the VLAN identification (ID) used by virtual machines network adapters and virtual switches. For virtual switches connected to either an external or internal network you can specify the (VLAN) ID. The VLAN ID number is used by the management operating system and virtual machines communicating through this virtual switch.

You can also configure your virtual switch with other VLAN options, such port mode and the native VLAN ID. For these options, you'll need to use PowerShell and ensure the configuration is compatible with your networks configuration.

To configure the VLAN identification for the switch, follow these steps.

#### [Hyper-V Manager](#tab/hyper-v-manager)

Here's how to specify the VLAN ID using the Hyper-V Manager.

1. Open Hyper-V Manager.

1. From the **Actions** pane, select **Virtual Switch Manager**.

1. Select the virtual switch you wish to configure, check the
   **Enable virtual LAN identification for management operating system**.

    1. You can enter any VLAN ID number or leave the default, then select **OK**.

       You'll be prompted to warn you that the change may disrupt your network connectivity, select
       **Yes** if you're happy to continue.

VLAN identifiers should be consistent with your network to ensure compatibility between your
computer, virtual machines, and other network devices.

#### [PowerShell](#tab/powershell)

Here's how to set a VLAN identification using the
[Set-VMNetworkAdapterVlan](/powershell/module/hyper-v/set-vmnetworkadaptervlan) command.

1. Run PowerShell on your computer in an elevated session.

1. To set the VLAN ID to tag traffic and set the port mode to access, run the following commands.
   Replace the placeholder `<vmswitch name>` the name of your virtual switch and `<id>` with your
   VLAN ID.

   ```powershell
   Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName <vmswitch name> -Access -VlanId <id>
   ```

   Or

   To set port mode to trunk, the native VLAN ID, and allowed VLAN ID list, run the following
   commands. Replace the placeholder `<vmswitch name>` the name of your virtual switch and `<id>`
   with your VLAN ID. Replace `<allowed ids>` with a list of allowed VLAN IDs, for example,
   `200-210`.

   ```powershell
   $parameters = @{
        ManagementOS = $true
        VMNetworkAdapterName = <vmswitch name>
        Trunk = $true
        NativeVlanId = <id>
        AllowedVlanIdList = <allowed ids>
   }
   Set-VMNetworkAdapterVlan @parameters
   ```

This example above uses splatting to pass parameter values from the `$parameters` variable to the
command. Learn more about
[Splatting](/powershell/module/microsoft.powershell.core/about/about_splatting).

---

## Next step

Now you've created and configured your virtual switch, here are other articles to help you continue
with Hyper-V.

- Learn about [Switch Embedded Teaming (SET)](/azure-stack/hci/concepts/host-network-requirements#switch-embedded-teaming-set).
- Learn how to [create a virtual machine in Hyper-V](Create-a-virtual-machine-in-Hyper-V.md).
- Learn about other configuration options in the
  [Set-VMSwitch](/powershell/module/hyper-v/set-vmswitch) and
  [Set-VMNetworkAdapterVlan](/powershell/module/hyper-v/set-vmnetworkadaptervlan) PowerShell
  reference articles.
