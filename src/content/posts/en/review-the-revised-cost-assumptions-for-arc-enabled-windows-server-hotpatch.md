---
title: "Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch"
description: "Enable Hotpatch on Arc-enabled Windows Server 2025: verify VBS, enroll via Azure Update Manager, and check status."
pubDate: 2026-05-22
category: windows-server
tags: ["azure-arc", "windows-server-2025", "hotpatch", "azure-update-manager", "vbs"]
translationKey: review-the-revised-cost-assumptions-for-arc-enabled-windows-server-hotpatch
draft: false
---

Hotpatch allows you to install Windows Server security updates without requiring a reboot. For Azure Arc-enabled servers running Windows Server 2025, this feature is available at no additional cost as of May 2026, removing previous per-core metering [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). 

Enabling Hotpatch requires a supported operating system, Virtualization Based Security (VBS), and Azure Arc connectivity. You can manage the license and updates through Azure Update Manager or the Azure Arc portal. This article explains how to verify prerequisites, enable the feature, and monitor its status.

## Prerequisites and Operating System Support

Hotpatch is supported on specific editions of Windows Server. You must ensure your machine runs a compatible version before attempting to enable the feature.

*   **Windows Server 2025 Standard Edition**
*   **Windows Server 2025 Datacenter Edition**
*   **Windows Server 2025 Datacenter: Azure Edition**: Hotpatch is enabled by default on this edition. It does not need to be Arc-enabled to use Hotpatch, but the technical prerequisites (VBS, UEFI, Secure Boot) still apply [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

Both **Server with Desktop Experience** and **Server Core** installation options are supported for Windows Server 2025 [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers). 

For Arc-enabled machines, the server must be running Windows Server 2025 (build 26100.1742 or later). Preview versions or Windows Server Insiders builds are not supported because hotpatches are not created for prerelease operating systems [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

## Verify Virtualization Based Security (VBS)

Hotpatch requires Virtualization Based Security (VBS), also known as Virtual Secure Mode (VSM), to be enabled and running. VBS provides the isolated environment necessary for hotpatching. If VBS is not running, enabling Hotpatch will fail [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

You can check the VBS status manually before enabling Hotpatch. Common examples of features that enable VBS include Credential Guard or Hypervisor-protected code integrity (HVCI) [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

To verify VBS is configured and running, use PowerShell or Command Prompt:

**PowerShell:**
```powershell
Get-CimInstance -Namespace 'root/Microsoft/Windows/DeviceGuard' -ClassName 'win32_deviceGuard' | Select-Object -ExpandProperty 'VirtualizationBasedSecurityStatus'
```

**Command Prompt:**
```cmd
for /f "tokens=2 delims==" %a in ('wmic.exe /namespace:\\root\Microsoft\Windows\DeviceGuard path win32_deviceGuard GET VirtualizationBasedSecurityStatus /value ^| find "="') do @echo %a
```

If the output is `2`, VBS is configured and running. You can proceed to enable Hotpatch [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

If the output is not `2`, you need to enable VBS. You can enable VBS using the following PowerShell command:

```powershell
New-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\DeviceGuard' -Name 'EnableVirtualizationBasedSecurity' -PropertyType 'Dword' -Value 1 -Force
```

After enabling VBS, you must restart the server. Once the server is back online, run the verification command again to confirm the output is `2` [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

## Enable Hotpatch on Arc-Enabled Servers

Once the prerequisites are met, you can enable Hotpatch on your Arc-enabled Windows Server 2025 machine. You can do this through Azure Update Manager or directly via the Azure Arc portal.

### Using Azure Update Manager

1.  Sign in to the Azure portal and go to **Azure Update Manager** [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
2.  Under **Resources**, select **Machines** and then select the specific Arc-enabled server [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
3.  Under the **Recommended updates** section, in **Hotpatch**, select **Change** [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
4.  Select the **Receive monthly Hotpatch updates** option [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
5.  Select **Enable Hotpatching** and then select **Confirm** [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).

### Using the Azure Arc Portal

1.  Go to **Azure Arc** → **Machines** in the Azure portal [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).
2.  Select the name of your machine [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).
3.  Select **Hotpatch**, then select **Confirm** [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

Wait about 10 minutes for the changes to apply. If the update status remains stuck on **Pending**, check the Azure Arc agent troubleshooting documentation [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

## Billing Considerations

As of May 19, 2026, Hotpatch on Azure Arc-enabled machines running Windows Server 2025 Standard or Datacenter is available at no additional cost [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). There is no per-core meter, no hourly charge, and no separate Hotpatch line item on your invoice [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).

*   **Existing enrolled servers**: Billing has been stopped for all servers previously enrolled in Hotpatch. No action is required. These machines remain enrolled and continue to receive hotpatch updates when available [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
*   **New enrollments**: Enabling Hotpatch on eligible Windows Server 2025 Arc-enabled machines incurs no Hotpatch charges, regardless of the underlying environment (VMware, Hyper-V, AWS, GCP, or other on-premises and multicloud environments) or edition (Standard or Datacenter) [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).

## View Hotpatch Status

You can verify the Hotpatch status at scale or on a single machine [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).

### At Scale

1.  Go to **Azure Update Manager** → **Machines** [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
2.  Select **Edit columns** [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
3.  In the **Choose columns** pane, select **Hotpatch status** and then select **Save** [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
4.  The **Hotpatch status** column appears in the machines grid. You can filter by **Resource Type** as **Arc-enabled server** to view only Arc-related details [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).

### On a Single VM

1.  Go to **Azure Update Manager** → **Machines** and select the specific Arc-enabled machine [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
2.  Under the **Recommended updates** section, view the **Hotpatch status** for your VM [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).

### Hotpatch Statuses

| Status | Meaning |
|---|---|
| **Not enrolled** | License is available but not enrolled on this machine [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). |
| **Enabled** | License is enrolled and machine is enabled for receiving hotpatch updates [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). |
| **Canceled** | License has been canceled on the machine [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). |
| **Disabled** | License is enrolled but the machine is disabled for receiving hotpatch updates [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). |
| **Pending** | Interim status while enrollment is in progress [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). |

## Known Issues

There are no known issues at this time. All past issues are mitigated [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

However, if you are running Windows Server 2025 and have installed certain October 2025 updates, you may encounter compatibility issues with upcoming Hotpatch updates [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers). Specifically, if you have installed **KB5070881** (OS Build 26100.6905) or any other update not explicitly listed as compatible, your machine will receive regular non-Hotpatch updates until the next baseline month [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers). These updates require a reboot each month [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

To resolve this issue, you can apply a manual workaround using Local or Group Policy or a script [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers). The workaround requires a reboot [Enable Hotpatch for Azure Arc-enabled servers](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers).

## Next Steps

To learn more about Hotpatching on Azure VMs, see [Hotpatch for virtual machines](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines) [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). To learn more about configuring update settings on your machines, see [Configure update settings](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines) [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines). To learn more about how to perform an on-demand update, see [Perform an on-demand update](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines) [Review the revised cost assumptions for Arc-enabled Windows Server Hotpatch](https://learn.microsoft.com/en-us/azure/update-manager/manage-hot-patching-arc-machines).
