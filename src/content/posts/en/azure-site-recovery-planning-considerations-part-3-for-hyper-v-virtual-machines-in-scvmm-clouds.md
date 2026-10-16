---
title: "Azure Site Recovery Planning Considerations – Part 3 – For Hyper-V Virtual Machines in SCVMM clouds"
description: "On these post series, I want to cover some of the planning considerations that I usually use, when I’m designing/planning with my costumers, an ASR deployment/infrastructure. I…"
pubDate: 2017-06-19
category: backup-dr
tags: [azure-site-recovery, architecture, hybrid, hyper-v, private-cloud, scvmm]
translationKey: azure-site-recovery-planning-considerations-part-3-for-hyper-v-virtual-machines-in-scvmm-clouds
legacy: true
legacyUrl: /2017/06/azure-site-recovery-planning-considerations-part-3-for-hyper-v-virtual-machines-in-scvmm-clouds.html
---

On these post series, I want to cover some of the planning considerations that I usually use, when I’m designing/planning with my costumers, an ASR deployment/infrastructure. I broke down in several posts so I can cover and make easy to find the considerations that you are looking for. In this post, I will cover additional considerations when you need to configure Azure-based protection of Hyper-V virtual machines based on System Center Virtual Machine Manager (SCVMM) Clouds. The general considerations you can find [here](/posts/azure-site-recovery-planning-considerations-part-1).

When you are configuring Azure-based protection of Hyper-V virtual machines located in VMM clouds, the following additional considerations apply:
* You must create virtual machine networks in your VMM environment. You associate virtual machine networks with VMM logical networks, which, in turn, link to private clouds containing protected virtual machines. Once you create virtual machine networks, you must map them to the corresponding Azure virtual networks. This ensures that, following a failover, the network configuration in Azure matches the one that exists in your on-premises environment. By mapping networks, you ensure that replicas of protected virtual machines, which reside on the same on-premises network, also reside on the same Azure virtual network. You can map multiple virtual machine networks to a single Azure virtual network.
* You have the option to select individual VMM clouds that will appear in the Azure portal. You can choose this option if you want to ensure that the Azure Site Recovery Provider running on the VMM server does not upload all of your cloud metadata to the Recovery Services vault.
* If you want to ensure that Site Recovery attaches a replica of a protected virtual machine to a specific subnet, then name the Azure virtual network subnet the same as the virtual machine network subnet.
* The Azure Site Recovery Provider running on the VMM server must have outbound connectivity to Azure via TCP port 443. The Azure Site Recovery Services agent running on each Hyper-V server that is hosting the virtual machines that you want to protect also must have outbound connectivity to Azure via TCP port 443. You must allow access to the following URLs from the VMM server and Hyper-V servers:
  * *.accesscontrol.windows.net
  * *.backup.windowsazure.com
  * *.hypervrecoverymanager.windowsazure.com
  * *.store.core.windows.net
  * *.blob.core.windows.net
  * [https://www.msftncsi.com/ncsi.txt](https://www.msftncsi.com/ncsi.txt)
* Depending on the outcome of your capacity planning, you have the option of adjusting the bandwidth available to the Hyper-V replication traffic on individual Hyper-V hosts. For details regarding this option, refer to the [Azure Site Recovery Planning Considerations – Part 1](/posts/azure-site-recovery-planning-considerations-part-1) post.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
