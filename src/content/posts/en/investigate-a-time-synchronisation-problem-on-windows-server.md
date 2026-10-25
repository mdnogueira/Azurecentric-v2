---
title: "Investigate a time synchronisation problem on Windows Server"
description: "Troubleshoot Windows Server time drift by querying W32Time state, verifying the AD DS hierarchy, and forcing a resync."
pubDate: 2025-10-13
category: windows-server
tags: ["windows-server", "troubleshooting", "time-synchronisation", "w32time", "active-directory"]
translationKey: investigate-a-time-synchronisation-problem-on-windows-server
draft: false
---

Time drift on a Windows Server can break Kerberos authentication, cause replication failures, or corrupt time-stamped logs. Before adjusting configuration, you need to know exactly what the server is doing with its clock. The Windows Time service (W32Time) handles this, but its default behaviour assumes a healthy Active Directory Domain Services (AD DS) hierarchy. When that assumption fails, symptoms appear as subtle drift or sudden jumps.

The first step is to inspect the current state. You do not need to guess which source the server is using or whether the service is running correctly. The `w32tm` command-line tool provides a clear view of the runtime configuration and the actual source being used.

## Check the current time source and configuration

Open an elevated Command Prompt. Run the following query to see the active time source:

```cmd
w32tm /query /source
```

If the output is `VM IC Time Synchronization Provider`, the server is synchronising with the Hyper-V host. For a member server, this is often acceptable, though the domain hierarchy is the preferred source. For a domain controller, synchronising with the host can cause skew during snapshots or restores, so it is recommended to partially disable host time synchronisation for domain controllers to protect the domain hierarchy ([Windows Time Service](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service)(https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service)).

If the output is a domain controller name or an external NTP server, note that name. It tells you where the time is coming from.

Next, check the configuration to understand why that source is selected:

```cmd
w32tm /query /configuration /verbose
```

Look for the `Type` field. For most domain-joined computers, this should be `NT5DS`. This means the server is configured to synchronise from the domain hierarchy ([Windows Time Service Tools and Settings](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/Windows-Time-Service-Tools-and-Settings)(https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings)). If it is `NTP`, the server is manually configured to use an external source, which might be intentional for a workgroup server or a misconfiguration for a domain member.

The `/verbose` flag also reveals the `Poll Interval` and `Phase Offset`. A large phase offset indicates recent drift. The `Stratum` value indicates how many hops away the source is from the reference clock ([How the Windows Time Service Works](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/How-the-Windows-Time-Service-Works)(https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/how-the-windows-time-service-works)). In an AD DS environment, the hierarchy usually keeps stratum numbers low, but W32Time algorithms select the best source based on accuracy and network conditions, not just stratum level.

## Verify the domain hierarchy

If the source is a domain controller, the next check is whether that controller is itself synchronised correctly. In an AD DS forest, time flows from the Primary Domain Controller (PDC) emulator in the forest root domain down to child domains and member servers. The PDC emulator in the root domain is configured to synchronise with an external time source, typically via the registry or Group Policy.

If you are troubleshooting a member server, you can monitor the time sync status of computers in the domain:

```cmd
w32tm /monitor /domain:yourdomain.com
```

This command queries the time sources of domain controllers and member servers. It shows the offset and whether the sync was successful. If you see large offsets or errors, the problem might be upstream. Check the PDC emulator in the root domain first. If the PDC emulator is synchronising with an external source, verify that source is reachable and accurate.

If the server is not domain-joined, it defaults to `time.windows.com`. In isolated networks or air-gapped environments, this source is unreachable, leading to drift. In such cases, you must configure a manual peer list ([How the Windows Time Service Works](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/How-the-Windows-Time-Service-Works)(https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/how-the-windows-time-service-works)).

## Resynchronise and verify

If the configuration looks correct but the time is still drifting, force a resynchronisation. This discards accumulated error statistics and attempts a fresh sync:

```cmd
w32tm /resync
```

If the server is domain-joined and the source is a domain controller, this command should succeed quickly. If it fails, check the event log for W32Time errors. Common issues include network connectivity problems, firewall blocking UDP port 123, or authentication failures if the server is in a different forest without proper trust ([How the Windows Time Service Works](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/How-the-Windows-Time-Service-Works)(https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/how-the-windows-time-service-works)).

After resynchronising, verify the result:

```cmd
w32tm /query /status /verbose
```

Look at the `Last Successful Sync Time` and `Phase Offset`. The phase offset should be small, typically in milliseconds or microseconds. If the offset is still large, the server might be struggling to converge. Check the Windows Event Log for W32Time errors (e.g., Event IDs 24, 29, 38 mentioned in [Windows Time Service](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service)(https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service)) for detailed failure reasons.

If the server is a domain controller and you suspect it is not acting as an authoritative source for its domain, you might need to configure it as reliable. This is done via the registry or Group Policy, but for troubleshooting, ensure the PDC emulator is correctly configured first. Misconfigured domain controllers can cause widespread time issues.

## Common pitfalls

- **Virtualisation:** If the server is a virtual machine, ensure that time synchronisation with the host is configured correctly. For domain controllers, it is recommended to partially disable host time synchronisation to prevent skew during snapshots. For member servers, host synchronisation is often acceptable, but the domain hierarchy is the primary source.
- **Firewall:** W32Time uses UDP port 123. Ensure this port is open for outbound (client) and inbound (server) traffic as needed ([Windows Time Service Tools and Settings](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/Windows-Time-Service-Tools-and-Settings)(https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings)).
- **Manual vs. Domain:** Do not mix manual NTP peers with domain hierarchy synchronisation on the same server unless explicitly required. The `Type` setting determines which mechanism is active.
- **Stratum:** Remember that stratum levels indicate distance from the reference clock. A stratum 1 source is a reference clock itself. Stratum 2 sources synchronise with stratum 1, and so on. In AD DS, the hierarchy manages this automatically, and W32Time algorithms select the best source based on accuracy and network conditions.

Start with the query commands. They provide the evidence you need to decide whether to adjust configuration, check network connectivity, or look upstream in the domain hierarchy. Avoid changing settings until you understand the current state.



References for Investigate a time synchronisation problem on Windows Server: [How the Windows Time Service Works](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/How-the-Windows-Time-Service-Works), [Windows Time Service Tools and Settings](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/Windows-Time-Service-Tools-and-Settings), [Windows Time Service](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service).
