---
title: "New version of Azure Backup Server introduces Modern Backup Storage technology"
description: "WOW! What a day for me! Microsoft Azure just announces new and improved features on the new version Azure Backup Server. Let’s start!"
pubDate: 2017-06-01
category: backup-dr
tags: ["backup", "azure-backup", "vmware"]
translationKey: new-version-of-azure-backup-server-introduces-modern-backup-storage-technology
legacy: true
legacyUrl: /2017/06/new-version-of-azure-backup-server-introduces-modern-backup-storage-technology.html
---

WOW! What a day for me! Microsoft Azure just announces new and improved features on the new version Azure Backup Server. Let’s start!

They announce with Azure Backup Server v2 (MABSv2) you can protect your VMWARE and Windows Server 2016 environment. That is really important feature (in my opinion). Now I don’t need to rely on third party backup software vendors to backup the workloads into Azure, special if the workload is running on ESXi.

Microsoft introduces now thought MABSv2 the Modern Backup Storage technology, based on the features available o Windows Server 2016.

With Windows Server 2016 broth enormous enhancements like ReFS cloning. MABSv2, now leverage these modern technologies, like ReFS cloning and Dynamic VHDX to reduce the overall TCO of backup. MABSv2 also introduces workload infinity technology, that helps to optimize storage utilization.

One of the features that Windows Server 2016 intruded was resilience change checking that improved virtual machine backup resiliency. MABSv2 are now resilient with Resilient Check Technology (RCT) and organizations don’t need to go with painful consistency checks scenarios like virtual machine storage migrations.

MABSv2 can detect and protect VMs that are store on Storage Spaces Direct (S2D), ReFS based cluster seemly without any manual steps. Windows Server 2016 VMs are more secure with shield VM technology and MABSv2 can protect and recovery them securely.

Windows Server 2012 R2 cluster can be upgraded to Windows Server 2016 using rolling cluster upgrade technology without bring down the production environment. MABSv2 will continue to backup the VMs and so there no miss of the SLA while the cluster upgrade is in progress.

You can also auto protect SQL workloads and VMware VMs to cloud using MABSv2. MABSv2, now also comes with the support to protect SQL 2016, SharePoint 2016 and Exchange 2016 workloads as well.

MABSv2 can protect VMware VMs, although the support is in test for MABSv2 running on Windows Server 2016.

MABSv1 deployments can be upgraded to MABSv2 with a few simple steps. MABSv2 will continue to backup data sources without rebooting production servers. So, you don’t need to worry about rebooting production servers or backup interruption with the upgrade to MABSv2.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
