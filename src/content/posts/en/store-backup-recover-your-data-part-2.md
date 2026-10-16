---
title: "Store, Backup, Recover your data – Part 2"
description: "This is a continuation of the previous blog post http://azurecentric.com/2017/02/13/store-backup-recover-your-data-part-1/"
pubDate: 2017-02-16
category: backup-dr
tags: [azure-backup, storage, hybrid, storsimple]
translationKey: store-backup-recover-your-data-part-2
cover: ../../../assets/old/posts/2017/02/StorSimple-1.png
coverAlt: "Store, Backup, Recover your data – Part 2"
legacy: true
legacyUrl: /2017/02/store-backup-recover-your-data-part-2.html
---

This is a continuation of the previous blog post [http://azurecentric.com/2017/02/13/store-backup-recover-your-data-part-1/](/posts/store-backup-recover-your-data-part-1)

Azure Blob supports REST APIs so you can use it directly and build tools to integrate, but there are several ways you can use Azure storage to integrate with your on-premises datacenter environment:

![Image1](../../../assets/old/posts/2017/02/StorSimple-1.png)

**StorSimple Cloud-integrated Storage** – StorSimple systems combine the data management functions of primary storage, backup, archive and disaster recovery with seamless Azure integration – enabling a hybrid cloud storage solution through a single system and Azure.

StorSimple systems use Azure as an automated storage tier, offloading capacity management burdens and ongoing capital costs, while providing enterprise-grade local performance for active data sets. Using local and cloud snapshots, application-consistent backups complete in a fraction of the time needed by traditional backup systems while reducing the amount of data transferred and stored in the cloud.

Cloud-based and location-independent disaster recovery (DR) allows organizations to recover their data from virtually any location with an Internet connection, and test their DR plans without impacting production systems and applications. Thin restore from data in the cloud enables users to resume operations after a disaster much faster than possible with physical tape, or cloud-based tape methods used with other cloud providers.

Organizations will benefit from significantly reducing their storage infrastructure sprawl, lowering total storage costs (TCO) by 60-80%, and simplifying data protection while rapidly accelerating data recovery times.

## **Back Up and Restore of SQL Server Databases**

The combination of Azure Storage and Virtual Machines provides a great cost effective solution for backing up and restoring your on-premises SQL Server images. On-premises SQL Server images can be backed up asynchronously to Azure Storage and in the case of an on-premises failure, the azure virtual machine can be quickly utilized to restore the image to reduce end user downtime.

While StorSimple solution I mention earlier is more of an on-premises SAN solution that is integrated with Azure, you can also use Azure directly for backups with Windows Server and System Center DPM.

**Azure Backup** service extends Windows Server Backup, Essentials, or DPM with offsite backup to Azure**. **You can backup server data to be backed up and recovered from the cloud in order to help protect against loss and corruption. Both Windows Server 2012 or Windows Server 2016 and System Center 2016 support this service. Here’s how you can use Windows Server and System Center with Azure Online Backup:

**Windows Server **- Cloud-based backup from Windows Server is enabled by a downloadable agent that installs right alongside the familiar Windows Server backup interface. From this interface backup and recovery of **files and folders **is managed as usual but instead of utilizing local disk storage, the agent communicates with an Azure service which creates the backups in Azure storage.

## **System Center 2016**

With the System Center 2016 release, the Data Protection Manager (DPM) component enables **cloud-based backup of datacenter server data **to Azure storage.  System Center administrators use the downloadable Azure Online Backup agent to leverage their existing protection, recovery and monitoring workflows to seamlessly integrate cloud-based backups alongside their disk/tape based backups. DPM’s short term, local backup continues to offer quicker disk–based point recoveries when business demands it, while the Azure backup provides the peace of mind & reduction in TCO that comes with offsite backups. In addition to files and folders, DPM also enables Virtual Machine backups to be stored in the cloud.

## **Benefits:**

  * Reliable offsite data protection
    * Convenient offsite protection
    * Safe, geo-replicated data
    * Encrypted backups
  * A simple, integrated solution
    * Familiar interface
    * Protection for older servers
    * Azure integration
  * Efficient backup & recovery
    * Efficient use of bandwidth and storage
    * Flexible recovery
    * Flexible configuration

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
