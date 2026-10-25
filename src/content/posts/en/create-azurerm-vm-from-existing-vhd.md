---
title: "Create AzureRM VM from existing VHD"
description: "While I was helping a costumer creating a Azure RM virtual machine from an existing VHD, I adapt one of my existing scripts, with some search on internet, to improve my script,…"
pubDate: 2017-07-12
category: compute
tags: ["azure-virtual-machines", "vhd", "azure-powershell"]
translationKey: create-azurerm-vm-from-existing-vhd
legacy: true
legacyUrl: /2017/07/create-azurerm-vm-from-existing-vhd.html
---

While I was helping a costumer creating a Azure RM virtual machine from an existing VHD, I adapt one of my existing scripts, with some search on internet, to improve my script, that I normally used to create Azure RM virtual machines.

In this case, I need to create the VM from an existing VHD on a Storage Account. Usually when you create a new VM, you have to setup the OS type and select the base image.

This script creates a new VM from an image:
```powershell
$osDiskName = $vmname+'_OS_Disk'
$osDiskCaching = 'ReadWrite'
$osDiskVhdUri = "https://<STORAGE_ACCOUNT>.blob.core.windows.net/vhds/"+$vmname+"_os.vhd"

## Setup OS & Image
$user = "MrAzure"
$password = '<PASSWORD>'
$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential ($user, $securePassword)
$vm = Set-AzureRmVMOperatingSystem -VM $vm -Windows -ComputerName $vmname -Credential $cred
$vm = Set-AzureRmVMSourceImage -VM $vm -PublisherName $AzureImage.PublisherName -Offer $AzureImage.Offer -Skus $AzureImage.Skus -Version $AzureImage.Version
$vm = Set-AzureRmVMOSDisk -VM $vm -VhdUri $osDiskVhdUri -name $osDiskName -CreateOption fromImage-Caching $osDiskCaching
```

To use the existing disk, you need to replace the above script and use this one
```powershell
$osDiskName = $vmname+'_OS_Disk'
$osDiskCaching = 'ReadWrite'
$osDiskVhdUri = "https://<STORAGE_ACCOUNT>.blob.core.windows.net/vhds/"+$vmname+"_os.vhd"
$vm = Set-AzureRmVMOSDisk -VM $vm -VhdUri $osDiskVhdUri -name $osDiskName -CreateOption attach -Windows -Caching $osDiskCaching
```
Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
