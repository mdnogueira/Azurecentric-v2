---
title: "Check outbound network requirements for Azure Arc agents"
description: "Check Azure Arc agent connectivity from the server, distinguish public and private endpoint requirements, and record DNS, proxy and firewall evidence."
pubDate: 2024-03-09
category: cloud
tags: [azure-arc, networking, connected-machine-agent, private-link]
translationKey: check-outbound-network-requirements-for-azure-arc-agents
draft: false
---

An Azure Arc onboarding failure can begin well before the server attempts to register. DNS resolution, the egress route and the required service endpoints all need to work from that machine. A successful browser session on an administrator's laptop does not establish the server's connectivity.

Check the path in stages and retain the results. The Connected Machine agent's [network requirements](https://learn.microsoft.com/en-us/azure/azure-arc/servers/network-requirements) describe outbound HTTPS communication over TCP 443, with different dependencies for installation, ongoing management and optional features.

## Record the intended connection path

Identify the server, Azure cloud and region where its Arc resource will be registered. Confirm whether the agent should use direct public connectivity, an approved proxy or an Azure Arc Private Link Scope.

Use the documentation for that cloud. Public Azure, Azure Government and Azure operated by 21Vianet do not use identical endpoint names.

Record the installed agent version and planned features as well. Core Arc connectivity, extension downloads, Azure Monitor and remote-management features can have different dependencies. The network review should match what the machine will actually use.

A proxy can provide the organisation's controlled egress route, but the agent must be configured to use it correctly. The Connected Machine agent does not support using the Log Analytics gateway as its proxy. Do not assume that an existing monitoring gateway provides the required Arc path.

## Separate the endpoint groups

For public Azure, the documented endpoint list includes these groups:

| Purpose | Examples | What to check |
|---|---|---|
| Installation | `aka.ms`, `download.microsoft.com`, `packages.microsoft.com` | The script and appropriate Windows or Linux package can be obtained |
| Identity | `login.microsoftonline.com` and other listed identity endpoints | Authentication dependencies remain reachable |
| Resource management | `management.azure.com` | The connection and disconnection operations can reach Azure Resource Manager |
| Arc services | `*.his.arc.azure.com` and `*.guestconfiguration.azure.com` | The intended public or private path works |
| Additional features | Notification, extension and service-specific endpoints | Requirements match the enabled features |

This is a planning summary, not a replacement for the complete endpoint list. Wildcard entries represent service endpoints, not hostnames to paste literally into a DNS test.

If the firewall uses IP-based rules, review Microsoft's service-tag guidance and the update process. Do not convert a changing service dependency into an unmanaged static address list.

## Run the agent's connectivity check

The [`azcmagent check` command](https://learn.microsoft.com/en-us/azure/azure-arc/servers/azcmagent-check) tests the required network endpoints and reports the results, including proxy and private-endpoint use.

From a shell where the installed agent command is available, this illustrative command checks public connectivity for an example region:

```powershell
azcmagent check --location "eastus"
```

Use the intended region and cloud rather than copying the example unchanged. On an already connected machine, `azcmagent check` can use its configured cloud and region.

For a server intended to use an Arc Private Link Scope, the documented option also checks whether supported Arc endpoints resolve to private addresses:

```powershell
azcmagent check --location "eastus" --enable-pls-check
```

Neither command has been executed against an Arc-enabled server for this article. Keep the actual output with the network change and investigate each failed endpoint rather than treating one successful HTTPS connection as a complete check.

## Keep Private Link boundaries explicit

An Arc Private Link Scope does not put every Azure dependency behind its private endpoint. Microsoft's [Private Link guidance](https://learn.microsoft.com/en-us/azure/azure-arc/servers/private-link-security) states that Microsoft Entra ID traffic continues to use the normal Internet route. Azure Resource Manager traffic also remains outside the Arc scope; its optional resource-management Private Link configuration is separate.

Services such as Azure Monitor need their own supported private connectivity configuration. Successful Arc registration does not validate those additional paths.

For the Arc endpoints that should resolve privately, check DNS from the server using its normal resolver path. Compare the returned addresses with the private endpoint's DNS configuration, then check routing to those addresses. A correct record in Azure is not sufficient if an on-premises resolver cannot obtain it.

Review the scope association as well. DNS can direct a machine to a private endpoint while the machine is not associated with the required scope. Keep those two configuration steps distinct.

## Use the results to narrow the fault

If name resolution fails, investigate DNS before changing firewall rules. If resolution succeeds but connection checks fail, inspect the selected route, proxy configuration and relevant firewall evidence.

A basic TCP connection test establishes less than a complete agent operation. Keep certificate and HTTPS failures separate from an inability to reach the destination port, and investigate them through the approved network controls.

After the required changes, rerun the agent check and confirm the Arc resource's connection state. Then verify the additional management features the server needs. Retain the endpoint requirements, test results and rule ownership so the next network change can be assessed against a known configuration.

