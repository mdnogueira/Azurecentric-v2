---
title: "How to monitor and manage Azure Classic Virtual Machines"
description: "On the last post, I talked about why you should use the classic virtual machines. Could be a lot of reasons or could be the way that you already started a few years and all of…"
pubDate: 2017-03-18
category: compute
tags: []
translationKey: how-to-monitor-and-manage-azure-classic-virtual-machines
legacy: true
legacyUrl: /2017/03/how-to-monitor-and-manage-azure-classic-virtual-machines.html
---

On the last post, I talked about [why you should use the classic virtual machines](/posts/azure-classic-virtual-machines-why-use-it). Could be a lot of reasons or could be the way that you already started a few years and all of your deployment process is built on top of the Azure Service Management model. Saying that, now you have to manage and monitor those workloads.

In general, the concepts applicable to managing disks and images of classic virtual machines have not changed significantly with transition to the Azure Resource Manager deployment model. However, there are a few important differences that you must consider:
  * Classic VMs require a classic Azure storage account to host their disks. Similarly, you cannot deploy a classic VM by using an image hosted in an Azure Resource Manager storage account.
  * To identify classic VM images, you need to reference them by the name of the corresponding VHD file. This changed with the Azure Resource Manager model.

Command line management of classic VM disks also differs from managing their Azure Resource Manager counterparts, because they use a different set of Azure PowerShell cmdlets.

Starting with Azure PowerShell 1.0, Azure Resource Manager-cmdlets use the **_-AzureRm_** substring in place of the **_-Azure_** substring present in the Service Management cmdlets. For example, to add a data disk to a classic VM, you would use **_Add-AzureVMDataDisk_**, but to apply the same change to an Azure Resource Manager VM, you would run **_Add-AzureRmVMDataDisk_**.

Monitoring options of classic VMs do not differ significantly from the functionality available to Azure Resource Manager VMs. The same capabilities are exposed in the Azure portal, including metrics, diagnostics, and alerting. The only exception is support for boot diagnostics (providing console output and screenshot support) that depend on Azure Resource Manager.

As far as operating system management is concerned, while both Azure Resource Manager and classic deployment models provide matching features in this area, the implementation details of each are different. This is primarily due to the different set of supporting Windows PowerShell cmdlets and lack of support for template-based deployments for classic VMs. In addition, Service Management-based Azure PowerShell scripts are relatively simpler, allowing you, for example, to leverage default storage account of your Azure subscription for storing Custom Script extension scripts or DSC configuration archives.

It is important to note that, just as with Azure Resource Manager VMs, both Custom Script extension and Desired State Configuration–based management are available for classic VMs running both the Windows and Linux operating systems.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
