---
title: "Plan a Windows Server patching and rollback window"
description: "Align WSUS approvals with Group Policy settings to define a precise Windows Server 2022 patching and restart window."
pubDate: 2024-05-29
category: windows-server
tags: ["windows-server", "patch-management", "group-policy", "windows-server-2022", "wsus"]
translationKey: plan-a-windows-server-patching-and-rollback-window
draft: false
---

You have approved the updates in WSUS. Now you need to ensure they install and restart the servers at the right time. The patching window is not defined by the approval itself, but by the Group Policy settings that control client detection, installation timing, and restart behaviour. If these are misaligned, servers either patch outside the window or fail to reboot, leaving them vulnerable.

The mechanism is straightforward. WSUS acts as the source of truth for which updates are available. Group Policy dictates how and when the client checks for those updates and whether it restarts automatically. By configuring these two components correctly, you can ensure that updates are downloaded during a maintenance window, installed at a specific time, and that the restart is either deferred or scheduled precisely.

## Define the approval schedule in WSUS

Your WSUS server is the control plane for update availability. Before configuring the clients, you must decide which updates are safe to deploy and when they become available. The standard practice is to approve updates for a test group first, verify stability, and then approve them for production groups.

In the WSUS Administration Console, navigate to **Updates** and select **Updates needed by computers**. Identify the critical and security updates relevant to your Windows Server 2022 estate. Right-click the selection and choose **Approve**. In the dialog box, you can target specific computer groups. For a production rollout, you would typically approve these updates as **Approved for Install** for your production group [Step 3 - Approve and Deploy Updates in WSUS](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/3-approve-and-deploy-updates-in-wsus).

If you rely on automatic approval rules, be cautious. The documentation warns that automatically approving updates classified as **Upgrades** can cause unintended operating system feature updates, such as moving from Windows Server 2022 to a newer version, which requires additional disk space and testing [Step 3 - Approve and Deploy Updates in WSUS](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/3-approve-and-deploy-updates-in-wsus). For a controlled patching window, manual approval or tightly scoped automatic rules are safer than broad auto-approval.

Once approved, the updates are available to the clients. However, availability does not mean immediate installation. The client's behaviour is governed by Group Policy.

## Configure client detection and installation timing

Group Policy is where you define the "when" for your patching window. The relevant settings are found under **Computer Configuration > Policies > Administrative Templates > Windows Components > Windows Update**.

The most critical setting is **Configure Automatic Updates**. For Windows Server 2022, you have two primary options for managing the patching window:

1.  **Option 4 - Auto download and schedule the install**: This is the standard choice for automated patching windows. You can specify a recurring day and time for installation. If no schedule is specified, the default is every day at 3:00 AM. If updates require a restart, Windows restarts the computer automatically according to this schedule [Step 4 - Configure Group Policy settings for automatic updates](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates). This option provides the rigid time-based control required for a defined maintenance window.

2.  **Option 7 - Auto Download, Notify to install, Notify to Restart**: This option is available only in Windows Server 2016 and later. It downloads updates in the background but requires local administrators to manually proceed with installations and reboots [Step 4 - Configure Group Policy settings for automatic updates](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates). This option does **not** support scheduled restarts. It is a manual intervention tool, not a scheduling tool. If your goal is a time-based window, Option 7 will not achieve it without human action.

To ensure clients check for updates frequently enough to stay within your window, configure **Automatic Updates detection frequency**. The default is 22 hours, but you can reduce this to, for example, 4 or 6 hours, depending on how quickly you need to react to new approvals [Step 4 - Configure Group Policy settings for automatic updates](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates). Remember, this setting only takes effect if **Specify intranet Microsoft update service location** is enabled, pointing the clients to your WSUS server [Step 4 - Configure Group Policy settings for automatic updates](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates).

## Manage the restart behaviour

The restart is the most disruptive part of patching. Group Policy provides several settings to manage this, ensuring that the server reboots only when necessary and at the right time.

If you use Option 4 (scheduled install), the **Delay restart for scheduled installations** setting determines how long the system waits after updates are installed before proceeding with a restart. The default is 15 minutes, but you can extend this to allow for final checks or graceful application shutdowns [Step 4 - Configure Group Policy settings for automatic updates](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates). This delay is a policy-controlled pause, not necessarily a user-initiated action.

For Option 7 (notify to restart), the **No auto-restart with logged on users for scheduled automatic updates installations** setting is key. If enabled, the system will not restart automatically if a user is logged on. Instead, it will notify the user. This is essential for servers that might have administrative sessions open, preventing a reboot from interrupting active work [Step 4 - Configure Group Policy settings for automatic updates](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates).

If you need to force a restart after a specific period, regardless of user activity, you can use **Always automatically restart at the scheduled time**. This setting starts a restart timer immediately after installation, which can be configured from 15 to 180 minutes. When the timer expires, the restart proceeds even if users are signed in [Step 4 - Configure Group Policy settings for automatic updates](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates). Use this with caution, as it overrides user notifications.

## Verification and cleanup

After configuring the GPO, verify that the settings are applied correctly. On the client server, open **Local Group Policy Editor** (gpedit.msc) and navigate to the Windows Update policies to confirm the values. You can also check the **Windows Update** log in **Event Viewer** under **Applications and Services Logs > Microsoft > Windows > WindowsUpdate > Operational** to see if the client is communicating with the WSUS server and downloading updates.

In WSUS, use the **Reports** feature to review the **Update Status Summary**. This report shows which computers have received the approved updates and their installation status [Step 3 - Approve and Deploy Updates in WSUS](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/3-approve-and-deploy-updates-in-wsus). If a server is not reporting in, check its network connectivity to the WSUS server and ensure the GPO is linked to the correct Organizational Unit (OU).

Finally, document your patching window and the associated GPO settings. This creates a baseline for future audits and helps new administrators understand the intended behaviour. If you need to adjust the window, update the GPO and allow time for the client to refresh its policy (typically 90 minutes, or immediately with `gpupdate /force`).
