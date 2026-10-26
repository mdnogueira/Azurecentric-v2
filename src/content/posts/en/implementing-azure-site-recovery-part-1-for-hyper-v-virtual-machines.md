---
title: "Implementing Azure Site Recovery – Part 1 – For Hyper-V Virtual Machines"
description: "After the series of Azure Site Recovery (ASR) Planning considerations, I received an enormous quantity of feedback how It should be implemented, following those considerations.…"
pubDate: 2017-06-23
category: backup-dr
tags: ["azure-site-recovery", "hyper-v"]
translationKey: implementing-azure-site-recovery-part-1-for-hyper-v-virtual-machines
legacy: true
legacyUrl: /2017/06/implementing-azure-site-recovery-part-1-for-hyper-v-virtual-machines.html
---

After the series of Azure Site Recovery (ASR) Planning considerations, I received an enormous quantity of feedback how It should be implemented, following those considerations. So, this is the first post of a series of 4 about how to implement Azure site recovery based protection on the scenarios describe on the previous series posts.

If you want to visit the series where I talked about the ASR Planning Considerations, you can do it by select the right scenario:
* **[Azure Site Recovery Planning Considerations – Part 1](/posts/azure-site-recovery-planning-considerations-part-1)**
* **[Azure Site Recovery Planning Considerations – Part 2 – For Hyper-V Virtual Machines](/posts/azure-site-recovery-planning-considerations-part-2-for-hyper-v-virtual-machines)**
* **[Azure Site Recovery Planning Considerations – Part 3 – For Hyper-V Virtual Machines in SCVMM clouds](/posts/azure-site-recovery-planning-considerations-part-3-for-hyper-v-virtual-machines-in-scvmm-clouds)**
* **[Azure Site Recovery Planning Considerations – Part 4 – For VMware Virtual Machines and physical server](/posts/azure-site-recovery-planning-considerations-part-4-for-vmware-virtual-machines-and-physical-server)**

Implementing Site Recovery is a relatively involved process. However, the Azure portal simplifies this process by guiding you through the implementation steps, asking for your design decisions, and providing instructions on how to execute the corresponding actions. The implementation steps reflect the recovery scenario that you have chosen to be the most suitable for your organization’s business continuity needs.

A recovery plan consists of one or more recovery groups, which serve as logical containers of protected virtual machines. You arrange groups in a sequence that dictates the order in which Site Recovery failover and failback bring the protected virtual machines online. Within this sequence, you can add **pre** and **post actions**. Each action can represent a manual recovery step or an Azure Automation runbook. By using Azure Automation, you have the option to fully automate your disaster recovery. You can also use it to provision and configure additional Azure components, such as load balancers.

There is no direct support for specifying Web jobs in the recovery plans. There is no support for VMM library scripts when failing over to Azure.

In this post, you will step through a sample implementation of Site Recovery with the on-premises primary site and the secondary site that is residing in Azure. Your intention is to protect on-premises Hyper-V virtual machines. In this scenario, you are not using System Center Virtual Machine Manager (VMM) to manage your Hyper-V hosts. Your implementation will consist of the following tasks:
1. Creating an Azure virtual network in your Azure subscription in the Azure region that meets your disaster recovery objectives.
2. Creating an Azure storage account in the same subscription and the same region as the Azure virtual network.
3. Creating a Recovery Services vault in the same subscription and the same region as the storage account and the virtual network.
4. Specifying the protection goal of your implementation. When using the Azure portal, this is the first task in **Step 1: Prepare Infrastructure** of the **GETTING STARTED Wizard**. This task involves answering the following three questions:
  1. Where do you want to replicate your machines? Select the **To Azure **option.
  2. Are your machines virtualized? Select the **Yes, with Hyper-V **option.
  3. Are you using System Center VMM to manage your Hyper-V hosts? Select the **No **option.
5. Setting up the source environment. In this case, you must create a Hyper-V site, which serves as a logical container for Hyper-V hosts or clusters of Hyper-V hosts. Once you create a site, you must add one or more Hyper-V hosts to it. Next, download the Azure Site Recovery Provider setup file and Recovery Services vault registration key to the Hyper-V server. Run the installation by using the newly downloaded setup file and, when you receive a prompt, provide the vault registration key.
  **Note:** The Azure Site Recovery Provider setup file installs both the provider and the Recovery Services agent.
6. Setting up the target environment. As part of this step, you must specify the post-failover deployment model. In this walkthrough, you will choose Resource Manager, but Site Recovery also supports the classic deployment model. At this point, you will also have a chance to verify that you can use the virtual network and the storage account you created earlier to host replicas of protected virtual machines and their disks. You have the option to create the virtual network and the storage account if this is not the case.
7. Setting up replication settings. This step involves configuring a replication policy and associating it with the Hyper-V site you created earlier. The policy includes settings such as copy frequency, recovery point retention, app-consistent snapshot frequency, and initial replication start time. 	
8. Confirming that you have run the Capacity Planner. The wizard will include a drop-down list from which you need to select the **Yes, I have done it** option to successfully complete the **Preparing infrastructure** step.
9. Selecting the protected virtual machines and enabling their replication. This is part of **Step 2: Replicate Applications** of the **GETTING STARTED Wizard**. You will need to specify the source Hyper-V site that you defined earlier. You also will need to select the Azure virtual network and the storage account you want to use to host the replica of the protected virtual machine and its disks. You also have the option to choose the target subnet. In addition, this step involves assigning the name to the target virtual machine and choosing its operating system. Finally, you also must choose a replication policy that you want to take effect in this case.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
