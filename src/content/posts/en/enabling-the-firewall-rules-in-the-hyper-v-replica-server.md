---
title: "Enabling the Firewall rules in the Hyper-V Replica Server"
description: "On a standalone Replica server, if Kerberos based authentication is used, follow these steps to make the required exception in the Windows Firewall: 1. Open Windows Firewall…"
pubDate: 2012-12-27
category: hyper-v
tags: ["hyper-v-replica", "hyper-v", "windows-firewall"]
translationKey: enabling-the-firewall-rules-in-the-hyper-v-replica-server
legacy: true
legacyUrl: /2012/12/enabling-the-firewall-rules-in-the-hyper-v-replica-server.html
---

On a standalone Replica server, if Kerberos based authentication is used, follow these steps to make the required exception in the Windows Firewall:
  1. Open **Windows Firewall with Advance Security** and click on **Inbound Rules**
  2. Right-click on **Hyper-V Replica HTTP Listener (TCP-In)** and click **Enable Rule**

On a standalone Replica server, if Certificate based authentication is used, follow these steps to make the required exception in Windows Firewall:
  1. Open **Windows Firewall with Advance Security** and click on **Inbound Rules**
  2. Right-click on **Hyper-V Replica HTTPS Listener (TCP-In)** and click **Enable Rule**

The corresponding **_netsh_** commands to enable the Firewall rules are:
```js
netsh advfirewall firewall set rule group=“Hyper-V Replica HTTP” new enable=yes
```
Or
```js
netsh advfirewall firewall set rule group=“Hyper-V Replica HTTPS” new enable=yes
```

If the Replica server is part of a Failover Cluster, run the following command from any node in the cluster to enable the firewall rules in all the nodes in the cluster
```powershell
get-clusternode | ForEach-Object  {Invoke-command -computername $_.name -scriptblock {Enable-Netfirewallrule -displayname "Hyper-V Replica HTTP Listener (TCP-In)"}}
```
Or
```powershell
get-clusternode | ForEach-Object  {Invoke-command -computername $_.name -scriptblock {Enable-Netfirewallrule -displayname "Hyper-V Replica HTTPS Listener (TCP-In)"}}
```

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
