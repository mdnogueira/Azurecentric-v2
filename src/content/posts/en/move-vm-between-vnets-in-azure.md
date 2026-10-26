---
title: "Move VM between VNETs in Azure"
description: "This week I come into this scenario, I would like to move a virtual machine in azure between different VNETs. You might have different reasons to do it, but what is the best…"
pubDate: 2017-07-20
category: networking
tags: ["azure-virtual-network", "vhd", "arm-templates"]
translationKey: move-vm-between-vnets-in-azure
legacy: true
legacyUrl: /2017/07/move-vm-between-vnets-in-azure.html
---

This week I come into this scenario, I would like to move a virtual machine in azure between different VNETs. You might have different reasons to do it, but what is the best way to do it?

First you have to understand the scenario, is between VNETs on the same region, or between regions? Same subscription or different subscriptions? And at last same tenant or between different tenants?

The way that I look into to this is simple. I know that you have different ways to approach these scenarios, but I want to try to create a solution that no matter what you could use it.

Let’s work on the possibilities. What we know:

* When you create a VM in Azure, you create several resources (compute, network and storage)
* When you delete the VM in Azure, you only delete de compute (assuming that you click on the delete button and you didn’t delete the resource group). That means the VHD and the network adapter (and all their dependencies) will remain intact.

So we could use this “orphan” resources (objects) to create a new VM on the VNET that we want. Genius! 😊

In this case we could use the script that I publish to create the VM with the existing disk (see [here](/posts/create-azurerm-vm-from-existing-vhd)). That is one option.

Although, if you are on the path of using ARM Template with JSON, you might want to double check if your JSON template reflects that as well (see [here](/posts/deploy-a-arm-vm-using-an-existing-vhd-in-azure)).

This is another way to solve your issue of moving a VM between VNETS.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
