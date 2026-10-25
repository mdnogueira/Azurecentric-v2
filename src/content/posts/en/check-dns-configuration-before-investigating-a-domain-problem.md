---
title: "Check DNS configuration before investigating a domain problem"
description: "Troubleshoot domain name resolution failures by checking DNS server configuration, recursion, and delegation before investigating application issues."
pubDate: 2025-03-05
category: windows-server
tags: ["dns", "troubleshooting", "active-directory", "windows-server", "name-resolution"]
translationKey: check-dns-configuration-before-investigating-a-domain-problem
draft: false
---

A domain name resolution failure often looks like an application or Active Directory problem, but the root cause is usually in the DNS infrastructure. Before you examine application logs, firewall rules, or replication health, you need to confirm that the DNS servers are functioning as expected. Active Directory Domain Services (AD DS) relies on DNS name resolution for clients to locate domain controllers and for those controllers to communicate with each other [DNS and AD DS](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/DNS-and-AD-DS). If the name resolution path is broken, the application will fail regardless of its own configuration.

The first step is to verify basic connectivity and the server's ability to answer queries. Run `ipconfig /all` to confirm the IP address, subnet mask, and default gateway are correct. Then, use `nslookup` to query the specific name against the IP address of the DNS server you expect to handle the request. For example:

```cmd
nslookup app1 10.0.0.1
```

If you receive a failure or time-out response, the issue is likely with recursion or connectivity rather than the specific record for `app1` [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server). If the query succeeds, the server is reachable and can resolve that name. If it fails, flush the resolver cache on the server using `dnscmd /clearcache` in an administrative Command Prompt window, or `Clear-DnsServerCache` in an administrative PowerShell window, and then repeat the query to rule out stale cached data [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server).

## Check for recursion and forwarding issues

If the initial `nslookup` fails, you need to determine whether the server can resolve names it is not authoritative for. DNS servers answer queries from their cache, from zones they host, or by querying other servers [Reviewing DNS Concepts](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/reviewing-dns-concepts). If the server is not authoritative for the name and does not have the answer in its cache, it must use either root hints or forwarding to resolve the query [Reviewing DNS Concepts](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/reviewing-dns-concepts).

Check the **Forwarders** tab in the server properties in the DNS console. If the **Enable forwarders** check box is selected and servers are listed, the server is configured to forward queries. If the query fails, the problem may lie with the forwarder server itself. You should then check the forwarder for the same connectivity and service issues [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server).

If the server does not use forwarders, it relies on root hints. You can test whether the server can query a root server by running the following commands in `nslookup`:

```cmd
nslookup
server <IP address of server being examined>
set q=NS
```

If the resolver returns the IP address of a root server, the root hints are likely functional. If it returns a "Request to server timed out" response, the root hints may be pointing to non-functioning servers, or there may be a network or firewall issue preventing the DNS server from querying the root servers [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server). You can view the current root hints in the DNS console by right-clicking the server, selecting **Properties**, and clicking **Root Hints**. Verify basic connectivity to these root servers by IP address to distinguish between configuration errors and network blocks [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server).

## Verify authoritative data and delegation

If the server is authoritative for the zone in question, the issue is likely with the data within that zone. Check the Application, System and DNS Server event logs for any recorded errors [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server). You can also test by querying the server for a client name to see if it returns the correct IP address. If it returns a "Server failure" or "Query refused" response, the zone may be paused or the server may be overloaded [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server).

If the server is hosting a secondary copy of the zone, you need to check the primary server. Examine the zone on the primary server to see if the name is correct. If the name is correct on the primary server, check whether the serial number on the primary server is less than or equal to the serial number on the secondary server. If it is, modify the primary or secondary server so that the primary serial number is greater [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server). You can force a zone transfer on the secondary server using `dnscmd /zonerefresh <zone name>` [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server).

If the server is a primary server, the problem might be caused by user error when entering data, or by a problem affecting Active Directory replication or dynamic update [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server).

## Test for broken delegations

If the server is not authoritative and cannot resolve the name via forwarders or root hints, you may have a broken delegation. You can test this by querying a valid root server and working down the hierarchy. In `nslookup`, set recursion off and query for the NS record of the target FQDN:

```cmd
nslookup
server <server IP address>
set norecursion
set querytype=NS
<target FQDN.>
```

If the response includes NS and A resource records for delegated servers, repeat the query for each server using the IP address from the A records. If the response does not contain an NS resource record, or if it contains NS records but no valid A resource records, you have a broken delegation [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server). Fix this by adding or updating the A resource record in the parent zone with a valid IP address for the correct DNS server for the delegated zone [Troubleshooting DNS Servers](https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-server).
