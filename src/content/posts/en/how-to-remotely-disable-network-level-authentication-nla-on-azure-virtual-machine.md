---
title: "How to remotely disable Network Level Authentication (NLA) on Azure Virtual Machine"
description: "Today, I received an email from a colleague, saying that he could RDP into his Azure VM after he rebooted the machine through the OS (applying patches). When he tried to access…"
pubDate: 2018-05-09
category: compute
tags: ["azure-virtual-machines"]
translationKey: how-to-remotely-disable-network-level-authentication-nla-on-azure-virtual-machine
legacy: true
legacyUrl: /2018/05/how-to-remotely-disable-network-level-authentication-nla-on-azure.html
---

Today, I received an email from a colleague, saying that he could RDP into his Azure VM after he rebooted the machine through the OS (applying patches).  When he tried to access his Azure VM through an RDP session, he got the following message:

**_“The remote computer that you are trying to connect to requires Network Level Authentication (NLA), but your Windows domain controller cannot be contacted to perform NLA.  If you are an administrator on the remote computer, you can disable NLA by using the options on the Remote tab of the System Properties dialog box.”_**

When this occasion occurs, I always use one of my favorite set of tools, Sysinternals. In this case the PsExec (download [here](https://docs.microsoft.com/en-us/sysinternals/downloads/psexec)). Then you need to run the code below, to update the registry keys with the right values to disable the NLA.

**_\\VMNAME_** – The name of the machine on which you want to disable NLA

**_VMNAME\ADMIN_ACCOUNT_** – The username of a local administrator on the machine on which you want to disable NLA (SERVER_NAME\admin)

Here is the cmdlet:
```js
psexec \\VMNAME -u VMNAME\ADMIN_ACCOUNT -p PASSWORD reg add “HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\TerminalServer\WinStations\RDP-Tcp” /f /v SecurityLayer /t REG_DWORD /d 0
```

After you can try to RDP into the server. In some occasions, I found a reboot will help, depending on the OS of the Server.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
