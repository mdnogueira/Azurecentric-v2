---
title: "Implementing Azure Site Recovery – Part 3 – For VMware Virtual Machines and physical server"
description: "After I post the series of Azure Site Recovery (ASR) Planning considerations, I received an enormous quantity of feedback how It should be implemented, following those…"
pubDate: 2017-06-28
category: backup-dr
tags: ["azure-site-recovery", "vmware"]
translationKey: implementing-azure-site-recovery-part-3-for-vmware-virtual-machines-and-physical-server
legacy: true
legacyUrl: /2017/06/implementing-azure-site-recovery-part-3-for-vmware-virtual-machines-and-physical-server.html
---

After I post the series of Azure Site Recovery (ASR) Planning considerations, I received an enormous quantity of feedback how It should be implemented, following those considerations. So, this is the third post of a series of 4 (see the first post [here](/posts/implementing-azure-site-recovery-part-1-for-hyper-v-virtual-machines) and second [here](/posts/implementing-azure-site-recovery-part-2-for-hyper-v-virtual-machines-in-scvmm-clouds)), about how to implement Azure site recovery based protection on the scenarios describe on the previous series posts.

If you want to visit the series where I talked about the ASR Planning Considerations, you can do it by select the right scenario:
* **[Azure Site Recovery Planning Considerations – Part 1](/posts/azure-site-recovery-planning-considerations-part-1)**
* **[Azure Site Recovery Planning Considerations – Part 2 – For Hyper-V Virtual Machines](/posts/azure-site-recovery-planning-considerations-part-2-for-hyper-v-virtual-machines)**
* **[Azure Site Recovery Planning Considerations – Part 3 – For Hyper-V Virtual Machines in SCVMM clouds](/posts/azure-site-recovery-planning-considerations-part-3-for-hyper-v-virtual-machines-in-scvmm-clouds)**
* **[Azure Site Recovery Planning Considerations – Part 4 – For VMware Virtual Machines and physical server](/posts/azure-site-recovery-planning-considerations-part-4-for-vmware-virtual-machines-and-physical-server)**

In this post, you will step through a sample implementation of Site Recovery with the on-premises primary site and the secondary site that is residing in Azure. Your intention is to protect on-premises VMware virtual machines and physical servers. In this scenario, you are using VMware vCenter to manage your vSphere hosts. Your implementation will consist of the following tasks:
  1. Creating an Azure virtual network in your Azure subscription in the Azure region that meets your disaster recovery objectives.
  2. Creating an Azure storage account in the same subscription and the same region as the Azure virtual network.
  3. Setting up an account on the vSphere host or vCenter server to facilitate automatic discovery of VMware virtual machines.
  4. Preparing the configuration server to allow outbound access to the Azure URLs listed in the previous lesson and installing vSphere PowerCLI 6.0.
  5. Creating a Recovery Services vault in the same subscription and the same region as the storage account and the virtual network.
  6. Specifying the protection goal of your implementation. When using the Azure portal, this is the first task in **Step 1: Prepare Infrastructure** of the **GETTING STARTED Wizard** and involves answering the following two questions:
    1. Where do you want to replicate your machines? Select the **To Azure **option.
    2. Are your machines virtualized? Select the **Yes, with VMware vSphere Hypervisor **option.
  7. Setting up the source environment. This consists of the following steps:
    1. Adding the configuration server entry that is representing your on-premises configuration server.
    2. Downloading the Site Recovery Unified Setup installation file and the Recovery Services vault registration key to the configuration server. Run the installation by using the newly downloaded setup file and, when you receive a prompt, provide the vault registration key. As part of the installation, you will set up an instance of MySQL Server and specify its admin credentials. You will also be able to designate the port TCP 9443 on which the server will send and receive the replication data. You can modify it if needed.
    3. Running **CSPSConfigtool.exe** on the configuration server and adding the account you set up in step 3 that will perform automatic discovery of VMware virtual machines.
    4. Adding the vCenter server and vSphere host entries that are representing your on-premises virtualization environment in the Azure portal.
  8. Setting up the target environment. As part of this step, you must specify the post-failover deployment model. In this walkthrough, you will choose Resource Manager, but Site Recovery also supports the classic deployment model. At this point, you will also have a chance to verify that you can use the virtual network and the storage account that you created earlier to host replicas of protected virtual machines and their disks. You have the option to create the virtual network and the storage account if this is not the case.
  9. Setting up replication settings. This step involves configuring a replication policy and associating it with the configuration server you added in step 7.1. The policy includes settings such as copy frequency, recovery point retention, app-consistent snapshot frequency, and initial replication start time.
  10. Confirming that you have run the Capacity Planner. The wizard will include a drop-down list from which you need to select **Yes, I have done it** in order to successfully complete the **Preparing infrastructure** step.
  11. Selecting the VMware virtual machines and enabling their replication. This consists of the following steps:
    1. Installing the Mobility service on the virtual machines you intend to protect. You can perform the installation by initiating it from the process server, either by using your existing software deployment solution such as System Center Configuration Manager or doing it manually.
    2. Configuring **Step 2: Replicate Applications** of the **GETTING STARTED Wizard** in the **Azure** portal. You must specify the vCenter server or vSphere host you selected in step 7.4. In addition, you must select the process server if you installed it on a computer other than the configuration server. You also must select the Azure virtual network and the storage account you want to use to host replicas of protected virtual machines and their disks. In addition, this step involves selecting the VMware virtual machines that you want to protect. For each virtual machine, you can designate the account that the process server will use to install the Mobility service. You can also select disks that you want to exclude from replication and specify the size of the replica Azure virtual machine. Finally, you also must choose a replication policy that you want to take effect in this case.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
