---
title: "Performing daily task with PowerShell to manage Hyper-V Server"
description: "As a virtualization administrator, you will come across a lot of scenarios where you will need to create, modify, move, export, and other tasks to manage your virtual machines…"
pubDate: 2013-10-16
category: hyper-v
tags: [powershell]
translationKey: performing-daily-task-with-powershell-to-manage-hyper-v-server
legacy: true
legacyUrl: /2013/10/performing-daily-task-with-powershell-to-manage-hyper-v-server.html
---

As a virtualization administrator, you will come across a lot of scenarios where you will need to create, modify, move, export, and other tasks to manage your virtual machines every day. In some examples, you will need to change a few small and easy settings, which can be done via a graphical interface. However, you will also get cases where lots of virtual machines will need some advanced configuration or some settings that take a long time to complete.

It's a fact that PowerShell is a handy and strong ally in all these examples, and this recipe will show some examples of how to perform daily tasks such as disk, network, memory, export, and virtual machine manipulation using a couple of small and simple PowerShell commandlets.

You can even perform this tasks on several Hyper-V Servers remotely without the need of login on the servers. To know how to do it, visit my previous post **[Managing Hyper-V Server remotely through PowerShell](/posts/managing-hyper-v-server-remotely-through-powershell)**
  **NOTE:** Make sure that you have a PowerShell window opened as administrator before you start.

## How to do it

These tasks show lots of handy examples of daily tasks that can be used to help you administer your Hyper-V servers, such as creating and changing VHDs, virtual switches, VM tasks, migrations, and much more.
1. Let's start with a simple command New-VHD, to create a virtual hard disk for a VM. Type the following command to create a 20GB VHDX file named NewDisk on the H: partition.
```powershell
New-VHD -SizeBytes 20GB –Path H:NewDisk.vhdx
```
2. To add the created VHDX file to a VM, use the command **_Add-VMHardDiskDrive_**, as shown here:
```powershell
Add-VMHardDiskDrive -VMName NewVM -Path H:Hyper-VNewDisk.vhdx
```
3. To create a new virtual switch, you can use the **_New-VMSwitch_** command. The following example creates an external switch and binds it to a network adapter called Ethernet Connection.
```powershell
New-VMSwitch "External Switch" –NetAdapterName "Ethernet Connection" –AllowManagementOS $true
```
4. To add a network adapter to a VM, use the **_Add-VMNetworkAdapter_** command. The next command adds a network adapter named Prod NIC to all the virtual machines that start with Prod.
```powershell
Add-VMNetworkAdapter -VMName Prod* -Name "Prod NIC"
```
5. Use the **_Connect-VMNetworkAdapter _**to add VMs to a virtual switch. The following command gets all the VMs starting with TestVM and adds to a switch called Private Switch.
```powershell
Connect-VMNetworkAdapter -VMName TestVM* -SwitchName 'Private Switch'
```
6. To add a legacy network adapter to a virtual machine, you can also use the **_Add-VMNetworkAdapter_** with the **_IsLegacy_** switch. The following example shows the usage of this command. This gets all the VMs starting with **_NewVM_** and adds a legacy network named BootableNIC.
```powershell
Get-VM NewVM* | Add-VMNetworkAdapter -IsLegacy $true –Name BootableNIC
```
7. You can use the **_Set-VMNetworkAdapter_** to change the virtual machine network adapter settings. The first command below is changing the maximum and minimum bandwidth configuration to all virtual machine starting with VMTest. The second command enables Mac address spoofing to all VMs that end with NLB.
```powershell
Set-VMNetworkAdapter -VMName VMTest* -MaximumBandwidth 100MB -MinimumBandwidthAbsolute 20MB
Set-VMNetworkAdapter -VMName *NLB -MacAddressSpoofing On
```
8. To add Fibre Channel HBAs to virtual machines you can use the **_Add-VMFibreChannelHBA_** as the next example:
```powershell
Add-VMFibreChannelHba -VMName NewVM -SanName VMProd
```
9. You can also use basic tasks such as starting and stopping virtual machines using the **_Start-VM_** and **_Stop-VM_** commands, as shown in the following two examples:
```powershell
Start-VM -Name SPVM
Stop-VM -Name TestVM -TurnOff
```
10. To create virtual machine snapshots you can use the tricky command **_Checkpoint-VM_**. The next example creates a snapshot called PreMigrationSnapshot to all the VMs starting with ProdServer.
```powershell
Checkpoint-VM -Name ProdServer* -SnapshotName PreMigrationSnapshot
```
11. To create a virtual machine from a snapshot you can use the **_Export-VMSnapshot_** command as follows:
```powershell
Export-VMSnapshot -Name 'PosUpdates' -VMName NewVM -Path H:NewVMfromSnapshot
```
12. In the case of a server migration, you can use the **_Export-VM_** command to export VMs to a local folder. The following command shows a handy example of all the virtual machines being exported to a local drive in their own folders.
```powershell
Get-VM | Export-VM -Path H:ExportedVMs
```
13. To move the virtual machine storage, use the **_Move-VMStorage_** command, specifying the destination path that you want to move the VM storage to, as shown in the following example:
```powershell
Move-VMStorage NewVM -DestinationStoragePath H:NewVM
```
14. For moving all the storage from local VMs to a new storage, by creating a folder for each migrated VM, you can use the next example:
```powershell
Get-VM | %{ Move-VMStorage $_.Name "H:Hyper-V$($_.Name)" }
```
15. Use the **_Set-VM_** to change the VM settings. In the next example, all servers starting with VMSharePoint are having their dynamic memory enabled with the minimum, maximum, and startup values being configured. There's also a command which only changes the memory settings, called **_Set-VMMemory_**. The second example does exactly the same thing as the first, just using different commands.
```powershell
Set-VM -Name VMSharePoint* -DynamicMemory -MemoryMinimumBytes 8GB -MemoryMaximumBytes 12GB -MemoryStartupBytes 10GB
Set-VMMemory -VMName VMSharePoint* -DynamicMemoryEnabled $true -MaximumBytes 12GB -MinimumBytes 8GB -StartupBytes 10GB
```

## Summary

From simple tasks, such as starting a VM, to advanced ones, such as moving all virtual machine storage to a new location, it is much easier to use PowerShell rather than the GUI interface. From the 164 Hyper-V commandlets, you have seen examples of the following type (you can find all commandlets [here](http://technet.microsoft.com/library/hh848559.aspx)):
  * **_Add-VMFibreChannelHba_**
  * **_Add-VMHardDiskDrive_**	
  * **_Add-VMNetworkAdapter_**
  * **_New-VMSwitch_**
  * **_Connect-VMNetworkAdapter_**
  * **_New-VHD_**
  * **_Checkpoint-VM_**
  * **_Export-VMSnapshot_**	
  * **_Move-VMStorage_**
  * **_Set-VM_**
  * **_Set-VMMemory_**
  * **_Set-VMNetworkAdapter_**
  * **_Start-VM_**
  * **_Stop-VM_**

These are the normal commands used day-to-day in order to create disks and networks, change VM settings, start VMs, add fibre channels adapters, create snapshots, migrate VMs, and other tasks that can be easily done via PowerShell.

You might encounter other tasks that will require different commands, but with this start, you can have an idea of commands and the things you can do via PowerShell.

## Tips and Tricks

### **Switch ****Whatif**

If you are not sure whether a commandlet will work or what the result will be, you can test it before you run it. The new switch **_Whatif_** added at the end of the command PowerShell can tell you whether it's going to work or not.

The command that uses the **_whatif_** option and when executed, PowerShell explains that it will not work and why. After fixing it, you can try using the **_whatif_** command again. For the **_Export-VM_** command, you will see the What if: Export-VM will export the virtual machine "NewVM1" message.

### Using PowerShell ISE for advanced script editing

For advanced and big scripts, you can use a very interesting tool named PowerShell ISE.

It offers a GUI PowerShell window with colors, line count, command predict, error verification, and a debugging option, making your scripting experience easier and faster.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
