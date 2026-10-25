---
title: "Apply a baseline Windows Firewall configuration"
description: "Configure Windows Firewall for BranchCache and NPS on Server 2025 using documented ports and service configurations."
pubDate: 2025-05-03
category: windows-server
tags: ["windows-server-2025", "branchcache", "radius", "firewall", "nps"]
translationKey: apply-a-baseline-windows-firewall-configuration
draft: false
---

Windows Server 2025 includes Windows Defender Firewall with Advanced Security. If you are deploying BranchCache in distributed cache mode or running Network Policy Server (NPS), the default rules may not cover the specific traffic patterns these services require. You need to verify the local firewall configuration and, in some cases, apply specific exceptions.

## Prerequisites and Permissions

You need membership in the **Administrators** group on the target server to modify firewall rules. If you are configuring a non-domain member, manual configuration is required. If the server is domain-joined and BranchCache is managed via Group Policy, the policy settings will override any manual firewall rules applied to that client [Configure Firewall Rules for Non-Domain Members to Allow BranchCache Traffic](https://learn.microsoft.com/en-us/windows-server/networking/branchcache/deploy/configure-firewall-rules-for-non-domain-members-to-allow-branchcache-traffic).

For NPS, the firewall exceptions are typically created automatically during installation. However, on Windows Server 2019, a specific service account configuration was required for these exceptions to function correctly with default ports. Without this change, the firewall would drop RADIUS traffic [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure). For Windows Server 2025, verify if the default firewall exceptions function correctly after NPS installation. Only apply the SID change if troubleshooting confirms traffic drops, citing the 2019 documentation as a reference for the legacy behavior.

## Configuring BranchCache Distributed Cache Traffic

BranchCache in distributed cache mode relies on two protocols: MS-PCCRD (discovery) and MS-PCCRR (retrieval). You must allow inbound and outbound traffic for both, including multicast traffic for discovery.

### MS-PCCRD: Peer Content Caching and Retrieval Discovery Protocol

This protocol uses WS-Discovery. You need to allow:

*   **Multicast Traffic:**
    *   IPv4: `239.255.255.250`
    *   IPv6: `FF02::C`
*   **Inbound Traffic:**
    *   Local Port: `3702`
    *   Remote Port: `ephemeral`
*   **Outbound Traffic:**
    *   Local Port: `ephemeral`
    *   Remote Port: `3702`
*   **Program:** `%systemroot%\system32\svchost.exe` (BranchCache Service [PeerDistSvc]) [Configure Firewall Rules for Non-Domain Members to Allow BranchCache Traffic](https://learn.microsoft.com/en-us/windows-server/networking/branchcache/deploy/configure-firewall-rules-for-non-domain-members-to-allow-branchcache-traffic)

### MS-PCCRR: Peer Content Caching and Retrieval: Retrieval Protocol

This protocol uses HTTP 1.1 (RFC 2616). You need to allow:

*   **Inbound Traffic:**
    *   Local Port: `80`
    *   Remote Port: `ephemeral`
*   **Outbound Traffic:**
    *   Local Port: `ephemeral`
    *   Remote Port: `80` [Configure Firewall Rules for Non-Domain Members to Allow BranchCache Traffic](https://learn.microsoft.com/en-us/windows-server/networking/branchcache/deploy/configure-firewall-rules-for-non-domain-members-to-allow-branchcache-traffic)

You can implement these rules using `netsh advfirewall firewall` commands or via Group Policy. If using Group Policy, ensure the policy is applied to the correct Organizational Unit.

## Configuring NPS RADIUS Traffic

NPS uses UDP ports for authentication and accounting. The default ports are:

*   **Authentication:** UDP 1812 (and legacy UDP 1645)
*   **Accounting:** UDP 1813 (and legacy UDP 1646) [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure)

### Service Account Configuration

On Windows Server 2019, the IAS (RADIUS) service shared the `NETWORK SERVICE` account by default, which caused the firewall to drop RADIUS traffic because the firewall rule expected a unique SID. The documented fix was to change the service to use a unique SID using `sc sidtype IAS unrestricted` [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure). 

For Windows Server 2025, verify if the default firewall exceptions function correctly after NPS installation. If you encounter traffic drops, you can apply the SID change as a troubleshooting step, but it is not a universal requirement for 2025.

### Firewall Exceptions

If you are using the default ports (1812 and 1813), Windows Defender Firewall should automatically create exceptions during NPS installation. However, you should verify these rules exist and are enabled.

If you have changed the NPS ports, you must:

1.  Remove the existing exceptions for the default ports.
2.  Create new exceptions for the custom ports [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure).

### External Firewall Configuration

If your NPS server is behind a perimeter firewall, you must configure input and output filters on the firewall interfaces. For example, on the Internet interface, you need to allow:

*   **Input Filters:**
    *   Destination IP: NPS perimeter interface IP
    *   Destination Port: UDP 1812 (authentication) and 1813 (accounting)
    *   Optional: UDP 1645 and 1646 for older clients [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure)
*   **Output Filters:**
    *   Source IP: NPS perimeter interface IP
    *   Source Port: UDP 1812 and 1813
    *   Optional: UDP 1645 and 1646 [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure)

You can restrict these filters further by specifying the source IP addresses of the RADIUS clients for added security [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure).

## Verification

### BranchCache Verification

1.  On a client configured for distributed cache mode, open a command prompt and run:
    ```cmd
    netsh advfirewall firewall show rule name=all | findstr /i "BranchCache"
    ```
2.  Verify that rules for MS-PCCRD and MS-PCCRR are present and enabled.
3.  Use the BranchCache diagnostic tools or check the BranchCache event logs to confirm that clients are discovering and retrieving content from the cache server [Configure Firewall Rules for Non-Domain Members to Allow BranchCache Traffic](https://learn.microsoft.com/en-us/windows-server/networking/branchcache/deploy/configure-firewall-rules-for-non-domain-members-to-allow-branchcache-traffic).

### NPS Verification

1.  Verify the IAS service SID type:
    ```cmd
    sc qc IAS
    ```
    Ensure the `SERVICE_START_NAME` is `LocalSystem` and the SID type is unrestricted if you applied the fix [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure).
2.  Check the firewall rules:
    ```cmd
    netsh advfirewall firewall show rule name=all | findstr /i "Network Policy Server"
    ```
3.  Test authentication by attempting a network access request from a client. Check the NPS logs on the server to confirm successful authentication and accounting [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure).

## Cleanup

If you are testing in a non-production environment, you can remove the custom firewall rules using `netsh advfirewall firewall delete rule name="BranchCache-DC-In-TCP"` and `netsh advfirewall firewall delete rule name="BranchCache-DC-Out-TCP"`. Be aware that deleting rules by name is destructive and requires exact matches. If you applied the IAS service SID change, you can revert it using:

```cmd
sc sidtype IAS restricted
```

This command resets the IAS service to use the default restricted SID, restoring the original `NETWORK SERVICE` account behavior [Configure Firewalls for RADIUS Traffic](https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-firewalls-configure).

Verify BranchCache functionality using the BranchCache diagnostic tools.
