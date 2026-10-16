---
title: "Implementing Azure Site Recovery – Part 4 – Managing and Automating"
description: "After I post the series of Azure Site Recovery (ASR) Planning considerations, I received an enormous quantity of feedback how It should be implemented, following those…"
pubDate: 2017-06-30
category: backup-dr
tags: [azure-site-recovery, hybrid]
translationKey: implementing-azure-site-recovery-part-4-managing-and-automating
legacy: true
legacyUrl: /2017/06/implementing-azure-site-recovery-part-4-managing-and-automating.html
---

After I post the series of Azure Site Recovery (ASR) Planning considerations, I received an enormous quantity of feedback how It should be implemented, following those considerations. So, this is the last post of a series of 4 (see the first post [here](/posts/implementing-azure-site-recovery-part-1-for-hyper-v-virtual-machines), second [here](/posts/implementing-azure-site-recovery-part-2-for-hyper-v-virtual-machines-in-scvmm-clouds) and third [here](/posts/implementing-azure-site-recovery-part-3-for-vmware-virtual-machines-and-physical-server)), about how to implement Azure site recovery based protection on the scenarios describe on the previous series posts.

If you want to visit the series where I talked about the ASR Planning Considerations, you can do it by select the right scenario:
* **[Azure Site Recovery Planning Considerations – Part 1](/posts/azure-site-recovery-planning-considerations-part-1)**
* **[Azure Site Recovery Planning Considerations – Part 2 – For Hyper-V Virtual Machines](http://azurecentric.com/2017/06//azure-site-recovery-planning-considerations-part-2-for-hyper-v-virtual-machines/)**
* **[Azure Site Recovery Planning Considerations – Part 3 – For Hyper-V Virtual Machines in SCVMM clouds](/posts/azure-site-recovery-planning-considerations-part-3-for-hyper-v-virtual-machines-in-scvmm-clouds)**
* **[Azure Site Recovery Planning Considerations – Part 4 – For VMware Virtual Machines and physical server](/posts/azure-site-recovery-planning-considerations-part-4-for-vmware-virtual-machines-and-physical-server)**

After an on-premises computer appears in the portal with the **Protected **status, you can perform test failovers, planned failovers, or unplanned failovers. When you do so, the sequence of events differs, depending on the type of failover you choose:
  * In case of a **test failover**, you specify the Azure virtual network you want to fail over to. To prevent any possibility of impacting the production environment, this should be an isolated network. Site Recovery provisions a new Azure virtual machine in the virtual network by using replicas of the virtual disks that are residing in the Azure storage account. The protected virtual machine stays online. After you complete your testing, Site Recovery automatically delete the Azure virtual machine.
  * In case of a **planned failover**, Site Recovery shuts down the protected virtual machine to prevent the possibility of data loss. Next, it provisions the corresponding Azure virtual machine by using replicas of virtual disks residing in the Azure storage account. It also places the new virtual machine in a commit pending state. You must perform the commit action to complete the failover. The commit removes any existing recovery points in Azure storage.
  * In case of an **unplanned failover**, Site Recovery provisions the replica Azure virtual machine by using replicas of virtual disks residing in the Azure storage account. You can instruct Site Recovery to attempt to synchronize protected virtual machines and shut them down, but, in this scenario, such an action might not be possible. Alternatively, you can specify to use the latest recovery point available in Azure storage. Site Recovery will place the newly-provisioned Azure virtual machine in a commit pending state. You must perform the commit action to complete the failover. The commit removes any existing recovery points in Azure storage.
  **Note:** With all three types of failover, if you enabled data encryption when you are running the Azure Site Recovery Provider setup, you must provide the encryption certificate as part of a failover.

When performing planned or unplanned failover, once your primary site is back online, you should protect the Azure virtual machines and establish reverse replication. This will allow you to fail back to the on-premises location without data loss.

## **_Recovery plans_**

While it is possible to perform failover and failback of individual protected computers, it is more beneficial from the standpoint of business continuity to orchestrate disaster recovery of multiple computers. Site Recovery supports this scenario by allowing you to create recovery plans.

A recovery plan consists of one or more recovery groups, which serve as logical containers of protected virtual machines. You arrange groups in a sequence that dictates the order in which Site Recovery failover and failback bring the protected virtual machines online. Within this sequence, you can add **pre **and** post actions**. Each action can represent a manual recovery step or an Azure Automation runbook. By using Azure Automation, you have the option to fully automate your disaster recovery. You can also use it to provision and configure additional Azure components, such as load balancers.

Site Recovery uses a context variable to pass several parameters to the Azure Automation runbook. You can use these parameters to customize runbook activities. These parameters include:
  * **RecoveryPlanName**: Name of the Site Recovery plan.
  * **FailoverType**: Type of failover (test, planned, or unplanned).
  * **FailoverDirection**: Direction of the failover (from the primary site to Azure or from Azure to the primary site).
  * **GroupID**: Identifier of a group within the recovery plan.
  * **VmMap**. Collection of virtual machines within the group.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
