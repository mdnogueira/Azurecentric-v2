---
title: "Azure Site Recovery Planning Considerations – Part 4 – For VMware Virtual Machines and physical server"
description: "On these post series, I want to cover some of the planning considerations that I usually use, when I’m designing/planning with my costumers, an ASR deployment/infrastructure. I…"
pubDate: 2017-06-21
category: backup-dr
tags: [azure-site-recovery, architecture, private-cloud, vmware, hybrid]
translationKey: azure-site-recovery-planning-considerations-part-4-for-vmware-virtual-machines-and-physical-server
legacy: true
legacyUrl: /2017/06/azure-site-recovery-planning-considerations-part-4-for-vmware-virtual-machines-and-physical-server.html
---

On these post series, I want to cover some of the planning considerations that I usually use, when I’m designing/planning with my costumers, an ASR deployment/infrastructure. I broke down in several posts so I can cover and make easy to find the considerations that you are looking for. In this post, I will cover additional considerations when you need to configure Azure-based protection of VMware virtual machines and physical servers. The general considerations you can find [here](/posts/azure-site-recovery-planning-considerations-part-1).

When configuring Azure-based protection of VMware virtual machines and physical servers, the following additional considerations apply:
* Use VMware vSphere v5.1, vSphere v 5.5 or vSphere v6.0.
* Microsoft recommends the use of VMware vCenter 5.5 or VMware vCenter 6.0 to manage vSphere hosts.
* If you decide to use an Azure premium storage account to store replicated data, you must designate another storage account to store replication logs.
* To use push installation of the Mobility service on the Windows virtual machine that you intend to protect, ensure that the Windows Firewall allows inbound File and Printer Sharing and Windows Management Instrumentation traffic. For Linux virtual machines, you should enable the Secure File Transfer Protocol subsystem and password authentication in the **sshd_config**
* You have the option of excluding individual disks from replication.
* The computer hosting the configuration server component must have outbound connectivity to Azure via TCP port 443. The computer hosting the process server component should have outbound connectivity to Azure via TCP port 9443. You can use a different port for this purpose if needed. Because both the process server and the configuration server components reside by default on the configuration server, you should make sure that this server can access the following URLs over ports 443 and 9443:
  * *.accesscontrol.windows.net
  * *.backup.windowsazure.com
  * *.hypervrecoverymanager.windowsazure.com
  * *.store.core.windows.net
  * *.blob.core.windows.net
  * [https://www.msftncsi.com/ncsi.txt](https://www.msftncsi.com/ncsi.txt)
* The configuration server should also be able to reach [https://dev.mysql.com/get/archives/mysql-5.5/mysql-5.5.37-win32.msi](https://dev.mysql.com/get/archives/mysql-5.5/mysql-5.5.37-win32.msi) over TCP port 80.
* Depending on the outcome of your capacity planning, you have the option of adjusting the bandwidth available to the replication traffic. In this scenario, the process server handles replication. Therefore, you can configure its Microsoft Azure Backup throttling settings or adjust the number of upload and download threads per virtual machine by modifying its registry. For details regarding this option, refer to the [Azure Site Recovery Planning Considerations – Part 2 – For Hyper-V Virtual Machines](/posts/azure-site-recovery-planning-considerations-part-2-for-hyper-v-virtual-machines).

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
