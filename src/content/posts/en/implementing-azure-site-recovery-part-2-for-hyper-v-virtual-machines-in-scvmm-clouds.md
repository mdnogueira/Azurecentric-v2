---
title: "Implementing Azure Site Recovery – Part 2 – For Hyper-V Virtual Machines in SCVMM Clouds"
description: "After I post the series of Azure Site Recovery (ASR) Planning considerations, I received an enormous quantity of feedback how It should be implemented, following those…"
pubDate: 2017-06-26
category: backup-dr
tags: ["azure-site-recovery", "hyper-v", "scvmm", "system-center"]
translationKey: implementing-azure-site-recovery-part-2-for-hyper-v-virtual-machines-in-scvmm-clouds
legacy: true
legacyUrl: /2017/06/implementing-azure-site-recovery-part-2-for-hyper-v-virtual-machines-in-scvmm-clouds.html
---

After I post the series of Azure Site Recovery (ASR) Planning considerations, I received an enormous quantity of feedback how It should be implemented, following those considerations. So, this is the second post of a series of 4 (see the first post [here](/posts/implementing-azure-site-recovery-part-1-for-hyper-v-virtual-machines)), about how to implement Azure site recovery based protection on the scenarios describe on the previous series posts.

If you want to visit the series where I talked about the ASR Planning Considerations, you can do it by select the right scenario:
* **[Azure Site Recovery Planning Considerations – Part 1](/posts/azure-site-recovery-planning-considerations-part-1)**
* **[Azure Site Recovery Planning Considerations – Part 2 – For Hyper-V Virtual Machines](/posts/azure-site-recovery-planning-considerations-part-2-for-hyper-v-virtual-machines)**
* **[Azure Site Recovery Planning Considerations – Part 3 – For Hyper-V Virtual Machines in SCVMM clouds](/posts/azure-site-recovery-planning-considerations-part-3-for-hyper-v-virtual-machines-in-scvmm-clouds)**
* **[Azure Site Recovery Planning Considerations – Part 4 – For VMware Virtual Machines and physical server](/posts/azure-site-recovery-planning-considerations-part-4-for-vmware-virtual-machines-and-physical-server)**

In this post, you will step through a sample implementation of Site Recovery with the on-premises primary site and the secondary site that is residing in Azure. Your intention is to protect on-premises Hyper-V virtual machines. In this scenario, you are using System Center Virtual Machine Manager to manage your Hyper-V hosts. Your implementation will consist of the following tasks:
  1. Creating one or more Azure virtual networks in your Azure subscription in the Azure region that meets your disaster recovery objectives.
  2. Creating an Azure storage account in the same subscription and the same region as the Azure virtual network.
  3. Creating a Recovery Services vault in the same subscription and the same region as the storage account and the virtual network.
  4. Preparing for the mapping of on-premises virtual machine networks to the Azure virtual networks. You need to make sure that all virtual machines you intend to protect are connected to the virtual machine networks you will be mapping to the Azure virtual networks.
  5. Specifying the protection goal of your implementation. When using the Azure portal, this is the first task in **Step 1: Prepare Infrastructure** of the **GETTING STARTED Wizard** and involves answering the following four questions:
    1. Where do you want to replicate your machines? Select the **To Azure **option.
    2. Are your machines virtualized? Select the **Yes, with Hyper-V** option.
    3. Are you using System Center VMM to manage your Hyper-V hosts? Select the **Yes** option.
    4. Are you managing the recovery site with another System Center VMM? Select the **No** option.
  6. Setting up the source environment. This consists of the following steps:
    1. Adding a System Center VMM server entry representing your on-premises VMM environment and selecting the VMM cloud that is hosting the virtual machines that you intend to protect.
    2. Downloading the Azure Site Recovery Provider setup file and Recovery Services vault registration key to the VMM server. Run the installation using the newly downloaded setup file and, when you receive a prompt, provide the vault registration key. You will also receive a prompt to accept or modify an SSL certificate for encryption of disks uploaded to the Recovery Services vault. Finally, you will have the option to enable synchronization of cloud metadata for all VMM clouds. Optionally, you can select individual VMM clouds that you want to be visible in the Azure portal.
    3. Downloading the setup file for the Azure Recovery Services agent and installing it on each Hyper-V host in the VMM cloud that is associated with the virtual machine network you will be mapping to the Azure virtual network.
  7. Setting up the target environment. As part of this step, you must specify the post-failover deployment model. In this walkthrough, you will choose Resource Manager, but Site Recovery also supports the classic deployment model. At this point, you will also have a chance to verify that you can use the virtual network and the storage account you created earlier to host replicas of protected virtual machines and their disks. You have the option to create the virtual network and the storage account if this is not the case. Finally, you must also configure network mapping between virtual machine networks and the Azure virtual network.
  8. Setting up replication settings. This step involves configuring a replication policy and associating it with the VMM cloud you selected in step 6.1. The policy includes settings such as copy frequency, recovery point retention, app-consistent snapshot frequency, and initial replication start time.
  9. Confirming that you have run the Capacity Planner. The wizard will include a drop-down list from which you need to select **Yes, I have done it** in order to successfully complete the **Preparing infrastructure **step.
  10. Selecting the VMM cloud and enabling its replication. This is part of **Step 2: Replicate Applications** in the **GETTING STARTED Wizard**. You will need to specify the VMM cloud you selected in step 6.1. You also will need to select the Azure virtual network and the storage account you want to use to host replicas of protected virtual machines and their disks. You also have the option to choose the target subnet. In addition, this step involves assigning the name to the target virtual machine and choosing its operating system. Finally, you also have to choose a replication policy that you want to take effect in this case.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
