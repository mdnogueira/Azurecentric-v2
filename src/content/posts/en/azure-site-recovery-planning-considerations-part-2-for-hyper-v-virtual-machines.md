---
title: "Azure Site Recovery Planning Considerations – Part 2 – For Hyper-V Virtual Machines"
description: "On these post series, I want to cover some of the planning considerations that I usually use, when I’m designing/planning with my costumers, an ASR deployment/infrastructure. I…"
pubDate: 2017-06-16
category: backup-dr
tags: ["azure-site-recovery", "hyper-v"]
translationKey: azure-site-recovery-planning-considerations-part-2-for-hyper-v-virtual-machines
legacy: true
legacyUrl: /2017/06/azure-site-recovery-planning-considerations-part-2-for-hyper-v-virtual-machines.html
---

On these post series, I want to cover some of the planning considerations that I usually use, when I’m designing/planning with my costumers, an ASR deployment/infrastructure. I broke down in several posts so I can cover and make easy to find the considerations that you are looking for. In this post, I will cover additional considerations when you need to configure Azure-based protection of Hyper-V virtual machines. The general considerations you can find [here](/posts/azure-site-recovery-planning-considerations-part-1).

When configuring Azure-based protection of Hyper-V virtual machines, the following additional considerations apply:
* Each Hyper-V server that is hosting virtual machines that you want to protect must have outbound connectivity to Azure via TCP port 443. Both the provider and the agent use this port. You must allow access to the following URLs from the Hyper-V servers:
  * *.accesscontrol.windows.net
  * *.backup.windowsazure.com
  * *.hypervrecoverymanager.windowsazure.com
  * *.store.core.windows.net
  * *.blob.core.windows.net
  * [https://www.msftncsi.com/ncsi.txt](https://www.msftncsi.com/ncsi.txt)
* Depending on the outcome of your capacity planning, you might want to adjust the bandwidth that is available to the Hyper-V replication traffic. There are two ways to accomplish this:
  * **Throttle bandwidth to a specific value according to the schedule you define.** You can configure this setting from the Microsoft Azure Backup Microsoft Management Console (MMC) snap-in. In the console, you can display the **Microsoft Azure Backup Properties** dialog box and, in the dialog box, switch to the **Throttling** From there, you can set the maximum bandwidth that is available for backup operations during work and nonwork hours. You have the option of defining what constitutes the start and end of work hours.
  * **Increase or decrease the number of threads that are dedicated to replicating virtual disks on a per-virtual machine basis during failover and failback.** This requires direct modification of entries in the **_HKLM\SOFTWARE\Microsoft\Windows Azure Backup\Replication_** registry key. The **_UploadThreadsPerVM_** entry controls the number of threads dedicated to replicating the disk data. The **_DownloadThreadsPerVM_** entry controls the number of threads when failing back from Azure.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
