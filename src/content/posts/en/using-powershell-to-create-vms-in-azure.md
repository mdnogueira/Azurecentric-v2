---
title: "Using PowerShell to create VMs in Azure"
description: "There are several methods to deploy virtual machines on Azure. One of my favorite is using PowerShell. Using PowerShell to deploy VMs, gives you the ability to automate the…"
pubDate: 2017-03-01
category: powershell
tags: ["powershell"]
translationKey: using-powershell-to-create-vms-in-azure
legacy: true
legacyUrl: /2017/03/using-powershell-to-create-vms-in-azure.html
---

There are several methods to deploy virtual machines on Azure. One of my favorite is using PowerShell. Using PowerShell to deploy VMs, gives you the ability to automate the process and be more efficient.

Usually I like to create the master PowerShell template where the variables will do all the work. By using this methodology, I found that I can use that PS code over and over, even in occasions that need some additional options (example: add data disks).

To create an Azure Resource Manager virtual machine by using Azure PowerShell, perform the following steps:
  1. Open the Azure PowerShell command prompt.
  2. Sign in to Azure by typing the following cmdlet:
```powerhell
Login-AzureRmAccount
```
  3. Select of Azure subscriptions associated with your account by running the following cmdlet:
```powershell
Get-AzureRmSubscription
```
  4. Set your subscription by typing the following cmdlet, and then pressing Enter:
```powershell
Select-AzureRmSubscription -SubscriptionName "Subscription Name"
```
  5. Use the following code block to create the virtual machine, storage account, and associated network objects. In the code, you must replace the variables with the appropriate values from your environment.

```powershell
#Example values
$StorageAccountName = "STORAGE_NAME"
$StorageType = "Standard_LRS"
$Location = "West US"
$ResourceGroupName = "Resrouce_Group_Name"
$VnetName = "VNET_Name"
$VnetIP = "10.0.0.0/16"
$SubnetName = "Subnet_Name"
$SubnetIP = "10.0.1.0/24"
$PublicIP = ($VMName + "-IPP")
$VMName = "MDNOGAVM01"
$VMSize = "Standard_A1"
$VMNic = "$VMName-Nic"
$OSSku = "2012-R2-Datacenter"

#PowerShell Script**_
New-AzureRmResourceGroup -Name $ResourceGroupName -Location $Location
$storageAcc = New-AzureRmStorageAccount -ResourceGroupName $ResourceGroupName -Name $StorageAccountName -Type $StorageType -Location $Location
$singleSubnet = New-AzureRmVirtualNetworkSubnetConfig -Name $SubnetName -AddressPrefix $SubnetIP
$vnet = New-AzureRmVirtualNetwork -Name $VnetName -ResourceGroupName $ResourceGroupName -Location $Location -AddressPrefix $VnetIP -Subnet $singleSubnet
$pip = New-AzureRmPublicIpAddress -Name $PublicIP -ResourceGroupName $ResourceGroupName -Location $Location -AllocationMethod Dynamic
$nic = New-AzureRmNetworkInterface -Name $VMNic -ResourceGroupName $ResourceGroupName -Location $Location -SubnetId $vnet.Subnets[0].Id -PublicIpAddressId $pip.Id
$cred = Get-Credential -Message "Type the name and password of the local administrator account."
$vm = New-AzureRmVMConfig -VMName $VMName -VMSize $VMSize
$vm = Set-AzureRmVMOperatingSystem -VM $vm -Windows -ComputerName $VMName -Credential $cred -ProvisionVMAgent -EnableAutoUpdate
$vm = Set-AzureRmVMSourceImage -VM $vm -PublisherName MicrosoftWindowsServer -Offer WindowsServer -Skus $OSSku -Version "latest"
$vm = Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id
$osDiskUri = $storageAcc.PrimaryEndpoints.Blob.ToString() + "vhds/$VMName.vhd"
$vm = Set-AzureRmVMOSDisk -VM $vm -Name $VMName -VhdUri $osDiskUri -CreateOption fromImage
New-AzureRmVM -ResourceGroupName $ResourceGroupName -Location $Location -VM $vm
```

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
