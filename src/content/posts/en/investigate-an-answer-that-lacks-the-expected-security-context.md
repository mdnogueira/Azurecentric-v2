---
title: "Investigate an answer that lacks the expected security context"
description: "Troubleshoot why Security Copilot lacks context by verifying data availability in source systems and connector configuration."
pubDate: 2025-07-15
category: governance
tags: ["security-copilot", "connectors", "troubleshooting", "data-ingestion", "microsoft-sentinel", "m365-defender"]
translationKey: investigate-an-answer-that-lacks-the-expected-security-context
draft: false
---

You ask Microsoft Security Copilot about a specific alert or resource, and the answer feels generic. It lacks the specific details you expect from your environment. This usually means the assistant cannot access the data it needs to ground its response. Security Copilot integrates with data sources like Microsoft Sentinel and Microsoft 365 Defender through connectors. If those connectors are not active, misconfigured, or if the relevant data does not exist in the source systems, the copilot will default to general knowledge rather than your specific tenant state.

The first thing to check is whether the underlying data sources are active and contain the information you are querying. A connector being listed does not guarantee it is pulling data, nor does it guarantee the data exists in the source. You need to verify the health of the source systems and the configuration of the connectors.

## Verify Data Availability in Source Systems

Before investigating the copilot, confirm that the data you are asking about actually exists in the source system. If you are asking about a specific alert in Microsoft Sentinel, open the Sentinel workspace and search for that alert. If the alert is not there, the copilot cannot provide details about it.

This step isolates whether the issue is with the copilot's access to data or with the data itself. If the data is missing from the source, the problem lies with the source system's ingestion or retention policies, not the copilot's connectors.

## Check Connector Configuration

If the data exists in the source system, the next step is to verify that the connectors are correctly configured. Connector configuration is managed in the respective source portals or the Security Copilot admin settings, depending on the connector type. Refer to the Security Copilot connector documentation for specific configuration requirements for each connector.

Ensure that the correct workspaces, tenants, or subscriptions are selected. For Microsoft Sentinel, verify that the workspace is correctly linked. For Microsoft 365 Defender, ensure that the tenant is correctly identified. Check for any error messages or warnings in the connector settings. These can provide clues about why data is not being ingested. Common issues include network connectivity problems, authentication failures, or misconfigured scopes.

## Test with a Known Event

To isolate the issue, try asking a question about an event or resource you know exists and is recent. For example, if you have a recent alert in Microsoft Sentinel, ask Security Copilot for details about that specific alert ID. If the copilot still provides a generic answer, it confirms that the data is not being ingested or is not accessible.

If the copilot can answer correctly about the known event but not about your original query, the issue might be with the specific resource or alert you were asking about. It might not be indexed yet, or it might be outside the scope of the connected data.

## Review Permissions

The identity used by the connector must have sufficient permissions to read the data from the source systems. If permissions were recently changed, the connector might fail to ingest new data. Ensure that the connector identity has the necessary permissions to read the data. Check the Security Copilot connector documentation for specific permission requirements for each connector.

If the connectors are healthy and the scope is correct, but you still lack context, verify data availability in the source system (e.g., check for the alert in Sentinel) and review the Security Copilot connector documentation for specific configuration requirements.

References for Investigate an answer that lacks the expected security context: [README](https://github.com/Azure/Security-Copilot/blob/546fc8520e9443e311cc9df30ab5e0ac79301a9f/README.md).
