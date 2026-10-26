---
title: "Automatic Virtual Machine Activation on Windows Server 2012 R2"
description: "Automatic Virtual Machine Activation (AVMA) acts as a proof-of-purchase mechanism, helping to ensure that Windows products are used in accordance with the Product Use Rights…"
pubDate: 2013-07-15
category: hyper-v
tags: ["hyper-v", "windows-server", "avma"]
translationKey: automatic-virtual-machine-activation-on-windows-server-2012-r2
legacy: true
legacyUrl: /2013/07/automatic-virtual-machine-activatin-on-windows-server-2012-r2-2.html
---

Automatic Virtual Machine Activation (AVMA) acts as a proof-of-purchase mechanism, helping to ensure that Windows products are used in accordance with the Product Use Rights and Microsoft Software License Terms.  

AVMA lets you install virtual machines on a properly activated Windows server without having to manage product keys for each individual virtual machine, even in disconnected environments. AVMA binds the virtual machine activation to the licensed virtualization server and activates the virtual machine when it starts up. AVMA also provides real-time reporting on usage and historical data on the license state of the virtual machine. Reporting and tracking data is available on the virtualization server.  

## Practical Applications

On virtualization servers that are activated using Volume Licensing or OEM licensing, AVMA offers several benefits.  

Server datacenter managers can use AVMA to do the following:  
    * Activate virtual machines in remote locations  
    * Activate virtual machines with or without an internet connection  
    * Track virtual machine usage and licenses from the virtualization server, without requiring any access rights on the virtualized systems  

There are no product keys to manage and no stickers on the servers to read. The virtual machine is activated and continues to work even when it is migrated across an array of virtualization servers.  

Service Provider License Agreement (SPLA) partners and other hosting providers do not have to share product keys with tenants or access a tenant’s virtual machine to activate it. Virtual machine activation is transparent to the tenant when AVMA is used. Hosting providers can use the server logs to verify license compliance and to track client usage history.  

## System Requirements

AVMA only requires a virtualization server running Windows Server 2012 R2 Datacenter. The guest virtual machine operating system must be Windows Server 2012 R2 Datacenter, Windows Server 2012 R2 Standard, or Windows Server 2012 R2 Essentials.  

## How to implement AVMA

1. On a Windows Server 2012 R2 Datacenter virtualization server, install and configure the Microsoft Hyper-V Server role.  
2. Create a virtual machine and install a supported server operating system on it.  
3. Install the AVMA key in the virtual machine.  
    1. From an elevated command prompt, run the following command:  
```js
slmgr /ipk <AVMA_key>
```
The virtual machine will automatically activate the license against the virtualization server.  
    **NOTE:** You can also employ the AVMA keys in any unattended setup file.  

## Reporting and Tracking

The registry (KVP) on the virtualization server provides real-time tracking data for the guest operating systems. Because the registry key moves with the virtual machine, you can get license information as well. By default the KVP returns information about the virtual machine, including the following:  
    * Fully qualified domain name  
    * Operating system and service packs installed  
    * Processor architecture  
    * IPv4 an IPv6 network addresses  
    * RDP addresses  

## Logs

Historical data about AVMA requests is available in a log file on the virtualization server (EventID 12310).  

Since the AVMA activation process is transparent, error messages are not displayed. However, the following events are captured in a log file on the virtual machines (EventID 12309).  

<table cellpadding="0" border="0" cellspacing="3" > <tbody > <tr >
<td width="177" >

**Notification**

</td>
<td width="603" >

**Description**

</td></tr> <tr >
<td width="177" >

AVMA Success

</td>
<td width="603" >

The virtual machine was activated.

</td></tr> <tr >
<td width="177" >

Invalid Host

</td>
<td width="603" >

The virtualization server is unresponsive. This can happen when the server is not running a supported version of Windows.

</td></tr> <tr >
<td width="177" >

Invalid Data

</td>
<td width="603" >

This usually results from a failure in communication between the virtualization server and the virtual machine, often caused by corruption, encryption, or data mismatch.

</td></tr> <tr >
<td width="177" >

Activation Denied

</td>
<td width="603" >

The virtualization server could not activate the guest operating system because the AVMA ID did not match.

</td></tr></tbody></table>

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
