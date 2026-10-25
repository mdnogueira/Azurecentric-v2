---
title: "Prepare a Windows Server 2022 installation for infrastructure workloads"
description: "Prepare a Windows Server 2022 deployment by checking workload support, recording the existing configuration, and planning recovery and acceptance checks."
pubDate: 2024-02-10
category: windows-server
tags: [windows-server-2022, infrastructure, installation, migration]
translationKey: prepare-a-windows-server-2022-installation-for-infrastructure-workloads
draft: false
---

A Windows Server installation is ready for an infrastructure workload when its dependencies, recovery plan and acceptance checks are understood. Getting to the desktop is only one checkpoint. We still need to know whether the application is supported, how clients will reach it and what happens if the change does not work.

Start by separating a clean installation from an in-place upgrade. A clean installation gives you a new operating system to configure and a workload to migrate. An in-place upgrade aims to retain the existing settings, roles and data while changing the operating system. Those routes have different risks and recovery steps; they should not share an unexamined checklist.

[![Windows Server preparation checkpoints](/images/posts/2024/azc-015-checkpoints.svg)](/images/posts/2024/azc-015-checkpoints.svg)

## Define the workload before choosing the route

Record the server's purpose and the applications or infrastructure roles it will host. Include the people or systems that depend on it. A file service, a Hyper-V host and an application server have different storage, connectivity and maintenance requirements.

Use a short preparation record:

| Area | Question to answer before installation |
|---|---|
| Platform | Does the hardware or virtual machine meet the operating system and workload requirements? |
| Software | Does each application vendor support the intended operating system, version and installation option? |
| Licensing | Are the correct media, edition, product key and activation method available? |
| Dependencies | Which identities, DNS records, network paths and storage connections does the workload require? |
| Recovery | What will be restored or switched back if acceptance checks fail? |
| Verification | Which client operation demonstrates that the service works? |

Minimum operating system requirements are an entry condition, not a workload sizing exercise. Keep the application's CPU, memory, storage performance and capacity requirements alongside them.

For an upgrade, review role migration and application compatibility before opening Setup. Microsoft's [in-place upgrade guidance](https://learn.microsoft.com/en-us/windows-server/get-started/perform-in-place-upgrade) also calls out an important exception: do not use an in-place server OS upgrade on a server running Microsoft Entra Connect. Plan an appropriate migration for that service instead.

That guide covers non-Azure servers and virtual machines. An Azure VM needs the Azure-specific upgrade procedure; a generic on-premises runbook should not be applied to it without checking the platform guidance.

## Check changes that affect this server

Read the [Windows Server 2022 removed and deprecated features list](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2022) against the workload inventory. A removed component and a component no longer being developed are different conditions.

For example, the iSNS Server service is removed from Windows Server 2022. That matters if this machine provides discovery for an iSCSI environment. It does not mean Windows Server can no longer connect to an iSNS server or use individually configured iSCSI targets.

For Server Core, update the operating instructions as well. Windows Server 2022 launches SConfig by default at sign-in, and exiting it leads to PowerShell. Ensure the administrator responsible for the workload knows the intended configuration and management route.

Do not turn the feature list into a migration decision on its own. Match each relevant entry to an actual dependency, then document how that dependency will be handled.

## Capture the existing configuration

Before an in-place upgrade or workload migration, preserve enough information to compare the original state with the result. Microsoft's preparation guidance includes these diagnostic commands, run from an elevated Windows PowerShell session:

```powershell
Get-ComputerInfo -Property WindowsBuildLabEx, WindowsEditionID |
    Out-File -FilePath '.\computerinfo.txt'
systeminfo.exe | Out-File -FilePath '.\systeminfo.txt'
ipconfig /all | Out-File -FilePath '.\ipconfig.txt'
```

These are illustrative commands, not captured output from a tested upgrade. `Get-ComputerInfo` requires PowerShell 5.1 or later. Record where the files are written and copy them to a protected location away from the server.

Those files are a diagnostic baseline, not a backup. They also contain system and network details, so keep access appropriate to the environment. Record workload-specific configuration separately: installed applications, service accounts, certificates, storage mappings and the settings needed to rebuild the service.

## Make recovery possible before starting

Back up the operating system, applications and relevant virtual machines, and establish how the required data will be recovered. Identify the person who can make the rollback decision and the acceptance deadline.

For an in-place upgrade of a Hyper-V host, the documented preparation requires running VMs to be shut down or migrated away. Account for their destination capacity and service impact before the maintenance window begins.

For a new server replacing an existing service, define the cutover and return path explicitly. A backup of the old server does not automatically reverse DNS changes, identity changes or writes accepted by the replacement.

## Agree the acceptance checks

After installation or upgrade, verify the intended version and edition, then work through the service checks. Confirm that the application starts, its dependencies are reachable and a client can complete the operation that matters.

Record the result and any exceptions before handing the server over. The installation is complete when the workload meets its acceptance criteria and the operations team has the configuration and recovery information needed to support it.
