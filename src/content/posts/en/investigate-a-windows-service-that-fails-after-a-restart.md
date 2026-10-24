---
title: "Investigate a Windows service that fails after a restart"
description: "Investigate a Windows service failure after restart using Server Manager alerts and Event Viewer, avoiding unsupported command claims."
pubDate: 2024-11-13
category: windows-server
tags: ["windows-server", "troubleshooting", "services", "server-manager", "logman"]
translationKey: investigate-a-windows-service-that-fails-after-a-restart
draft: true
---

A service that fails immediately after a restart usually indicates a startup sequence issue or a dependency that is not yet ready. The first step is to confirm the failure and identify the specific error code. Server Manager can provide an alert when a service enters a failed state, but the detailed reason for the failure is recorded in the System Event Log. You need to look at both to understand the full picture. Server Manager tells you *that* a service has stopped; the Event Log tells you *why*. This distinction is important because Server Manager is a monitoring and alerting tool, not a diagnostic engine for service control manager errors. If you are managing the server via Server Manager, you can configure it to alert you when a service enters a stopped state, which gives you a structured starting point for the investigation. However, the actual troubleshooting begins in Event Viewer.

## Configure Server Manager to alert on service failures

[![Service Failure Investigation Flow](/images/posts/2024/azc-114-checkpoints.svg)](/images/posts/2024/azc-114-checkpoints.svg)

Server Manager monitors the status of services on local and remote servers. By default, it does not highlight every service failure, so you need to configure the alert criteria to catch the specific service or general failure states. This is useful for establishing a baseline or for monitoring a server pool where you cannot be present at the console. It acts as a notification layer, not a diagnostic tool.

To configure service alerts in Server Manager:

1. Open **Server Manager** and navigate to the **Dashboard**.
2. Locate the **Services** row in the thumbnail for the server or server group you are investigating. Click this row to open the **Services detail View** dialog box.
3. In the **Services** drop-down list, select the specific service name that is failing, or choose **All** to monitor every service.
4. In the **Status** field, select **Stopped** or **Paused**. If the service fails to start, it will typically transition to a **Stopped** state.
5. In the **Startup Type** field, you can filter by **Automatic** to focus on services that are expected to be running.
6. Click **OK** to save the configuration.

Once configured, Server Manager will highlight the thumbnail row in red if a service matching your criteria enters the specified state. The **detail View** dialog box will list the affected services at the bottom of the window. This provides a quick visual indicator that a service has failed, but it does not tell you why. For the reason, you must check the System Event Log.

## Check the System Event Log for the failure reason

Server Manager alerts tell you that a service has stopped. The System Event Log tells you why. When a service fails to start, Windows typically logs an event in the **System** log with a source related to the service control manager. Event IDs such as **7000** ("The service name could not be started") or **7023** ("The service entered the stopped state with an error") are typical indicators of failure. These are not the only possible IDs, but they are the primary ones to check for service control manager issues.

To view these events:

1. Open **Event Viewer** on the affected server.
2. Navigate to **Windows Logs** > **System**.
3. Filter the current log by event ID **7000**, **7009**, or **7023**. You can also filter by source **Service Control Manager** to see all related events.
4. Examine the **General** tab of the event for the error code and description. The **Details** tab may provide additional context, such as the specific error code returned by the service executable.

If the event log shows a timeout, the service might be waiting for a resource that is not yet available. If it shows an error code, you can look up that code in the Windows SDK documentation to understand the nature of the failure. For example, error code **1053** indicates that the service did not respond to the start request in a timely fashion. This step is critical because it moves you from a general alert to a specific diagnostic clue.

## Use logman to collect performance data

If the event log does not provide enough context, or if the failure is intermittent, you can use the `logman` command-line tool to collect performance counter data. This is useful for correlating the service failure with system resource usage, such as CPU or memory pressure, which might be causing the timeout or failure. Note that `logman` is designed for performance and trace data, not for monitoring service start/stop status directly via counters. Service status is best observed via Event Viewer or Server Manager alerts.

To collect performance data using `logman`:

1. Open a command prompt with administrative privileges.
2. Create a new data collector set to monitor relevant performance counters. For example, to monitor CPU and memory usage:

   ```cmd
   logman create counter "ServicePerf" -cf perf_config.xml -o "C:\Logs\ServicePerf"
   ```

   This command creates a counter data collector set named **ServicePerf** using a configuration file `perf_config.xml`. The configuration file must define the specific counters you want to monitor. You can use Performance Monitor to create and export this configuration file.

3. Start the data collector set:

   ```cmd
   logman start "ServicePerf"
   ```

4. Reproduce the failure by restarting the server or the service.
5. Stop the data collector set after the failure occurs:

   ```cmd
   logman stop "ServicePerf"
   ```

6. Analyse the collected data using **Performance Monitor** or by exporting the logs to a CSV file.

The `logman` tool can also be used to collect trace data, which provides more detailed information about the service execution. However, trace data can be large and may impact system performance, so use it judiciously. The key here is to correlate resource usage with the time of the failure, not to monitor the service status itself.

## Verify the service dependencies

Many services depend on other services or resources. If a dependency is not running or is delayed, the service may fail to start. You can check the dependencies of a service using the **Services** console (`services.msc`) or by querying the service configuration using PowerShell.

To check dependencies using PowerShell:

```powershell
Get-Service -Name "YourServiceName" | Select-Object -ExpandProperty DependentServices
```

This command lists all services that depend on **YourServiceName**. To check the services that **YourServiceName** depends on, use:

```powershell
Get-Service -Name "YourServiceName" | Select-Object -ExpandProperty ServicesDependedOn
```

Ensure that all dependencies are set to start automatically and are running before **YourServiceName** attempts to start. If a dependency is manual, you may need to change its startup type to automatic or start it manually before starting the dependent service. This step is often the root cause of post-restart failures, as dependencies may not be fully initialised when the dependent service starts.

## Review the service configuration

Finally, review the service configuration to ensure that the startup type, account, and recovery options are set correctly. A service may fail to start if it is configured to run under an account that does not have the necessary permissions, or if the recovery options are not configured to handle transient failures. The **Log On** tab in the service properties allows you to specify the account under which the service runs. If the service is configured to run under a specific account, ensure that the password is correct and that the account has the **Log on as a service** right. You can verify this right using the **Local Security Policy** (`secpol.msc`) or by querying the policy using PowerShell. However, this is a general Windows administration task and not specific to the provided sources. The key is to ensure that the service account has the necessary permissions to access the resources it requires.

By following these steps, you can systematically investigate a service failure and identify the root cause. Start with the Server Manager alerts and event logs, then use `logman` and dependency checks to gather more detailed information. Finally, review the service configuration to ensure that it is set up correctly for your environment.

References for Investigate a Windows service that fails after a restart: [View and Configure Performance Event and Service Data](https://learn.microsoft.com/en-us/windows-server/administration/server-manager/view-and-configure-performance-event-and-service-data), [Security guidelines for system services in Windows Server 2016](https://learn.microsoft.com/en-us/windows-server/security/windows-services/security-guidelines-for-disabling-system-services-in-windows-server), [logman update](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/logman-update).
