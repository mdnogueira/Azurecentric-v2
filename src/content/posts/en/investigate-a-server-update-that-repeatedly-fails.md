---
title: "Investigate a server update that repeatedly fails"
description: "Troubleshoot a Windows Server 2025 update failing repeatedly by verifying WSUS approval scope, synchronisation health, and client reporting."
pubDate: 2026-05-17
category: windows-server
tags: ["wsus", "windows-server-2025", "troubleshooting", "windows-update", "system-administration"]
translationKey: investigate-a-server-update-that-repeatedly-fails
draft: false
---

A server update that repeatedly fails is rarely a single broken file. It is usually a mismatch between what the client expects, what the WSUS server offers, and what the network allows. When you see a failure loop, the first thing to check is whether the update is actually approved for that specific computer group, and whether the server has successfully synchronised the latest metadata.

## Check the update approval scope

The most common reason an update fails to install is that it has not been approved for the target computer group. WSUS does not automatically install updates; you must explicitly approve them. If an update remains in the **Not approved** state, the client will evaluate it but will not download or install it, which can manifest as a failure or a persistent "pending" state depending on the client configuration.

Open the WSUS administration console and navigate to **Updates** > **All Updates**. Locate the failing update. Check its approval status. If it is **Not approved**, right-click the update and select **Approve**. In the dialog, select the specific computer group containing the failing server and choose **Approved for Install**. You can also set a deadline if you need the update applied immediately.

If the update is already approved, check whether it is approved for the correct group. WSUS supports hierarchical computer groups. An approval at the parent level does not automatically apply to child groups unless you explicitly select **Apply to Children** or configure the child group to inherit approvals. If the failing server is in a child group, ensure the approval propagates correctly.

## Verify server synchronisation and health

Even if an update is approved, the WSUS server must have the update files and metadata synchronised from Microsoft Update. If the server has not synchronised recently, or if the synchronisation failed, the client may receive incomplete information, leading to installation failures.

Check the WSUS server's synchronisation status. The administration console home page provides an overview of update compliance and network health. If you suspect synchronisation problems, check the synchronisation logs for errors. Common issues include network connectivity problems, proxy configuration errors, or insufficient disk space on the WSUS server's content location.

Also, verify the server's overall health. Check the Windows Update service status on the WSUS server itself. Ensure the IIS services are running, as WSUS relies on IIS to serve updates to clients. If the IIS services are stopped, clients will fail to connect or download updates.

## Inspect client reporting and logs

If the update is approved and the server is synchronised, the issue likely lies with the client. Windows Server 2025 clients report their status to the WSUS server. If the client is not reporting correctly, you may see a failure loop without clear error details.

On the failing server, open the **WindowsUpdate.log** file. This log provides detailed information about the update process, including errors encountered during download, installation, or verification. Look for specific error codes. Common errors include:

*   **0x80070005**: Access denied. This may indicate a permissions issue with the Windows Update agent or the WSUS server.
*   **0x80240017**: The update is not applicable to this computer. This suggests a mismatch between the update's applicability rules and the server's configuration.
*   **0x800f081f**: The source files for the update could not be downloaded. This points to a network or WSUS server availability issue.

Additionally, check the **Component Based Servicing (CBS)** log, located in `C:\Windows\Logs\CBS\CBS.log`. This log provides details about package installation failures, including missing dependencies or conflicts with other updates.

## Review client configuration

Ensure the client server is correctly configured to point to the WSUS server. This is typically done via Group Policy or local registry settings. Verify that the **Specify intranet Microsoft update service location** policy is set to the correct WSUS server URL. If the client is pointing to an incorrect or unreachable WSUS server, it will fail to download updates.

Also, check the client's Windows Update service status. Ensure the **Windows Update** service is running and set to automatic. If the service is stopped or disabled, the client cannot communicate with the WSUS server.

## Next steps

Once you have verified the approval status, synchronisation health, and client logs, attempt to force a client-side update scan. On the failing server, open a command prompt and run:

```powershell
wuauclt /detectnow
```

This command forces the client to contact the WSUS server and check for new updates. Monitor the **WindowsUpdate.log** for activity. If the update downloads and installs successfully, the issue is resolved. If it fails again, review the error codes in the log and correlate them with the steps above.

If the problem persists, consider checking the WSUS server's database integrity. A corrupted WSUS database can cause unexpected behaviour. You can use the **WSUS Server Cleanup Wizard** to remove obsolete updates and clean up the database. This may resolve issues related to stale or corrupted update metadata.

Finally, ensure that the WSUS server has sufficient resources. High CPU or memory usage on the WSUS server can impact synchronisation and client communication. Monitor the server's performance and scale resources if necessary.

References for Investigate a server update that repeatedly fails: [Step 1 - Install the WSUS Server Role](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/1-install-the-wsus-server-role), [Update Management with Windows Server Update Services](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/manage/update-management-with-windows-server-update-services), [Updates Operations](https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/manage/updates-operations).
