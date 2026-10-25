---
title: "Plan Arc-enabled Windows Server 2025 Hotpatch with its baseline reboots"
description: "Plan Windows Server 2025 Hotpatch for Arc-enabled servers: baseline reboots, VSM prerequisites, and subscription management."
pubDate: 2025-07-10
category: windows-server
tags: ["windows-server-2025", "hotpatch", "azure-arc", "virtual-secure-mode", "patch-management"]
translationKey: plan-arc-enabled-windows-server-2025-hotpatch-with-its-baseline-reboots
draft: false
---

Hotpatching for Windows Server 2025 allows you to install security updates without restarting the operating system, but it does not eliminate the need for reboots entirely. When planning this feature for Azure Arc-enabled servers, you must account for the quarterly baseline updates that require a restart, the Virtual Secure Mode (VSM) prerequisites, and the subscription billing cycle.

Windows Server 2025 Hotpatch is generally available as a subscription service. It allows you to install security patches in-memory without restarting the operating system, processes, or applications. However, the service operates on a three-month cycle. The first month of each quarter is a baseline month where you receive a standard Latest Cumulative Update (LCU) that includes non-security fixes, drivers, and other updates. This baseline update requires a reboot. The subsequent two months in the cycle provide Hotpatches that do not require a restart.

[![Windows Server 2025 Hotpatch Cycle and Prerequisites](/images/posts/2025/azc-199-checkpoints.svg)](/images/posts/2025/azc-199-checkpoints.svg)

## Understand the reboot schedule

The Hotpatch service provides up to eight Hotpatches per year, but it also mandates four planned baseline reboots. The baseline months are January, April, July, and October. During these months, you must plan for a restart to install the cumulative update that refreshes the baseline.

There are also unplanned baselines. If Microsoft releases a critical security update that cannot be delivered as a Hotpatch, it will be released as an unplanned baseline. This replaces the Hotpatch for that month and also requires a reboot. You cannot predict these in advance, but they are rare.

The subscription is billed monthly at $1.50 USD per CPU core per month, regardless of whether the month is a Hotpatch month or a baseline month. This means the cost is consistent throughout the year, even though the update type and reboot requirement change.

## Verify Virtual Secure Mode prerequisites

Hotpatching relies on Virtual Secure Mode (VSM), also known as Virtualization-based Security (VBS). The machine must have VSM configured and running before you can enable Hotpatch. If VSM is not active, the Hotpatch enablement will fail.

VSM might already be enabled if you have previously configured features such as Credential Guard, Hypervisor-protected Code Integrity (HVCI), or Secured-core server settings. You can verify the status of VSM using PowerShell or Command Prompt.

To check VSM status, run the following PowerShell command:

```powershell
Get-CimInstance -Namespace 'root/Microsoft/Windows/DeviceGuard' -ClassName 'win32_deviceGuard' | Select-Object -ExpandProperty 'VirtualizationBasedSecurityStatus'
```

If the output is `2`, VSM is configured and running. You can proceed to enable Hotpatch. If the output is not `2`, you need to enable VSM. You can do this by setting the registry key `EnableVirtualizationBasedSecurity` to `1` under `HKLM:\System\CurrentControlSet\Control\DeviceGuard`.

After enabling VSM, you must restart the server. Once the server is back online, verify that VSM is running by running the PowerShell command again. The output should now be `2`. If it is not, check your hardware or virtualization platform requirements, such as ensuring you are using a Generation 2 virtual machine with Secure Boot enabled.

## Enable Hotpatch on Azure Arc-enabled servers

To use Hotpatch on Azure Arc-enabled servers, you must be running a released version of Windows Server 2025 (build 26100.1742 or later). Preview versions are not supported. The server must be connected to Azure Arc, and you must subscribe to the Hotpatch service.

If you were previously in the preview program, you may need to disenroll before subscribing to the paid service. Otherwise, the subscription starts automatically in July 2025.

To enable Hotpatch:

1. Connect the machine to Azure Arc if it is not already connected.
2. Sign in to the Azure portal and navigate to **Azure Arc** → **Machines**.
3. Select the name of your machine.
4. Select **Hotpatch** from the settings menu.
5. Confirm the action.

Wait approximately 10 minutes for the changes to apply. If the status remains stuck on _Pending_, refer to the Azure Arc agent troubleshooting documentation.

## Manage updates and orchestration

Once Hotpatch is enabled, you can manage updates using Azure Update Manager, Group Policy, or SCONFIG for Server Core. Azure Update Manager is an optional tool that can automate the installation of Hotpatches.

Hotpatch updates do not support automatic rollback. If you experience issues after a Hotpatch, you must uninstall the latest update and reinstall the last functional baseline update, which requires a reboot.

You can view the patch status for your Arc-enabled server in the Azure portal under the **Updates** section. This shows the Hotpatch status and any available patches. Remember that non-security updates, .NET updates, and drivers are not included in Hotpatch and will require a reboot when installed.

## Verify the configuration

After enabling Hotpatch, verify that the server is receiving updates correctly. Check the **Update history** in the Azure portal to confirm that Hotpatches are being installed without reboots during Hotpatch months. During baseline months, ensure that the cumulative update is installed and that the server is rebooted as required.

If you encounter issues with VSM or Hotpatch enablement, review the hardware and virtualization requirements. Ensure that Secure Boot is enabled and that the virtualization platform supports VSM. For virtual machines, Generation 2 is required.

By planning for the quarterly baseline reboots and ensuring VSM is correctly configured, you can leverage Hotpatch to reduce downtime while maintaining security compliance. The subscription cost is predictable, but the reboot schedule must be integrated into your maintenance windows.

References for Plan Arc-enabled Windows Server 2025 Hotpatch with its baseline reboots: [Plan Arc-enabled Windows Server 2025 Hotpatch with its baseline reboots](https://www.microsoft.com/en-us/windows-server/blog/2025/04/24/tired-of-all-the-restarts-get-hotpatching-for-windows-server/), [Enable Hotpatch for Azure Arc-enabled servers (preview)](https://learn.microsoft.com/en-us/windows-server/get-started/enable-hotpatch-azure-arc-enabled-servers), [Hotpatch for Windows Server](https://learn.microsoft.com/en-us/windows-server/get-started/hotpatch).
