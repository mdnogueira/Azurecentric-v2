---
title: "Review event logs around a Windows infrastructure change"
description: "Review Windows infrastructure changes by correlating Server Manager alerts, specific security event IDs, and Windows Admin Center management logs."
pubDate: 2025-06-25
category: windows-server
tags: ["windows-server", "windows-admin-center", "alerts", "server-manager"]
translationKey: review-event-logs-around-a-windows-infrastructure-change
draft: false
---

You are reviewing a Windows Server 2025 infrastructure change. The goal is to establish what happened, who did it, and whether the system state aligns with expectations. Relying on a single view is risky. Server Manager provides a high-level alerting layer, the Security event log captures specific identity and policy changes, and Windows Admin Center logs the management actions themselves. Combining these sources gives you a clearer picture than any single tool.

## Start with Server Manager for immediate alerts

Server Manager is designed to highlight issues across a server pool. It does not capture every event, but it filters the noise. When you configure it, you define what constitutes an alert.

To see what Server Manager is watching, open the **Events** tile on a role, server group, or local server page. Click **Configure Event Data** on the **Tasks** menu. By default, it collects **Critical**, **Error**, and **Warning** severity levels from the **Application**, **Setup**, and **System** logs for the previous 24 hours. This is a broad net. If your change involved a specific service installation or a driver update, the **Setup** log is likely where you will find the confirmation or failure.

The dashboard thumbnails provide a quick health check. If the **Events** row of a thumbnail is highlighted, it means an event matching your configured criteria has occurred. Clicking the row opens the **Events detail View** dialog box. Here, you can filter by severity, source, and specific Event IDs. For example, if you suspect a service failure, you can type an Event ID range into the **Event IDs** field. The documentation notes that you can exclude IDs using a dash before the number, such as `1,3,5-99,-76`. This helps you isolate the specific events related to your change from the general background noise.

Remember that the alerts displayed in thumbnails are a subset of the data collected. Changing the alert criteria in the thumbnail view does not change what Server Manager collects from the managed servers. It only changes what you see highlighted. If you need to verify that a specific event was logged, you must check the actual event log on the server, not just the Server Manager dashboard.

## Check specific security and identity events

Infrastructure changes often involve identity, policy, or security configuration. The Security event log is the primary source for these activities. However, not all events are logged by default. The documentation for monitoring Active Directory explicitly states that default logging behavior varies by version and edition, and many audit-related Group Policy Objects are set to **Not Configured** by default. This means you might miss critical events if you do not have the appropriate audit policies configured.

When reviewing a change, look for events that indicate a shift in the security posture. The following table lists events that are generally recommended for monitoring, with their potential criticality.

| Event ID | Potential Criticality | Event Summary |
|---|---|---|
| 4719 | High | System audit policy was changed. |
| 4765 | High | SID History was added to an account. |
| 4794 | High | An attempt was made to set the Directory Services Restore Mode. |
| 1102 | Medium to High | The audit log was cleared. |
| 4720 | Low | A user account was created. |
| 4722 | Low | A user account was enabled. |
| 4723 | Low | An attempt was made to change an account's password. |
| 6145 | Medium | One or more errors occurred while processing security policy in the Group Policy objects. |

A potential criticality of High means that one occurrence should be investigated. For example, Event ID 4719 indicates that the system audit policy was changed. If you did not intentionally change the audit policy, this is a significant finding. Event ID 1102, where the audit log was cleared, is also high criticality and should be investigated immediately.

Medium criticality events, such as Event ID 4720 (user account created) or 4723 (password change attempt), should be investigated if they occur unexpectedly or in numbers that exceed the baseline. Low criticality events, like 4624 (successful logon) or 4634 (logoff), are common and usually not indicative of a problem unless they appear in unusual patterns.

If you are reviewing a change that involved Group Policy, check for Event ID 6145, which indicates errors processing security policy in Group Policy objects. This can help you identify if a policy change failed to apply correctly.

## Correlate with Windows Admin Center logs

If you used Windows Admin Center to perform the change, it provides its own audit trail. Windows Admin Center logs management activities to the **WindowsAdminCenter** event channel on the managed server. These events have an `EventID` of `4000` and a `Source` of `SMEGateway`.

These logs are particularly useful because they capture the user context. The log includes the `UserOnGateway` (the username used to access the Windows Admin Center gateway) and the `UserOnTarget` (the username used to access the managed server, if different). This helps you distinguish between a local administrator action and a delegated action.

The logs also include the `Module` (the tool or module where the action was run), the `PowerShell` script name if applicable, and the `CIM` call if a CIM call was used. If the action involved a file upload, the `File` name is recorded. If the user accessed the server using LAPS credentials, the `LAPS` field is set to Boolean true.

It is important to note that Windows Admin Center logs only actions on the managed server. Events are not logged if a user accesses a server for read-only purposes. This means that if you only viewed the server configuration without making changes, there will be no corresponding `4000` event in the WindowsAdminCenter channel.

## Verify the change

After reviewing the logs, you need to verify that the change was successful and that no unexpected side effects occurred. Start by checking the Server Manager dashboard for any new alerts. If the **Events** row is highlighted, review the details in the **Events detail View** dialog box. Look for any errors or warnings that might indicate a failure.

Next, check the Security event log for any high-criticality events. If you see Event ID 4719 or 1102, investigate immediately. If you see other events, compare them against your baseline to determine if they are expected.

Finally, check the WindowsAdminCenter event channel for any `4000` events. Verify that the `UserOnGateway` and `UserOnTarget` match your expectations. If you used a PowerShell script, check the `PowerShell` field to see which script was run.

If you find unexpected events, you may need to dig deeper. Check the Application and System logs for related errors. Review the Group Policy objects to ensure they were applied correctly. If you are unsure about the cause of an event, consult the Microsoft documentation for that specific Event ID.

By correlating these three sources, you can build a comprehensive picture of the infrastructure change. This approach helps you identify issues early and ensures that the change was implemented as intended.

References for Review event logs around a Windows infrastructure change: [View and Configure Performance Event and Service Data](https://learn.microsoft.com/en-us/windows-server/administration/server-manager/view-and-configure-performance-event-and-service-data), [Appendix L - Events to Monitor](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/appendix-l--events-to-monitor), [Event Logging in Windows Admin Center](https://learn.microsoft.com/en-us/windows-server/manage/windows-admin-center/use/logging).
