---
title: "How to implement Azure Site Recovery"
description: "On the previous posts, I did an overview of the Azure Site Recovery service (see here) and talk about the way that I design a disaster recovery solution with ASR (see here).…"
pubDate: 2017-04-07
category: backup-dr
tags: ["azure-site-recovery", "disaster-recovery"]
translationKey: how-to-implement-azure-site-recovery
legacy: true
legacyUrl: /2017/04/how-to-implement-azure-site-recovery.html
---

On the previous posts, I did an overview of the Azure Site Recovery service ([see here](/posts/azure-site-recovery-2017)) and talk about the way that I design a disaster recovery solution with ASR ([see here](/posts/how-to-build-a-disaster-recovery-solution-with-azure-site-recovery)). For this post, I want to demonstrate how easy is to implement ASR.

Implementing Azure Site Recovery is a relatively involved process. The implementation steps obviously depend on the design, which in turn is determined by the recovery scenario that you chose as the most suitable for your organization’s business continuity needs.

For example, consider the traditional Azure Site Recovery deployment with the primary site running in an on-premises Virtual Machine Manager environment and a secondary site hosted in Azure. In such a case, your implementation would consist of the following tasks:
  1. Creating one or more Azure virtual networks in your Azure subscription in the Azure region that meets your disaster recovery objectives.
  2. Creating an Azure storage account in the same subscription and the same region as the Azure virtual network.
  3. Creating a Recovery Services vault in the same subscription and the same region as the storage account and the virtual network.
  4. Preparing for the mapping of on-premises virtual machine networks to the Azure virtual networks. You need to make sure that all virtual machines that you intend to protect are connected to the virtual networks that you will be mapping to the Azure virtual networks.
  5. Specifying the protection goal of your implementation. When using the Azure portal, this is the first task in **Step 1: Prepare Infrastructure** of the **GETTING STARTED Wizard**. It involves answering the following four questions:
    1. Where do you want to replicate your machines? Select **To Azure**.
    2. Are your machines virtualized? Select **Yes, with Hyper-V**.
    3. Are you using System Center VMM to manage your Hyper-V hosts? Select **Yes**.
    4. Are you managing the recovery site with another System Center VMM? Select **No**.
  6. Setting up the source environment. This consists of the following steps:
    1. Adding a System Center VMM server entry representing your on-premises VMM environment and selecting the VMM cloud that is hosting the virtual machines that you intend to protect.
    2. Downloading the Azure Site Recovery Provider setup file and Recovery Services vault registration key to the VMM server. Run the installation by using the newly downloaded setup file and, when you receive a prompt, provide the vault registration key. You will also receive a prompt to accept or modify a Secure Sockets Layer (SSL) certificate for encryption of disks uploaded to the Recovery Services vault. Finally, you will have the option to enable synchronization of cloud metadata for all VMM clouds. Optionally, you can select individual VMM clouds that you want to be visible in the Azure portal.
    3. Downloading the setup file for the Azure Recovery Services agent and installing it on each Hyper-V host in the VMM cloud that is associated with the virtual machine network you will be mapping to the Azure virtual network.
  7. Setting up the target environment. As part of this step, you must specify the post-failover deployment model. In this walkthrough, you will choose Resource Manager, but Site Recovery also supports the classic deployment model. At this point, you will also have a chance to verify that you can use the virtual network and the storage account you created earlier to host replicas of protected virtual machines and their disks. You have the option to create the virtual network and the storage account if this is not the case. Finally, you must also configure network mapping between virtual machine networks and the Azure virtual network.
  8. Setting up replication settings. This step involves configuring a replication policy and associating it with the VMM cloud you selected in step 6a. The policy includes settings such as copy frequency, recovery point retention, app-consistent snapshot frequency, and initial replication start time.
  9. Confirming that you have run the Capacity Planner. The wizard will include a drop-down list from which you need to select **Yes, I have done it** to successfully complete the **Preparing infrastructure **step.
  10. Selecting the VMM cloud and enabling its replication. This is part of **Step 2: Replicate Applications** in the **GETTING STARTED Wizard**. You will need to specify the VMM cloud that you selected in step 6a. You also will need to select the Azure virtual network and the storage account that you want to use to host replicas of protected virtual machines and their disks. You also have the option to choose the target subnet. In addition, this step involves assigning the name to the target virtual machine and choosing its operating system. Finally, you also must choose a replication policy that you want to take effect in this case.

For full details about each of these steps, refer to [Replicate Hyper-V virtual machines in VMM clouds to Azure using the Azure portal](https://docs.microsoft.com/en-us/azure/site-recovery/site-recovery-vmm-to-azure). Azure online documentation provides detailed guidance regarding other implementation scenarios.

After you configure protection of virtual machines, you should create a recovery plan, which can control the failover sequence by dividing protected virtual machines into groups and by ordering the groups. Virtual machines in the same group fail over in parallel while those in different groups fail over according to their group number. This allows you to account for virtual machine dependencies.

You can use recovery plans to specify the scope of planned, unplanned, and test failovers. Additionally, you can further extend and automate recovery plans by incorporating Windows PowerShell scripts or Azure Automation runbooks.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
