---
title: "Installing and running Hyper-V 2012 R2 from a USB stick"
description: "Hyper-V 2012 R2 Server is the free version of Hyper-V and it offers all the components and features that are available in Windows Server 2012 R2 with Hyper-V. It is a Windows…"
pubDate: 2013-10-07
category: hyper-v
tags: [usb]
translationKey: installing-and-running-hyper-v-2012-r2-from-a-usb-stick
legacy: true
legacyUrl: /2013/10/installing-and-running-hyper-v-2012-r2-from-a-usb-stick-2.html
---

Hyper-V 2012 R2 Server is the free version of Hyper-V and it offers all the components and features that are available in Windows Server 2012 R2 with Hyper-V. It is a Windows version containing only the Hyper-V bits and the Windows Failover Cluster, but it has to be installed as any other Windows Server on the local hard disk.

What if you could run Hyper-V 2012 R2 Server from a USB stick, allowing you to take it wherever you go in your pocket, making your Hyper-V 2012 R2 available on any computer through a USB boot? It will come in very handy when you need a Hyper-V ready for a test environment or even just to run your virtual machines and bring all of them with you on a USB stick.

### **How it works?**

Almost the whole process to create the USB stick with Hyper-V 2012 R2 is done via commands.
    1. The first thing was to create a new VHDX file and enable it to receive the Hyper-V 2012 R2 image by creating a primary partition and formatting it using NTFS.
    2. Then, by using the DISM tool, you actually apply the Hyper-V 2012 R2 Server image that is in the Install.wim file to the VHDX file mounted on the R drive.
    3. After that, the USB flash drive was prepared and formatted via Diskpart. The VHDX file containing the Hyper-V 2012 R2 image was copied onto it and it was configured with the boot configuration using the BCDBoot tool.
    4. The last commands removed the paging file to improve the USB stick performance.
    5. That's it. In the first USB boot, you will have to finish the Hyper-V 2012 R2 Server installation process.

I use this option for all my sessions when I want to demonstrate the features and how powerful is Hyper-V 2012 R2. My daily desktop is Windows 8.1 Enterprise (with hyper-V enable). It’s not recommend to have this installation on any other server that you may use for production environment or even for any other environment that will request sensitive data (like Testing).

### **Requirements**

To run Hyper-V 2012 R2 from the USB stick, you need at least an 8 GB flash drive. The computer which is to run the Hyper-V needs to support boot from USB and the Hyper-V pre-requisites. In this casa I use a 24 GB USB 3.0 stick.

To create the USB stick with Hyper-V on it, you need to download and install the Windows Automated Installation Kit (WAIK) for Windows 8.1 or a newer version, on the computer that will be used to perform this recipe. The WAIK for Windows 8.1 can be downloaded from the following link:

[http://www.microsoft.com/en-ca/download/details.aspx?id=39306](http://www.microsoft.com/en-ca/download/details.aspx?id=39306)

You will also need to install .NET Framework 4.5 and download Microsoft Hyper-V Server 2012 R2 from the Microsoft website. Open the Hyper-V Server image file that you downloaded, navigate to the Sources folder, and copy the **_Install.wim_** file to a local folder on your computer.

### **How to install Hyper-V 2012 R2 Server on USB Stick**

The following steps will show how to prepare a USB flash drive to create a bootable version of Microsoft Hyper-V 2012 R2 Server.
    1. Open the command prompt as an administrator to create the VHDX file that will be used to add the Hyper-V image on the USB stick.
    2. Run the following commands to create a folder named **HYPVBOOT** and the VHDX file named **HYPV2012R2****.VHDX** with 6 GB capacity. The command will also attach the VHDX as the local letter R.
```js
mkdir c:hypvboot
diskpart
create vdisk file=c:hypvbootHYPV2012R2.vhdx maximum=6000 type=fixed
select vdisk file=c:hypvboot HYPV2012R2.vhdx
attach vdisk
create partition primary
assign letter=r
format quick fs=ntfs label=HYPV2012R2
exit
```
3. After creating the VHDX file, you can apply the Hyper-V 2012 R2 Server image using the **_INSTALL.WIM_** file. From the following command change _<architecture>_ to AMD64 or IA64, based on the architecture you want to create and then boot your USB stick. Change _<path to wim > _to the **_INSTALL.WIM_** file path.
```js
cd /d "c:Program Files (x86)Windows Kits8.1Assessment and Deployment KitDeployment Tools<architecture>DISM"
dism.exe /apply-image /Imagefile: <path to wim> /Index:1 /ApplyDir:R:
```
4. Using the diskpart tool you have to detach the virtual disk from your computer using the following command lines:
```js
diskpart
select vdisk file=c:hvpvbootHYPV2012R2.vhdx
detach vdisk
exit
```
5. Now you can attach the USB stick you want to use to be formatted and to receive the VHD file created in the previous steps.
6. Use the diskpart tool again to identify the USB stick disk number.
```js
diskpart
list disk
```
7. Use the following commands to create and format a new partition and assign the letter Z to the USB stick. Replace _<USB Stick number>_ with the number identified in the previous task.
```js
select disk <USB stick number>
clean
create partition primary
select partition 1
active
format quick fs=ntfs
assign letter=v
exit
```
8. Copy the VHDX file created in _step 2 _to the V: drive where the USB stick is attached.
9. Use the Bootsect tool to update the master boot code. From the following command, change _<architecture> _to AMD64 or IA64, based on the architecture that you want to create. Boot your USB stick.
```js
cd /d " c:Program Files (x86)Windows Kits8.1Assessment and Deployment KitDeployment Tools<architecture>BCDBoot"
bootsect /nt60 v: /force /mbr
```
10. Use the diskpart tool again to attach the VHDX file to the Z drive.
```js
diskpart
select vdisk file=v:HYPV2012R2.vhdx
attach vdisk
exit
```
11. Use the BCDBoot tool to copy the necessary boot files so that you can boot your USB stick.
```js
bcdboot r:windows /s v:
```
12. As you are installing Hyper-V Server on a USB flash drive rather than a normal hard drive, you have to disable the paging file. Use the following command to load the registry from the VHDX file:
```js
reg load HKLMHyperVTemp r:windowssystem32configsystem
```
13. Remove the page file value from the registry with the following command:
```js
reg add "HKLMHyperVTempControlSet001ControlSession ManagerMemory Management" /v PagingFiles /t REG_MULTI_SZ /d "" /f
```
14. Delete the page file entry with the following command:
```js
reg delete "HKLMHyperVTempControlSet001ControlSession ManagerMemory Management" /v ExistingPageFiles /f
```
15. Unload the temporary registry with the following command line:
```js
reg unload HKLMHyperVTemp
```
16. Type the following commands to detach the VHD file from the Z drive:
```js
diskpart
select vdisk file=z:HYPV2012R2.vhdx
detach vdisk
exit
```
17. Now you can remove the USB stick from your computer and attach it onto another computer to boot Hyper-V 2012 R2 Server.
    **NOTE:** You may need to change the boot order or the boot configuration from your computer BIOS to allow it to boot from USB.
18. At the first bootup, your bootable Hyper-V will be loaded and the system will prompt you to add the new administrator password. Type the new password twice and click on **OK**.
19. After the first login, Hyper-V will load the **_SConfig_** tool, allowing you to change the most common settings using a friendly command-line interface.
20. Now you can set up your Hyper-V Server and enable remote administration to manage it, using Hyper-V Manager from another computer.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
