---
title: "Connect Sentinel incidents with Defender XDR context"
description: "Connect Defender XDR incidents to Sentinel: enable the connector, manage sync limits, and migrate automation rules."
pubDate: 2025-11-02
category: governance
tags: ["microsoft-sentinel", "defender-xdr", "incident-management", "security-operations", "azure-portal", "kql"]
translationKey: connect-sentinel-incidents-with-defender-xdr-context
draft: true
---

You have alerts in Microsoft Defender XDR and incidents in Microsoft Sentinel. The question is how to bring them together so that a single incident in Sentinel carries the full context from Defender XDR, without creating duplicates or losing the ability to investigate.

The answer is to enable the Microsoft Defender XDR data connector in Microsoft Sentinel. This connector streams incidents, alerts, and advanced hunting events into Sentinel and keeps them bi-directionally synchronized. It is the foundation for a unified incident queue where Defender XDR acts as the correlation engine and Sentinel acts as the central management plane for all security signals.

[![Defender XDR to Sentinel Incident Flow](/images/posts/2025/azc-240-checkpoints.svg)](/images/posts/2025/azc-240-checkpoints.svg)

## Why use the Defender XDR connector?

Defender XDR groups alerts from multiple components—Endpoint, Identity, Office 365, Cloud Apps, and others—into unified incidents. By connecting these to Sentinel, you gain:

- **A single incident queue**: Defender XDR incidents appear in the Sentinel incidents list alongside incidents from other data sources.
- **Bi-directional sync**: Changes to status, owner, comments, and classification in either portal reflect in the other, though a refresh might be required to see the latest changes.
- **Context preservation**: Each Sentinel incident includes the alerts, entities, and enrichment from Defender XDR.
- **Advanced hunting access**: Raw event data can be streamed into Sentinel for deeper investigation and longer retention.

This integration works whether you are using the Azure portal or the Microsoft Defender portal. If you onboard Sentinel to the Defender portal, the connector is set up automatically. If you stay in the Azure portal, you must enable it manually.

## Prerequisites and permissions

Before enabling the connector, ensure you have:

- A valid Microsoft Defender XDR license.
- The **Security Administrator** role on the tenant to stream logs, or equivalent permissions.
- Read and write permissions on the Microsoft Sentinel workspace.
- Membership in the same Microsoft Entra tenant as the Sentinel workspace.
- The **Microsoft Defender XDR** solution installed from the Sentinel Content Hub (required only in the Azure portal).

If you plan to sync on-premises Active Directory entities, you must also have Microsoft Defender for Identity onboarded and its sensor installed.

## Enable the connector in the Azure portal

If you are working in the Azure portal, follow these steps to connect incidents and alerts:

1. Open Microsoft Sentinel in the Azure portal and navigate to **Data connectors**.
2. Select **Microsoft Defender XDR** from the gallery and click **Open connector page**.
3. In the **Configuration** section, locate **Connect incidents and alerts**.
4. Mark the checkbox labeled **Turn off all Microsoft incident creation rules for these products. Recommended**. This prevents duplicate incidents by disabling Sentinel’s native incident creation rules for Defender XDR-integrated products.
5. Click **Connect incidents & alerts**.

The connector will now stream incidents from Defender XDR to Sentinel. Any previously connected individual connectors for Defender components (e.g., Defender for Endpoint, Defender for Office 365) are automatically disconnected in the background. They may still appear connected, but no data flows through them.

### Verify incident ingestion

To confirm that incidents are flowing, run this KQL query in Sentinel Logs:

```kusto
SecurityIncident
| where ProviderName == "Microsoft XDR"
```

You should see incidents with the product name **Microsoft XDR**. It can take up to 10 minutes for an incident generated in Defender XDR to appear in Sentinel.

### Optional: Connect entities and events

- **Connect entities**: To sync on-premises Active Directory user identities, select **Go to the UEBA configuration page**, enable UEBA if not already on, check **Active Directory (Preview)**, and click **Apply**.

- **Connect events**: To stream raw advanced hunting events, select the tables you wish to collect (e.g., DeviceEvents, EmailEvents, IdentityLogonEvents) and click **Apply Changes**. These events are ingested into purpose-built tables in your Sentinel workspace.

## Bi-directional sync and field mapping

Once connected, incidents are synchronized between Defender XDR and Sentinel. The following fields sync "as is":

- Title, Description, ProductName, Severity, Custom tags, AdditionalData, Comments (new only), LastModifiedBy

Other fields are transformed to comply with each platform’s schema. For example:

- **Status**: Active in Defender XDR maps to New in Sentinel.
- **Classification**: True Positive in Defender XDR maps to True Positive/Suspicious activity in Sentinel.

Incidents in Sentinel can hold a maximum of 150 alerts. If a Defender XDR incident has more, Sentinel shows **150+** and provides a link to the parallel incident in Defender XDR for full context.

## Impact on automation and rules

Enabling the Defender XDR connector disables Microsoft Sentinel’s incident creation rules for integrated products. This means:

## Ingestion costs

Alerts and incidents from Defender XDR are ingested into Sentinel at no charge. However, raw advanced hunting events (e.g., DeviceEvents, EmailEvents) are charged according to standard Sentinel pricing. Plan your event collection accordingly.

## Verification

Run `SecurityIncident | where ProviderName == "Microsoft XDR"` to confirm ingestion. If empty, wait up to 10 minutes for sync propagation.

References for Connect Sentinel incidents with Defender XDR context: [Connect Microsoft Defender XDR data to Microsoft Sentinel| Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/connect-microsoft-365-defender), [Microsoft Defender XDR integration with Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/microsoft-365-defender-sentinel-integration), [Migrate your Microsoft Sentinel alert-trigger playbooks to automation rules | Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/migrate-playbooks-to-automation-rules).
