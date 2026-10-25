---
title: "Plan an in-place Windows Server upgrade around dependencies"
description: "Plan an in-place Windows Server upgrade by verifying supported paths, isolating dependencies, and executing a controlled feature update."
pubDate: 2025-12-05
category: windows-server
tags: ["windows-server", "in-place-upgrade", "server-management", "operating-system", "migration"]
translationKey: plan-an-in-place-windows-server-upgrade-around-dependencies
draft: false
---

You are planning an in-place upgrade of Windows Server. This is a feature update that moves an older operating system to a newer one while retaining settings, server roles, and data. It is not a migration to new hardware, nor is it a clean installation. The process is straightforward for nonclustered systems, but it requires careful verification of supported upgrade paths and dependency isolation before execution.

The first decision is whether an in-place upgrade is supported for your current version. Microsoft allows nonclustered systems to upgrade up to four versions at a time when targeting Windows Server 2025. This means you can move directly from Windows Server 2012 R2, 2016, 2019, or 2022 to Windows Server 2025. For earlier target versions, the jump is limited to two versions. If your current version is not listed in the supported upgrade matrix, or if you are running a prerelease version, an in-place upgrade is not supported, and you must perform a clean installation or migration.

[![In-Place Upgrade Decision Flow](/images/posts/2025/azc-252-checkpoints.svg)](/images/posts/2025/azc-252-checkpoints.svg)

## Verify the upgrade path and edition constraints

Before downloading media, confirm that your source version can reach your target version. The supported paths are strict. For example, Windows Server 2012 can upgrade to 2012 R2 or 2016. Windows Server 2012 R2 can upgrade to 2016, 2019, 2022, or 2025. Windows Server 2016 can upgrade to 2019, 2022, or 2025. Windows Server 2019 can upgrade to 2022 or 2025. Windows Server 2022 can upgrade to 2025.

Edition conversion is also possible during an in-place upgrade, but with limitations. You can upgrade from Standard to Datacenter or Datacenter: Azure Edition. You cannot upgrade from Datacenter to Standard. If you are running an evaluation version, you must convert it to a retail version before performing the in-place upgrade. You cannot convert a Desktop Experience evaluation to a Core retail version. If you need to change architecture (32-bit to 64-bit) or language, an in-place upgrade is not supported.

## Isolate dependencies and prepare the environment

An in-place upgrade requires a stable environment. The following dependencies must be addressed before starting:

- **Clusters:** In-place upgrades are not supported on clustered systems. If you are running a cluster, you must use Cluster-Aware Updating or a Cluster Operating System Rolling Upgrade instead.
- **Virtual Machines:** Any VMs running on the server must be shut down, quick migrated, or live migrated. You cannot have any VMs running during the feature update.
- **NIC Teaming:** If your server uses Network Interface Card (NIC) Teaming, disable it before the upgrade. You can re-enable it after the upgrade is complete.
- **Backup:** You must have a full backup of the operating system, applications, data, and any VMs. Use Windows Server Backup or a partner solution.
- **Setup Media:** Obtain the installation media for your target version. You can get this from an OEM, retail channel, Visual Studio subscription, or Microsoft 365 admin center.
- **Product Key:** Ensure you have a valid product key and activation method for the target edition.

## Collect diagnostic information

Before starting the upgrade, collect diagnostic information to help with troubleshooting if the update fails. Open an elevated PowerShell prompt and run the following commands to capture system details:

```powershell
Get-ComputerInfo -Property WindowsBuildLabEx,WindowsEditionID | Out-File -FilePath .\computerinfo.txt
systeminfo.exe | Out-File -FilePath systeminfo.txt
ipconfig /all | Out-File -FilePath ipconfig.txt
```

Store these files on a USB flash drive or network location off the computer. If your Windows Server version does not include PowerShell 5.1 or later, you can retrieve the `WindowsBuildLabEx` and `WindowsEditionID` values from the registry at `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion`.

## Execute the in-place upgrade

Once prerequisites are met, begin the upgrade:

1. Open File Explorer and navigate to the Windows Server Setup media. Run `setup.exe`.
2. The setup will automatically download updates. If you prefer to control update downloads, select **Change how Setup downloads updates** and choose the appropriate option.
3. Enter your product key if prompted.
4. Select the edition of Windows Server you want to install.
5. Review and accept the license terms.
6. Select **Keep files, settings, and apps** to perform an in-place upgrade.
7. Review the **Ready to install** screen and select **Install**.

The server will restart several times during the process. Do not interrupt the upgrade.

## Verify the upgrade

After the server restarts, verify the upgrade was successful:

1. Open an elevated PowerShell prompt and run:
   ```powershell
   Get-ComputerInfo -Property WindowsProductName
   ```
   Confirm that the version and edition match the media and values you selected.
2. Check that all applications are running and client connections are successful.
3. Re-enable NIC Teaming if it was disabled.

If the upgrade fails or the server does not function as expected, contact Microsoft Support. The diagnostic files collected earlier will be useful for troubleshooting.

## Key considerations

- **Azure VMs:** This guide applies to non-Azure servers and VMs. For Azure VMs, use the specific in-place upgrade guidance for Windows Server in Azure.
- **Boot from VHD:** In-place upgrades are not supported on systems configured to Boot from VHD.
- **Storage Server:** In-place upgrades from Windows Storage Server Editions are not supported.
- **Configuration Manager:** If you are upgrading a Windows Server 2012 or 2012 R2 server with Configuration Manager, follow the pre-upgrade and post-upgrade instructions for on-premises infrastructure.

An in-place upgrade is a viable path for moving to a newer Windows Server version without replacing hardware or reinstalling applications. However, it requires strict adherence to supported upgrade paths and careful management of dependencies. Always verify the upgrade path, isolate dependencies, and have a backup before proceeding.


References for Plan an in-place Windows Server upgrade around dependencies: [Perform an In-Place Upgrade of Windows Server](https://learn.microsoft.com/en-us/windows-server/get-started/perform-in-place-upgrade), [Overview of Windows Server upgrades | Microsoft Docs](https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-overview), [Upgrade and conversion options for Windows Server](https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-conversion-options).
