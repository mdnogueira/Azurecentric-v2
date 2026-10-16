---
title: "Virtual Machine Scalability in Azure – Part 1"
description: "You can provide automatic scalability for Azure VMs by using Azure VM scale sets. A VM scale set consists of a group of automatically provisioned Windows or Linux virtual…"
pubDate: 2017-04-03
category: compute
tags: [architecture, powershell, arm-templates, azure-cli]
translationKey: virtual-machine-scalability-in-azure-part-1
legacy: true
legacyUrl: /2017/04/virtual-machine-scalability-in-azure-part-1.html
---

You can provide automatic scalability for Azure VMs by using Azure VM scale sets. A VM scale set consists of a group of automatically provisioned Windows or Linux virtual machines that share identical configuration and deliver the same functionality to support a service or application. With a VM scale set, the number of virtual machines can increase or decrease, adjusting dynamically to changes in demand for its workload. The workload should be stateless to efficiently handle deprovisioning of VMs when scaling in. To implement autoscaling, you should leverage capabilities of the Microsoft.Insights resource provider.

VM scale sets integrate with Azure load balancers to efficiently handle dynamic distribution of network traffic across multiple virtual machines. They also support network address translation (NAT) rules, allowing for connectivity to individual virtual machines in the same scale set. VMs in the same scale set are automatically distributed across five fault domains and five update domains.

From a storage perspective, you can configure VM scale sets with both managed and unmanaged disks. Using managed disks offers additional scalability benefits. In particular, with managed disks, when using an Azure Marketplace image to provision a VM scale set, you can scale out up to 1000 VMs. With unmanaged disks, the upper limit is 100 VMs per scale set.

When using custom images, managed disks allow you to scale out up to 100 VMs. With unmanaged disks, you should limit your deployment to 20 VMs. You can increase this number to 40 if you set the **overprovision** property of the VM scale set to false. This way, you ensure that the aggregate Input/Output Operations Per Second (IOPS) of virtual disks in the VM scale set stays below the 20,000 IOPS limit of a single Standard Azure storage account.

**Note: **VM scale sets are available only when using the Azure Resource Manager deployment model.

This solution differs from the classic VM horizontal scaling approach, which required you to preprovision each VM that you wanted to bring online, to accommodate increased demand.

## **Implementing VM scale sets**

To provision a VM scale set, you can use the Azure portal, Azure PowerShell, Azure Command Line-Interface (Azure CLI), or Azure Resource Manager templates. When using templates, you should reference the **Microsoft.Compute/virtualMachineScaleSets** resource type. This resource type implements a number of properties, including:
  * **tier**. The size of the virtual machines in the VM scale set.
  * **capacity**. The number of virtual machine instances that the scale set will auto-provision.
  * **virtualMachineProfile**. The disk, operating system, and network settings of the virtual machines in the scale set.

To configure Autoscale, reference the **Microsoft.Insights/autoscaleSettings** resource type in an Azure Resource Manager template. Some of the more relevant properties that this resource type implements include: 	
  * **metricName**. The name of the performance metric that determines whether to trigger horizontal scaling (for example, Percentage CPU).
  * **metricResourceUri**. The resource identifier designating the virtual machine scale set to monitor.
  * **timeGrain**. The frequency with which performance metrics are collected (between 1 minute and 12 hours).
  * **Statistic**. The method of calculating aggregate metrics from multiple virtual machines (Average, Minimum, Maximum).
  * **timeWindow**. Range of time for metrics calculation (between 5 minutes and 12 hours).
  * **timeAggregation**. The method of calculating aggregate metrics over time (Average, Minimum, Maximum, Last, Total, Count).
  * **Threshold**. The value that triggers the scale action. For example, if you set it to 50 when using the Percentage CPU metricName, the number of virtual machines in the set would increase when the CPU usage exceeds 50 percent (specifics would depend on other parameters, such as statistics, timeWindow, or timeAggregation).
  * **Operator**. The criterion that determines the method of comparing collected metrics and the threshold (Equals, NotEquals, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual).
  * **Direction**. The type of horizontal scaling invoked as the result of reaching the threshold (increase or decrease, representing, respectively, scaling out or scaling in).
  * **Value**. The number of virtual machines added to or removed from the scale set (one or more).
  * **Cooldown**. The amount of time to wait since the most recent scaling event before the next action occurs (from 1 minute to 1 week).

To understand how Azure scale regarding the virtual machines, I recommend to watch this video from Mark Russinovich about Virtual Machine Scale Sets.

[embed]https://channel9.msdn.com/Blogs/Regular-IT-Guy/Mark-Russinovich-Talks-Azure-Scale-Sets/[/embed]

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
