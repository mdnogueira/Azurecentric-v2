---
title: "Classic Virtual Machines in Azure Resource Manager"
description: "You can create still classic virtual machines from the Azure portal or by using Azure PowerShell. Although, Microsoft doesn’t recommend because it’s an old platform that they…"
pubDate: 2016-09-22
category: compute
tags: ["azure-virtual-machines", "azure-resource-manager", "powershell", "azure-powershell"]
translationKey: classic-virtual-machines-in-azure-resource-manager
legacy: true
legacyUrl: /2016/09/classic-virtual-machines-in-azure-resource-manager.html
---

You can create still classic virtual machines from the Azure portal or by using Azure PowerShell. Although, Microsoft doesn’t recommend because it’s an old platform that they want to move away from it.

## **Deploying classic virtual machines by using the Azure portal**

To create an Azure Resource Manager virtual machine from the Azure portal, perform the following steps:
  1. Sign in to the Azure portal at [portal.azure.com](https://portal.azure.com).
  2. On the **Hub** menu, click **New**, click **Compute**, and then click **Windows Server 2012 R2 Datacenter**.
  3. On the **Windows Server 2012 R2 Datacenter** page, under **Select a deployment model**, select **Classic**, and then click **Create**.
  4. On the **Basics** blade, enter the name that you want to give your virtual machine. The name cannot contain special characters.
  5. Enter the Windows administrative user name and password. The password must be between eight and 123 characters long, and include at least three of the following: one lower-case character, one upper-case character, one number, and one special character. You will need the user name and password to sign in to the virtual machine.
  6. If you have more than one subscription, specify the one for the new virtual machine, a new or existing resource group, and an Azure datacenter location.
  7. On the **Choose a size** blade, select an appropriate virtual-machine size for your needs. Each size specifies the number of compute cores, memory, and other features, such as support for Premium Storage. These all affect the price. Azure recommends certain sizes automatically, depending on the image that you choose. The choices available on this blade depend on whether you selected **HDD **or** SSD **on the **Basics **blade.
  8. On the **Settings** blade, configure storage, networking, extensions, high availability, and monitoring settings for the new virtual machine. The networking settings include the **Cloud service (domain name) **and **Endpoints **entries.
  9. Click **Summary** to review your configuration choices. When you finish reviewing or updating the settings, click **Create**. As Azure creates the virtual machine, you can track the progress under **Virtual Machines** on the **Hub** menu.

These steps use the image based on Windows Server 2012 R2 Datacenter Edition to create a virtual machine.

## **Deploying classic virtual machines by using Azure PowerShell**

You also can use the Azure PowerShell interface to create classic virtual machines by using Windows PowerShell cmdlets.

You can define a virtual-machine configuration, and then create the virtual machine, as the following sample code shows:
```powershell
$newVM = New-AzureVMConfig  -name $vmname -Instance $instance -ImageName $osimage | Add-AzureProvisioningConfig -Windows -AdminUsername $adminname -Password $password | Set-AzureSubnet -SubnetNames $subnet
New-AzureVM -ServiceName $cloudservice -AffinityGroup $affinitygroup -VMs $newVM -VNetName $vnet -DnsSettings $dns -WaitForBoot
```
Alternatively, you can create and configure a virtual machine in one step, as the following code sample shows:
```powershell
New-AzureQuickVM -Windows -ImageName $osimage -Location $location -Name $vmname –ServiceName $svcName -InstanceSize $size -AdminUserName $adminname –Password $password
```

There are more configuration options if you use the **_New-AzureVMConfig_** and **_New-AzureVM_** cmdlets, such as the ability to use a static internal IP address by using **_Set-AzureStaticVNetIP_**. **_New-AzureVMConfig_** enables you to create more complex virtual-machine configurations, and then pass those configurations to **_New-AzureVM_**.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
