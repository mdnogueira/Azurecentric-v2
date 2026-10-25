---
title: "Managing Hyper-V Server remotely through PowerShell"
description: "Working with PowerShell can be very common for daily tasks and Hyper-V Server management. However, as there is more than one server to be managed, sometimes it can be difficult…"
pubDate: 2013-10-15
category: hyper-v
tags: ["hyper-v", "powershell"]
translationKey: managing-hyper-v-server-remotely-through-powershell
legacy: true
legacyUrl: /2013/10/managing-hyper-v-server-remotely-through-powershell.html
---

Working with PowerShell can be very common for daily tasks and Hyper-V Server management. However, as there is more than one server to be managed, sometimes it can be difficult to log on and run the PowerShell scripts (most of the time the same one) on different computers.

One of the benefits that PowerShell offers is the remote option that allows you to connect to multiple servers, enabling a single PowerShell window to administer as many servers as you need.

The PowerShell remote connection uses port 80, HTTP. Although the local firewall exception is created by default when it's enabled, make sure that any other firewall has the exception to allow communication between your servers.

## How to do it

These tasks will show you how to enable the PowerShell Remoting feature to manage your Hyper-V Servers remotely using PowerShell.
1. Open a PowerShell window as an administrator from the server for which you want to enable the PowerShell Remoting.
2. Type the **_Enable-PSRemoting_** commandlet to enable PowerShell Remoting.
3. The system will prompt you to confirm some settings during the setup. Select **A** for **Yes to All** to confirm all of them. Run the **_Enable-PSRemoting_** command on all the servers that you want to connect to remotely via PowerShell.
4. In order to connect to another computer in which the PowerShell Remoting is already enabled, type **_Connect-PSSession Hostname_**, where hostname is the computer name to which you want to connect.
5. To identify all the commands used to manage the PowerShell sessions, you can create a filter with the command **_Get-Command *PSSession*_**. A list of all the PSSession commands will appear, showing you all the available remote connection commands.
6. To identify which command lines from Hyper-V can be used with the remote option computername, use the **_Get-Command_** with the following parameter:
```powershell
Get-Command –Module Hyper-V –ParameterName Computername
```
7. To use the remote PowerShell connection from **PowerShell ISE**, click on **File** and select **New Remote PowerShell** Tab. A window will prompt you for the computer name to which you want to connect and the username, as shown in the following screenshot. Type the computer name and the username to create the connection and click on **Connect**. Make sure that the destination computer also has the remoting settings enabled.
8. A new tab with the computer name to which you have connected will appear at the top, identifying all the remote connections that you have through PowerShell ISE. The following screenshot shows an example of a PowerShell ISE window with two tabs. The first one to identify the local connection called PowerShell 1 and the remote computer tab called HVHost.

## Summary

The process to enable PowerShell involves the creation of a firewall exception, WinRM service configuration, and the creation of a new listener to accept requests from any IP address. PowerShell configures all these settings through a single and easy command—Enable-PSRemoting. By running this command, you will make sure that your computer has all the components enabled and configured to accept and create new remote connections using PowerShell.

Then, we identified the commands which can be used to manage the remote connections. Basically, all the commands that contain PSSession in them. Some examples are as follows:
* **_Connect-PSSession_** to create and connect to a remote connection
* **_Enter-PSSession_** to connect to an existing remote connection
* **_Exit-PSSession_** to leave the current connection
* **_Get-PSSession_** to show all existing connections
* **_New-PSSession_** to create a new session

Another interesting option that is very important, is to identify which commands support remote connections. All of them use the ComputerName switch. To show how this switch works, see the following example; a command to create a new VM is being used to create a VM on a remote computer named HVHost.
```powershell
New-VM –Name VM01 –ComputerName HVHost
```
To identify which commands support the Computername switch, you saw the **_Get-Command_** being used with a filter to find all the commandlets. After these steps, your servers will be ready to receive and create remote connections through PowerShell.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
