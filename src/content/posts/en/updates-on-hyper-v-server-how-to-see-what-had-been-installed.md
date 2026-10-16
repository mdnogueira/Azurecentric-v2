---
title: "Updates on Hyper-V Server? How to see what had been installed?"
description: "When do you need to see what updates had been installed on your Hyper-V server, you can use this PowerShell cmdlet to list all the updates. powershell Get-WmiObject -Class…"
pubDate: 2013-11-04
category: hyper-v
tags: [powershell]
translationKey: updates-on-hyper-v-server-how-to-see-what-had-been-installed
legacy: true
legacyUrl: /2013/11/updates-on-hyper-v-server-how-to-see-what-had-been-installed.html
---

When do you need to see what updates had been installed on your Hyper-V server, you can use this PowerShell cmdlet to list all the updates.
```powershell
Get-WmiObject -Class Win32_QuickFixEngineering | select description,hotfixid,installedon
```

Then if you need to compare if all the nodes of your cluster or if your Hyper-V server have the same patch level just run this cmdlet remotely through PowerShell ISE.

If you need help run remotely PowerShell cmdlet, just see one of my previous post ([Managing Hyper-V Server remotely through PowerShell)](/posts/managing-hyper-v-server-remotely-through-powershell)

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
