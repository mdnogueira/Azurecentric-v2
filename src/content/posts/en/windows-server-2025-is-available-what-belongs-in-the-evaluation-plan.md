---
title: "Windows Server 2025 is available: what belongs in the evaluation plan"
description: "Windows Server 2025 evaluation plan: audit upgrade paths, removed features, and new security defaults."
pubDate: 2024-11-05
category: windows-server
tags: ["windows-server-2025", "upgrade-planning", "security", "active-directory", "deprecation"]
translationKey: windows-server-2025-is-available-what-belongs-in-the-evaluation-plan
draft: false
---

Windows Server 2025 is generally available as of 4 November 2024 [Windows Server 2025 is available: what belongs in the evaluation plan](https://www.microsoft.com/en-us/windows-server/blog/2024/11/04/windows-server-2025-now-generally-available-with-advanced-security-improved-performance-and-cloud-agility/). The release brings advanced security, hybrid cloud agility, and performance improvements, alongside the concurrent release of System Center 2025. However, a production-ready evaluation requires more than reviewing new capabilities; it demands a clear audit of what has been removed, what has changed, and how the upgrade path aligns with your current estate.

The first step is to define the scope of the evaluation. Are you testing a clean installation, an in-place upgrade, or a migration? The supported upgrade paths have shifted. Windows Server 2025 allows in-place upgrades from Windows Server 2012 R2 and later [Overview of Windows Server upgrades | Microsoft Docs](https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-overview). This is a significant change from previous releases, which typically allowed upgrades of only two versions at a time. If you are still running Windows Server 2012 (non-R2), an in-place upgrade to 2025 is not supported; you must migrate or perform a clean installation [Overview of Windows Server upgrades | Microsoft Docs](https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-overview).

## Audit for removed and deprecated features

Before planning the evaluation, you must identify components that will no longer function. Windows Server 2025 removes several features entirely and deprecates others. Applications depending on these will break unless you migrate to supported alternatives.

The following features are removed from the installed product image:

*   **IIS 6 Management Console**: Removed after being deprecated in 2019. Migrate to the latest IIS version [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **Wordpad**: Removed. Use Microsoft Word or Windows Notepad [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **SMTP Server**: Removed. Use Exchange Server or a third-party SMTP server [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **Windows PowerShell 2.0 Engine**: Removed. Migrate to PowerShell 5.0 or later [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).

The following features are deprecated and no longer under active development. They may be removed in a future update:

*   **Computer Browser**: Deprecated. This is a dated and insecure protocol [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **Failover Clustering Cluster Sets**: Deprecated [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **L2TP and PPTP in RRAS**: New deployments do not accept these by default. Existing configurations retain their behavior during in-place upgrades, but PPTP and L2TP will be removed in a future release [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **Network Load Balancing (NLB)**: Deprecated. Consider using a Software Load Balancer (SLB) [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **NTLM**: Deprecated. Use Negotiate (Kerberos) instead [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **Remote Mailslots**: Deprecated [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **TLS 1.0 and 1.1**: Disabled by default [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **WebDAV Redirector service**: Deprecated and not installed by default [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **Windows Internal Database (WID)**: Deprecated. Use SQL Server instead [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **WMIC**: Available as a Feature on Demand (FoD). Use PowerShell for WMI instead [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **VBScript**: Available as a FoD. Use PowerShell instead [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
*   **WSUS**: No longer actively developed, but existing capabilities remain available [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).

If your evaluation includes any of these components, you must plan for migration or replacement. For example, if you rely on WMIC, you can add it back as a FoD using `DISM /Add-Capability`, but you should plan to move to PowerShell [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).

## Evaluate new security and identity features

Windows Server 2025 introduces several security enhancements that should be part of your evaluation. Credential Guard is now enabled by default on devices that meet the requirements [What's new in Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/whats-new-windows-server-2025). This is a critical change for environments using virtualisation or sensitive credentials. You must verify hardware compatibility before assuming default enablement will succeed.

Active Directory Domain Services (AD DS) has received significant updates. The 32k database page size is now an optional feature, allowing for larger multi-valued attributes and improved scalability. However, this requires a forest-wide upgrade to the new functional level (Forest Level 10) [What's new in Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/whats-new-windows-server-2025). If you plan to use this feature, you must ensure all Domain Controllers are upgraded to Windows Server 2025 before enabling it [What's new in Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/whats-new-windows-server-2025).

Delegated Managed Service Accounts (dMSA) are introduced to reduce the risk associated with traditional service accounts. dMSAs allow automatic password management and delegated permissions, providing better visibility and logging [Windows Server 2025 is available: what belongs in the evaluation plan](https://www.microsoft.com/en-us/windows-server/blog/2024/11/04/windows-server-2025-now-generally-available-with-advanced-security-improved-performance-and-cloud-agility/). Evaluate whether your applications can migrate to dMSAs to improve security posture.

Windows LAPS (Local Administrator Password Solution) has new features, including automatic account management, image rollback detection, and passphrase support. The rollback detection feature uses a new AD attribute (`msLAPS-CurrentPasswordVersion`) to detect when an image rollback occurs and rotate the password accordingly [What's new in Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/whats-new-windows-server-2025). Ensure you run the latest `Update-LapsADSchema` cmdlet if you plan to use this feature [What's new in Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/whats-new-windows-server-2025).

## Assess hybrid cloud and performance capabilities

Hotpatching is a new feature enabled by Azure Arc. It allows you to apply security updates without rebooting, reducing disruption to operations. Hotpatching is currently in preview as of November 2024 and requires a monthly subscription for Standard or Datacenter editions running on physical machines, VMs, or multicloud servers. It is free for Windows Server Datacenter Azure Edition VMs [Windows Server 2025 is available: what belongs in the evaluation plan](https://www.microsoft.com/en-us/windows-server/blog/2024/11/04/windows-server-2025-now-generally-available-with-advanced-security-improved-performance-and-cloud-agility/). Evaluate whether your workload downtime tolerance justifies the subscription cost during the preview phase.

Performance improvements are significant. Hyper-V supports up to 240 Terabytes of memory and 2048 virtual processors per Generation 2 VM, representing a 10x and 8.5x increase respectively from previous versions [Windows Server 2025 is available: what belongs in the evaluation plan](https://www.microsoft.com/en-us/windows-server/blog/2024/11/04/windows-server-2025-now-generally-available-with-advanced-security-improved-performance-and-cloud-agility/). Storage performance is also improved, with up to 60% more IOPs on identical systems [Windows Server 2025 is available: what belongs in the evaluation plan](https://www.microsoft.com/en-us/windows-server/blog/2024/11/04/windows-server-2025-now-generally-available-with-advanced-security-improved-performance-and-cloud-agility/). If your evaluation includes heavy virtualisation or storage workloads, benchmark these improvements against your current baseline.

## Plan the upgrade path and verification

Once you have audited your estate and defined the scope, plan the upgrade. In-place upgrades are supported from Windows Server 2012 R2 and later [Overview of Windows Server upgrades | Microsoft Docs](https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-overview). However, you must verify that all roles and features are supported for in-place upgrade. Some features may require migration or clean installation [Overview of Windows Server upgrades | Microsoft Docs](https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-overview). In-place upgrades are not supported on any Windows Server configured to boot from VHD, nor on Windows Storage Server Editions [Overview of Windows Server upgrades | Microsoft Docs](https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-overview).

For a concrete example, consider a member server running Windows Server 2019 with File Services and Hyper-V. To evaluate Windows Server 2025:

1.  **Backup**: Ensure full backups are taken.
2.  **Check Compatibility**: Verify that all installed roles are supported for in-place upgrade. Check for any dependencies on removed features like IIS 6 Management Console or SMTP Server [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).
3.  **Upgrade**: Perform the in-place upgrade to Windows Server 2025 [Overview of Windows Server upgrades | Microsoft Docs](https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-overview).
4.  **Verify**: Check that File Services and Hyper-V are functioning correctly. Verify that Credential Guard is enabled if required [What's new in Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/whats-new-windows-server-2025).
5.  **Test**: Test applications and services, especially those using legacy protocols like NTLM or L2TP, which are deprecated or disabled by default [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).

If you encounter issues with removed features, you may need to migrate to supported alternatives or perform a clean installation. For example, if you rely on WMIC, add it back as a FoD or migrate to PowerShell [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).

The evaluation should conclude with a clear decision on whether to proceed with the upgrade, migrate, or replace specific components. Document any deprecated features that require immediate action and plan for their migration.
