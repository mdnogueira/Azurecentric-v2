---
title: "What’s new in System Center 2012 R2 – Virtual Machine Manager?"
description: "During the last TechEd North America, Microsoft wraps off what will be the new System Center 2012 R2. The upgrade follows the impressive number of new features on Windows…"
pubDate: 2013-06-24
category: windows-server
tags: ["windows-server", "system-center", "scvmm"]
translationKey: whats-new-in-system-center-2012-r2-virtual-machine-manager
legacy: true
legacyUrl: /2013/06/whats-new-in-system-center-2012-r2-virtual-machine-manager.html
---

During the last TechEd North America, Microsoft wraps off what will be the new System Center 2012 R2. The upgrade follows the impressive number of new features on Windows Server 2012 R2 as well as improvements to existing capabilities in Windows Server 2012.  

Here are some of the new and improved features related to System Center 2012 R2 – Virtual Machine Manager (SCVMM):  

## Infrastructure improvements
  * Guest and host support for Windows 2012 R2  
  * Auto-task resume after VMM server failover  
  * Expanded scope for update management  
  * Updated management packs:  
    * Better integration with chargeback and reporting  
    * Additional dashboards

## Networking improvements
  * Site-to-site networking  
  * IP Address Management (IPAM) integration  
  * Simplified guest IP management  
  * Top of rack switch integration  
  * Making forwarding extensions for Hyper-V extensible switch work with Hyper-V network virtualization (Cisco 1KV and NVGRE)

## Storage improvements
  * Synthetic fibre channel support  
  * Management of zones  
  * Offloaded Data Transfer (ODX) support  
  * Shared VHDX support  
  * Provision scale-out file server cluster from bare metal  
  * Integration with differencing disks

## Services improvements
  * Run scripts on first machine on a tier  
  * Shared VHDx across members of a tier  
  * Service Setting for Service Topology  
  * Service deployments work for VMs on Xen

## VM and cloud improvements
  * Differencing disks  
  * Live cloning  
  * Online VHDX resize  
  * Grant permissions to users for each cloud  
  * Ability to inject files into VM prior to the first boot

In my opinion one of the biggest news is the recommendation and best practices to have SCVMM on a VM on same virtualization platform that SCVMM is managing. This change a lot in your System Center design and infrastructure if you want to implement a High-Available and resilience System Center environment.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
