---
title: "Plan a rollback that includes application configuration"
description: "Plan a rollback for App Service slots by managing sticky configuration and using swap with preview to validate settings before traffic switches."
pubDate: 2026-08-03
category: apps
tags: ["azure-app-service", "deployment-slots", "rollback", "configuration-management", "swap-with-preview"]
translationKey: plan-a-rollback-that-includes-application-configuration
draft: false
---

You have swapped a staging slot into production, and the application is failing. The immediate instinct is often to swap back immediately. That works for the code, but it leaves the configuration in a state that may not match your expectations. If you need to roll back an application that includes specific configuration changes, you must plan for the swap mechanics before you execute the first swap.

The core issue is that deployment slots do not treat all configuration equally. Some settings move with the code when you swap slots; others stay behind in the slot they were originally defined in. If your rollback plan assumes a simple "undo" button, you may find that the previous version of the app is running with the new configuration, or vice versa. This mismatch is a common source of post-swap instability.

[![Slot Swap Configuration Flow](/images/posts/2026/azc-338-checkpoints.svg)](/images/posts/2026/azc-338-checkpoints.svg)

## Understand which settings move and which stay

Before you configure your slots, you need to know how App Service handles configuration during a swap. When you swap two slots, the platform applies specific settings from the target slot (usually production) to the source slot (staging) before the traffic switch. These are the settings that are "swapped".

According to Microsoft's documentation on deployment slots, the following elements are swapped:

- Language stack and version
- App settings and connection strings (unless configured to stick to a slot)
- Mounted storage accounts
- Handler mappings
- Public certificates
- WebJobs content
- Hybrid connections, service endpoints, and Azure CDN settings
- Path mappings
- Virtual network integration

Conversely, these settings are **not** swapped and remain in their original slots:

- General settings not listed above
- Publishing endpoints
- Custom domain names
- Nonpublic certificates and TLS/SSL settings
- Scale settings
- WebJobs schedulers
- IP restrictions
- Always On
- Diagnostic settings
- Cross-origin resource sharing (CORS)
- Managed identities and related settings
- Settings created by Service Connector

This distinction is critical for rollback planning. If you changed an app setting in the staging slot to test a new feature, that setting will swap into production. If you then swap back, the old code returns, but it brings the new setting with it. If that setting is incompatible with the old code, your rollback fails.

To control this behaviour, you can mark specific app settings and connection strings as "sticky" to a slot. Sticky settings do not swap. They remain in the slot where they were defined. This is the primary mechanism for isolating configuration changes from code changes during a rollback.

## Plan the rollback using swap with preview

A standard swap is a single atomic operation. If you need to validate configuration changes before committing to them, or if you want to ensure your rollback path is clear, use the "swap with preview" feature. This multi-phase swap allows you to apply the target slot's configuration to the source slot, pause, and then complete the swap.

The process works like this:

1. **Phase 1 (Apply Configuration):** App Service applies the target slot's configuration to the source slot. This triggers a restart of the instances in the source slot. The swap operation pauses.
2. **Validation:** You can now verify that the source slot is running with the expected configuration. If you are planning a rollback, this is the point to check that your sticky settings are behaving as intended.
3. **Phase 2 (Complete Swap):** If validation passes, you complete the swap. The traffic is redirected, and the slots exchange their code and swapped settings.

If you cancel the swap after Phase 1, App Service reapplies the original configuration to the source slot. This provides a safety net for configuration errors.

> [!NOTE]
> You cannot use swap with preview if site authentication is enabled in one of the slots. If you need this feature, you must use a standard swap or disable authentication temporarily during the operation.

## Execute the rollback

If your application is already in production with the wrong configuration, the rollback procedure is straightforward but requires attention to detail.

### Step 1: Verify current state

Check the configuration of both the production slot and the staging slot. Identify which settings are sticky and which are swapped. If you have not pre-configured sticky settings, you may need to do so now if time permits, but note that changes to sticky settings do not take effect until the next restart.

### Step 2: Perform the rollback swap

To roll back, you simply swap the slots again. The slot that currently holds the production code becomes the staging slot, and the slot that holds the previous production code becomes the production slot.

In the Azure portal, go to **Deployment slots**, select **Swap**, and ensure the source is the current production slot and the target is the previous staging slot (which holds the old code). 

If you want to validate the configuration before completing the swap, select **Perform swap with preview**. This will apply the production slot's configuration to the staging slot (which holds the old code). You can then verify that the old code is running with the old configuration. If you are confident, select **Complete Swap**.

### Step 3: Verify the rollback

After the swap, verify that:

- The production slot is serving the old code.
- The production slot has the old configuration (if sticky settings were used correctly).
- The application is functioning as expected.

If the rollback fails, check the swap logs in the Azure portal for any errors during the configuration application or restart phases.

## Limitations and considerations

- **Auto Swap:** Auto swap is not supported for web apps on Linux or Web App for Containers. If you are using these platforms, you must manage swaps manually.
- **Private Endpoints:** Private endpoints are not cloned across slots. If your staging slot requires a private endpoint, you must configure it separately.
- **Permissions:** You need appropriate permissions to perform slot operations. Refer to the [Resource provider operations](https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/web-and-mobile#microsoftweb) for details.
- **Long-running operations:** If your application has long-running operations, they will be abandoned when the workers recycle during a swap. Ensure your application is fault-tolerant.

By understanding which settings swap and which stay, and by using swap with preview to validate your configuration, you can plan a rollback that minimises risk and ensures your application returns to a known good state.


References for Plan a rollback that includes application configuration: [Set Up Staging Environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).
