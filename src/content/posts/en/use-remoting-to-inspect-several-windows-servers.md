---
title: "Use remoting to inspect several Windows servers"
description: "Inspect multiple Windows servers using PowerShell remoting, distinguishing WSMan configuration from simple cmdlet parameters."
pubDate: 2025-04-30
category: automation
tags: ["powershell", "remoting", "windows", "invoke-command", "pssession", "wsman"]
translationKey: use-remoting-to-inspect-several-windows-servers
draft: false
---

You need to check the status of a service across several Windows servers. Doing this one by one is slow. PowerShell remoting lets you run commands on multiple systems at once, returning results to your local session.

Before you start, you need to decide which tool fits the job. Many Windows PowerShell cmdlets have a **ComputerName** parameter that enables you to collect data on remote computers without special configuration. These cmdlets use varying communication protocols, such as WMI or RPC, and work on all Windows operating systems. `Get-Service`, `Get-Process`, and `Get-HotFix` are examples of these. If you only need to read data, you might not need to enable PowerShell remoting at all.

However, if you need to run arbitrary commands, execute scripts, or use persistent sessions, you need Windows PowerShell remoting. This uses the WS-Management protocol. For this to work, the remote computer must be configured for remote management. If the remote endpoints are not enabled, your commands will fail with a connection error.

## Enabling the remoting endpoint

To enable PowerShell remoting, run the `Enable-PSRemoting` cmdlet in an elevated PowerShell session on the remote computer. This command configures the WinRM service to receive requests, starts the service, and creates a firewall exception.

```powershell
Enable-PSRemoting
```

The output confirms the changes:

```text
WinRM has been updated to receive requests.
WinRM service type changed successfully.
WinRM service started.

WinRM has been updated for remote management.
WinRM firewall exception enabled.
```

Running `Enable-PSRemoting` creates two endpoints for the specific installation version you are running. For example, if you run it in PowerShell 7.4, it creates:

- An endpoint with a simple name corresponding to the major version, such as **PowerShell.7.4**.
- An endpoint with the full version number, such as **PowerShell.7.4.7**.

You can connect to the latest version using the simple name. You can connect to a specific version using the longer, version-specific name. Use the **ConfigurationName** parameter with `New-PSSession` or `Enter-PSSession` to target a specific endpoint.

Note that WSMan remoting is supported between Windows systems. Support on non-Windows platforms is limited because the underlying dependencies (OMI and OpenSSL 1.0) are no longer supported by Linux vendors. For cross-platform scenarios, use SSH remoting instead.

## One-to-many inspection

For a quick check across multiple servers, use the `Invoke-Command` cmdlet. This cmdlet runs a script block on one or more remote computers simultaneously. The results are returned to your local session as deserialized objects.

```powershell
Invoke-Command -ComputerName Server01, Server02, Server03 {
    Get-Service -Name W32time
} -Credential $Cred
```

In this example, `$Cred` holds your credentials. You must specify them if you are not using the same account on the local and remote machines. The output includes a `PSComputerName` property, which tells you which server each result came from. This is useful for identifying which servers have a service in a different state.

The objects returned are deserialized. This means they are inert snapshots of the service state. You cannot call methods like `Start()` or `Stop()` on these objects directly in your local session because they lack the live methods required to interact with the service control manager. However, you can invoke methods within the remote script block itself.

```powershell
Invoke-Command -ComputerName Server01, Server02, Server03 {
    (Get-Service -Name W32time).Start()
} -Credential $Cred
```

This approach is efficient for one-off commands. However, each call to `Invoke-Command` without a session object establishes a new connection, runs the command, and then closes the connection. If you need to run multiple commands on the same servers, this overhead can add up.

## Persistent sessions for multiple commands

When you need to run several commands against the same set of servers, create a persistent session. Use `New-PSSession` to establish connections to multiple computers at once. The session objects are stored in a variable.

```powershell
$Sessions = New-PSSession -ComputerName Server01, Server02, Server03 -Credential $Cred
```

Once the sessions are established, you can run any command in them using `Invoke-Command` and the `-Session` parameter. Because the sessions are persistent, you can collect data from one command and use it in another.

```powershell
Invoke-Command -Session $Sessions { Get-HotFix }
```

You can also store data within the session. For example, you can save the output of a command to a variable inside the session.

```powershell
Invoke-Command -Session $Sessions { $hotfixes = Get-HotFix }
```

The `$hotfixes` variable now exists in each remote session. You can use it in subsequent commands within the same session without re-running the initial query.

```powershell
Invoke-Command -Session $Sessions { $hotfixes | Where-Object { $_.InstalledBy -ne "NT AUTHORITY\SYSTEM" } }
```

This is particularly useful for complex inspections where you need to correlate data from multiple sources. You can also import commands from a remote session that run implicitly on the remote session, but for most inspection tasks, persistent sessions are sufficient.

## Cleaning up

When you finish inspecting the servers, remove the sessions to free up resources on both the local and remote computers. You can remove all sessions for the current user by piping `Get-PSSession` to `Remove-PSSession`.

```powershell
Get-PSSession | Remove-PSSession
```

If you only want to remove specific sessions, you can filter the list before removing them. This ensures that you do not accidentally close sessions you are still using for other tasks.

## Troubleshooting

If your commands fail, check the following:

1. **Remoting is not enabled**: Ensure `Enable-PSRemoting` has been run on the remote computers. You can verify this by checking the WinRM service status.
2. **Network issues**: Firewalls may block the WS-Management port (default 5985 for HTTP or 5986 for HTTPS). Use `Test-Connection` to verify basic connectivity, but note that this does not confirm WS-Management availability.
3. **Credentials**: Ensure you are using an account with sufficient permissions on the remote computers. The `Enter-PSSession` and `Invoke-Command` cmdlets require appropriate access to run commands remotely.
4. **PowerShell version**: If you are connecting to older versions of Windows, ensure the required Windows Management Framework (WMF) and Universal C Runtime are installed.

Verify your results by checking the `PSComputerName` property in the output. This ensures you are looking at data from the correct servers. If you encounter any issues, refer to the `about_Remote_Troubleshooting` help topic for more detailed guidance.

References for Use remoting to inspect several Windows servers: [PowerShell remoting](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/08-powershell-remoting), [Running Remote Commands](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/Running-Remote-Commands), [Using WS-Management (WSMan) Remoting in PowerShell](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/WSMan-Remoting-in-PowerShell).
