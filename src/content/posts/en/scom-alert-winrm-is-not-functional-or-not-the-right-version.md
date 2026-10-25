---
title: "SCOM Alert: WinRM is not functional or not the right version"
description: "On System Center 2012 R2 Operations Manager (SCOM) (with UR2) starting to appear Critical Alerts coming from System Center Advisor (SCA) saying that my System Center 2012 R2…"
pubDate: 2014-05-27
category: windows-server
tags: ["scom", "windows-server", "alerts", "winrm", "system-center", "hyper-v"]
translationKey: scom-alert-winrm-is-not-functional-or-not-the-right-version
legacy: true
legacyUrl: /2014/05/scom-alert-winrm-is-not-functional-or-not-the-right-version.html
---

On System Center 2012 R2 Operations Manager (SCOM) (with UR2) starting to appear Critical Alerts coming from System Center Advisor (SCA) saying that my System Center 2012 R2 Virtual Machine Manager (SCVMM) (with UR2) “**WinRM is not functional or not the right version**”. 

The alert description is: 

>An issue was found with Windows Remote Management (WinRM) on the specified server.  
>The specified server cannot be used for VMM server roles such as host/library/PXE server/WSUS server/VMM management server until the issue is resolved. >See the troubleshooting article for more information.  
>Path: /VMM Server/NAME_OF_SERVER  
>Details: Exception attempting to access WinRM service on agent  
>Agent FQDN: NAME_OF_SERVER

After view the solution/KB Article that SCA indicates (see [here](http://go.microsoft.com/fwlink/?LinkId=316311)) and follow the troubleshooting steps, I did conclude that the version that I have on SCVMM it was newer that the version that the SCA alert is reporting.  

On this environment I have cluster with Hyper-V 2012 and Hyper-V 2012 R2 managed by SCVMM 2012 R2. The version on SCVMM server and the Hyper-V 2012 R2 is the same.  

On the other hand the version of Hyper-V 2012 are different because of the OS

In this case I did move on and insert safely this alert under the ignore alert list on SCA. I highly recommend to ignore this alert, but only, for that specified Hyper-V server and not the entire alert. Using this option you will continue to monitor this rule, but not for those Hyper-V Servers.

Cheers,

**Marcos Nogueira**
**_MVP_**  
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
