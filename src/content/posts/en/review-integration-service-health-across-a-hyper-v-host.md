---
title: "Review integration-service health across a Hyper-V host"
description: "Check Hyper-V integration service health on Windows Server 2025 using PowerShell and the Services snap-in."
pubDate: 2026-07-17
category: hyper-v
tags: ["hyper-v", "integration-services", "windows-server-2025", "powershell", "virtualization"]
translationKey: review-integration-service-health-across-a-hyper-v-host
draft: false
---

A virtual machine reports as "Running" in Hyper-V Manager, but the guest operating system is not communicating correctly with the host. The first thing to check is the health of the integration services. These services bridge the guest and the host, and their status determines whether you can rely on basic diagnostics, backups, and time synchronisation.

On a Windows Server 2025 host, you can verify the health of these services from the host side without logging into the guest. This is useful for a quick health check across multiple VMs. However, host-side status is only half the picture. For a service to function, it must be enabled in the host configuration and running inside the guest operating system.

## Check the host-side status

The most efficient way to review integration service health across a Hyper-V host is to use PowerShell. The `Get-VMIntegrationService` cmdlet returns the current state of each service for a specified virtual machine. This command requires administrative privileges on the Hyper-V host.

To check a single virtual machine, run:

```powershell
Get-VMIntegrationService -VMName "DemoVM"
```

The output provides a clear view of the configuration and status:

```text
VMName      Name                    Enabled PrimaryStatusDescription SecondaryStatusDescription
------      ----                    ------- ------------------------ --------------------------
DemoVM      Guest Service Interface False   OK
DemoVM      Heartbeat               True    OK                       OK
DemoVM      Key-Value Pair Exchange True    OK
DemoVM      Shutdown                True    OK
DemoVM      Time Synchronization    True    OK
DemoVM      VSS                     True    OK
```

The `Enabled` column indicates whether the host has allowed the virtual machine to use the service. The `PrimaryStatusDescription` and `SecondaryStatusDescription` columns provide the current operational status. If a service is enabled but the status description is not "OK", there is a communication issue between the host and the guest.

You can also check the overall health of the virtual machine using `Get-VM`. The `Status` field is determined by the heartbeat service:

```powershell
Get-VM -VMName "DemoVM" | select Name, State, Status
```

A status of "Operating normally" indicates that the heartbeat service is functioning and the guest operating system has booted. A status of "No data received" or "Communication problem" suggests that the heartbeat service is disabled or not responding in the guest.

## Verify the guest-side service state

Enabling a service in the host does not guarantee that the service is running inside the guest. If the service is stopped in the guest, the host-side status will reflect this.

To check the services inside a Windows guest, you can use PowerShell Direct if the guest is running Windows 10 or later and the host is running Windows Server Technical Preview 3 or later. PowerShell Direct allows you to run commands inside the guest without a network connection.

To list the integration services inside the guest, run:

```powershell
Invoke-Command -VMName "DemoVM" -ScriptBlock { Get-Service -Name vmic* | FT -AutoSize }
```

The output will show the status of each service:

```text
Status  Name               DisplayName
------  ----               -----------
Running vmicguestinterface Hyper-V Guest Service Interface
Running vmicheartbeat      Hyper-V Heartbeat Service
Running vmickvpexchange    Hyper-V Data Exchange Service
Running vmicshutdown       Hyper-V Guest Shutdown Service
Running vmictimesync       Time Synchronization Service
Running vmicvss            Hyper-V Volume Shadow Copy Requestor
Stopped vmicvmsession      Hyper-V PowerShell Direct Service
```

If a service is stopped, you can start it using `Start-Service` within the guest session. However, note that if a service is disabled in the host configuration, starting it in the guest will not make it functional. Hyper-V will stop the service again.

## Check the integration services version

Some features may not work correctly if the guest's integration services are not up to date. To check the version of the integration services in a Windows guest, you can query the registry.

Using PowerShell Direct, run:

```powershell
Invoke-Command -VMName "DemoVM" -ScriptBlock { REG QUERY "HKLM\Software\Microsoft\Virtual Machine\Auto" /v IntegrationServicesVersion }
```

This command returns the version of the integration services installed in the guest. If the version is outdated, you may need to update the guest operating system or manually install the latest integration components.

## Enable or disable integration services

You can control whether individual convenience services operate for any given virtual machine. The driver components are not intended to be serviced manually.

To enable or disable a service from the host, use `Enable-VMIntegrationService` and `Disable-VMIntegrationService`.

To enable the Guest Service Interface for a virtual machine named "DemoVM":

```powershell
Enable-VMIntegrationService -VMName "DemoVM" -Name "Guest Service Interface"
```

To disable it:

```powershell
Disable-VMIntegrationService -VMName "DemoVM" -Name "Guest Service Interface"
```

You can also manage these services using Hyper-V Manager. Right-click the virtual machine, select **Settings**, and then select **Integration Services** under **Management**. This pane lists all integration services available on the Hyper-V host and whether the host has enabled the virtual machine to use them.

Note that the Guest Service Interface is disabled by default. If you need to copy files to or from the guest, you can enable this service or use PowerShell Direct with `Copy-Item`.

## Keep integration services up to date

Microsoft recommends keeping integration services up to date to get the best performance and most recent features for your virtual machines. For Windows guests, this happens by default if they are set up to receive important updates from Windows Update. Linux guests using current kernels contain integration services built in, but there may be optional updates available. You will receive the latest integration components when you update the kernel.

For Hyper-V hosts earlier than Windows Server 2016 and Windows 10, you may need to manually install or update the integration services in the guest operating systems. This involves inserting the Integration Services Setup Disk from the Virtual Machine Connection window and running the installer.

To verify the fix, run `Get-VMIntegrationService` again and confirm that the `PrimaryStatusDescription` and `SecondaryStatusDescription` columns show "OK" for the service in question. If the status remains non-OK, check the guest-side service state using PowerShell Direct or the Services snap-in to ensure the service is running.

References for Review integration-service health across a Hyper-V host: [Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/integration-services), [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services), [Enable all integration services in virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/enable-all-integration-services-in-virtual-machines).
