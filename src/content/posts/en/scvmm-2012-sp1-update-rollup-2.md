---
title: "Update on System Center 2012 SP1 Update Rollup 2 (UR2) for Virtual Machine Manager"
description: "Yesterday Microsoft added Update Rollup 2 for System Center 2012 SP1 Virtual Machine Manager to System Center 2012 SP1 Update Rollup 2 release."
pubDate: 2013-04-24
category: windows-server
tags: ["system-center", "scvmm", "windows-server"]
translationKey: scvmm-2012-sp1-update-rollup-2
legacy: true
legacyUrl: /2013/04/update-on-system-center-2012-sp1-update-rollup-2-ur2-for-virtual-machine-manager.html
---

Yesterday Microsoft added Update Rollup 2 for System Center 2012 SP1 Virtual Machine Manager to System Center 2012 SP1 Update Rollup 2 release.

The master KB article for System Center 2012 SP1 Update Rollup 2 has been updated to reflect the summary of issues and installation instructions for Update Rollup 2 for System Center 2012 SP1 – VMM. You can refer to it [here](http://support.microsoft.com/kb/2802159).

## **Important actions for Update Rollup 2 for System Center 2012 SP1- Virtual Machine Manager**  

In order to install Update Rollup 2 package for System Center 2012 SP1- Virtual Machine Manager, you will need to uninstall Update Rollup 1 for System Center SP1 - Virtual Machine Manager package from your system.

* If you download Update Rollup 2 package for System Center 2012 SP1 Virtual Machine Manager from Microsoft Update Catalog and install Update Rollup 2 without un-installing Update Rollup 1 you should un-install Update Rollup 2 package for Virtual Machine Manager and then un-install Update Rollup 1 for System Center 2012 SP1 - Virtual Machine Manager via control panel.

* If you are using WSUS to update System Center 2012 SP1 - Virtual Machine Manager and you have already installed Update Rollup 1 for System Center 2012 SP1 – Virtual Machine Manager then you will not receive Update Rollup 2 notification until Update Rollup 1 is uninstalled.  

## **Why is this necessary?**  

When Update Rollup 2 is applied to a system which is running System Center 2012 SP1 Virtual Machine Manager with UR1, the installer does not patch files correctly. This is caused by the way UR 1 was packaged. As such the product fixes in UR1 are correct; it is the packaging of UR1 that causes this issue. If you do not need UR2, then you should continue to operate with UR1. However, if you choose to stay on Update Rollup 1 for System Center 2012 SP1 Virtual Machine Manager and a later Update Rollup is released that you need to implement you will still need to remove Update Rollup 1 first.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
