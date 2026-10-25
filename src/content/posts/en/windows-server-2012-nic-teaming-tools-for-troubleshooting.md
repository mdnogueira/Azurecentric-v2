---
title: "Windows Server 2012 NIC Teaming tools for troubleshooting"
description: "NIC Teaming and the powerful administration tools in Windows Server 2012 are very powerful tools that can be misused, misconfigured, and may cause loss of connectivity if the…"
pubDate: 2013-04-19
category: windows-server
tags: ["windows-server", "nic-teaming", "troubleshooting", "hyper-v", "powershell"]
translationKey: windows-server-2012-nic-teaming-tools-for-troubleshooting
legacy: true
legacyUrl: /2013/04/windows-server-2012-nic-teaming-tools-for-troubleshooting-3.html
---

NIC Teaming and the powerful administration tools in Windows Server 2012 are very powerful tools that can be misused, misconfigured, and may cause loss of connectivity if the administrator isn’t careful. Here are some common issues: 

## Using VLANs

VLANs are another powerful tool. There are a few rules for using VLANs that will help to make the combination of VLANs and NIC Teaming a very positive experience.  

1. Anytime you have NIC Teaming enabled, the physical switch ports the host is connected to should be set to trunk (promiscuous) mode. The physical switch should pass all traffic to the host for filtering.  
2. Anytime you have NIC Teaming enabled, you must not set VLAN filters on the NICs using the NICs advanced properties settings. Let the teaming software or the Hyper-V switch (if present) do the filtering. 

### VLANs in a Hyper-V host

1. In a Hyper-V host VLANs should be configured only in the Hyper-V switch, not in the NIC Teaming software. Configuring team interfaces with VLANs can easily lead to VMs that are unable to communicate on the network due to collisions with VLANs assigned in the Hyper-V switch. 

### VLANs in a Hyper-V VM

1. The preferred method of supporting multiple VLANs in a VM is to provide the VM multiple ports on the Hyper-V switch and associate each port with a VLAN. Never team these ports in the VM as it will certainly cause communication problems.  
2. If the VM has multiple SR-IOV VFs make sure they are on the same VLAN before teaming them in the VM. It’s easily possible to configure the different VFs to be on different VLANs and, like in the previous case, it will certainly cause communication problems.  
3. The only safe way to use VLANs with NIC Teaming in a guest is to team Hyper-V ports that are 
    1. Each connected to a different Hyper-V switch, and
    2. Each configured to be associated with the same VLAN (or all associated with untagged traffic only).
    3. If you must have more than one VLAN exposed into a guest OS consider renaming the ports in the guest to indicate what the VLAN is. E.g., if the first port is associated with VLAN 12 and the second port is associated with VLAN 48, rename the interface vEthernet to be vEthernetVLAN12 and the other to be vEthernetVLAN48. (Renaming interfaces is easy using the Windows PowerShell **_Rename-NetAdapter_** cmdlet or by going to the Network Connections panel in the guest and renaming the interfaces. 

## Interactions with other teaming solutions

Some users will want to use other NIC teaming solutions for a variety of reasons. This can be done but there are some risks that the system administrator should be aware of.  

1. If the system administrator attempts to put a NIC into a 3rd party team that is presently part of a Microsoft NIC Teaming team, the system will become unstable and communications may be lost completely.  
2. If the system administrator attempts to put a NIC into a Microsoft NIC Teaming team that is presently part of a 3rd party teaming solution team the system will become unstable and communications may be lost completely.  

As a result it is **STRONGLY RECOMMENDED** that no system administrator ever run two teaming solutions at the same time on the same server. The teaming solutions are unaware of each other’s existence resulting in potentially serious problems.  

In the event that an administrator violates these guidelines and gets into the situation described above the following steps may solve the problem.  

1. Reboot the server. Forcibly power-off the server if necessary to get it to reboot.  
2. When the server has rebooted run this Windows PowerShell cmdlet:  
```powershell
Get-NetLbfoTeam | Remove-NetLbfoTeam
```
3. Use the 3rd party teaming solution’s administration tools and remove all instances of the 3rd party teams.  
4. Reboot the server again.  

Microsoft continues its longstanding policy of not supporting 3rd party teaming solutions. If a user chooses to run a 3rd party teaming solution and then encounters networking problems, the customer should call their teaming solution provider for support. If the issue is reproducible without the 3rd party teaming solution in place, please report the problem to Microsoft. 

## Disabling and Enabling with Windows PowerShell

The most common reason for a team to not be passing traffic is that the team interface is disabled. We’ve seen a number of cases where attempts to use the power of Windows PowerShell have resulted in unintended consequences. For example, the sequence:  
```powershell
Disable-NetAdapter *
Enable-NetAdapter *
```
It does not enable all the netadapters that it disabled. This is because disabling all the underlying physical member NICs will cause the team interface to be removed and no longer show up in **_Get-NetAdapter_**. Thus the **_Enable-NetAdapter *_** will not enable the team NIC since that adapter has been removed. It will however enable the member NICs, which will then cause the team interface to show up. The team interface will still be in a “disabled” state since you have not enabled it. Enabling the team interface will cause traffic to begin to flow again.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
