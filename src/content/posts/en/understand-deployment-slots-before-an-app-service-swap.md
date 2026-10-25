---
title: "Understand deployment slots before an App Service swap"
description: "Understand App Service deployment slots: tier limits, sticky settings, and the swap process to prevent downtime."
pubDate: 2024-12-09
category: apps
tags: ["azure-app-service", "deployment-slots", "zero-downtime", "configuration-management", "swap-operations"]
translationKey: understand-deployment-slots-before-an-app-service-swap
draft: false
---

You are planning a deployment to Azure App Service and want to avoid downtime. The standard approach is to use a deployment slot. However, slots are not just empty containers for code; they are live applications with their own hostnames, configurations, and compute resources. If you treat a slot as a simple staging area without understanding how configuration elements behave during a swap, or the billing implications of running it, you risk introducing production issues or unexpected billing charges.

The core question is not just "how do I create a slot?" but "how do I ensure the slot behaves like production before I swap, and what happens to my settings when I do?"

[![App Service Slot Swap Flow](/images/posts/2024/azc-123-checkpoints.svg)](/images/posts/2024/azc-123-checkpoints.svg)

## Compute costs and tier limitations

Deployment slots are not available on every App Service plan. You must be running in the **Standard**, **Premium**, or **Isolated** tier to enable multiple slots. The **Basic** and **Free** tiers do not support this feature. If your app is currently on a lower tier, you will need to upgrade it before you can add a slot [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

Crucially, deployment slots share the compute resources of the underlying App Service plan. There is no extra charge for using deployment slots, but the plan must have enough capacity to handle the combined load of all active slots [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots). This means that while a slot is active, you are paying for the full App Service plan capacity, but you are not paying for additional instances specifically for the slot itself.

Each tier supports a different maximum number of slots. For example, the Standard tier supports up to five slots, while Premium and Isolated tiers support more. If you are scaling an existing app that already uses many slots, ensure your target tier can accommodate that count [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

You also need appropriate permissions. To create, swap, or manage slots, you generally need Contributor or Owner rights on the resource group or subscription, or specific role-based access control (RBAC) permissions for the `Microsoft.Web/sites/slots` resource provider operations [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

## Creating and configuring a slot

A deployment slot is a live app with its own hostname. The URL format is `http://sitename-slotname.azurewebsites.net`. Because of DNS length limits, the combined site name and slot name must be fewer than 59 characters, and the site name is truncated at 40 characters if necessary [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

When you create a new slot, it starts with no content. You must deploy your application code to it separately. However, you can clone configuration settings from an existing slot, such as production. This includes app settings, connection strings, language framework versions, and platform bitness [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

| Action | Portal | CLI | PowerShell |
|---|---|---|---|
| Create Slot | **Deployment slots** > **Add Slot** | `az webapp deployment slot create` | `New-AzWebAppSlot` |
| Swap Slots | **Deployment slots** > **Swap** | `az webapp deployment slot swap` | `Switch-AzWebAppSlot` |

*Illustrative example: The following CLI command creates a slot named `staging` for an app named `myapp` in the resource group `myrg`. This code is illustrative and assumes the app is on a supported tier.*

```azurecli-interactive
az webapp deployment slot create --name myapp --resource-group myrg --slot staging
```

Once created, the slot has its own management page. You can deploy code to it using Git, FTPS, or CI/CD pipelines. Note that a private endpoint is not cloned across slots, so you must configure network access separately if required [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

## Understanding configuration stickiness

This is the most critical aspect of slot management. When you swap two slots, not all configuration settings are swapped. Some settings are "sticky" to the slot, meaning they stay with the slot name, while others follow the content (the code) across the swap.

**Settings that are swapped:**
*   Language stack and version
*   App settings and connection strings (unless marked as sticky)
*   Mounted storage accounts (unless marked as sticky)
*   Handler mappings
*   Public certificates
*   WebJobs content

**Settings that are NOT swapped (sticky):**
*   Scale settings
*   IP restrictions
*   Always On
*   Diagnostic settings
*   CORS settings
*   Virtual network integration
*   Managed identities
*   Custom domain names and non-public certificates

You can explicitly mark an app setting or connection string as sticky by selecting the **deployment slot setting** checkbox in the Azure portal. This tells App Service that the setting should not be swapped [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

If you need to change the default behaviour for certain settings, you can add the app setting `WEBSITE_OVERRIDE_PRESERVE_DEFAULT_STICKY_SLOT_SETTINGS` with a value of `0` or `false` to every slot. This makes the listed non-swappable settings swappable. However, this is an all-or-nothing override for those settings; you cannot make just some of them swappable. Managed identities remain sticky to the slot and are not affected by the `WEBSITE_OVERRIDE_PRESERVE_DEFAULT_STICKY_SLOT_SETTINGS` override [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

## The swap process and warm-up

A swap is not an instantaneous switch. App Service performs a multi-phase process to ensure reduced interruption.

1.  **Apply Settings:** App Service applies the target slot's (e.g., production) sticky settings to the source slot (e.g., staging). This triggers a restart of all instances in the source slot.
2.  **Warm-up:** If local cache is enabled, App Service triggers local cache initialization by hitting the application root on each instance. If auto swap is configured with custom warm-up, it runs the specified warm-up logic. Instances must return an HTTP response to be considered warmed up [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).
3.  **Swap Routing:** Once all instances are warmed up, App Service swaps the routing rules. The source slot now receives production traffic, and the target slot receives the previous production app.
4.  **Recycle:** The instances in the former production slot (now staging) are recycled. Any long-running operations in your application code will be abandoned during this recycle. Your code must be fault-tolerant to handle this [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

If any instance fails to restart during the warm-up phase, the swap operation reverts all changes to the source slot and stops. This prevents a broken application from entering production [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

## Swap with preview

For critical applications, you can use a swap with preview (multi-phase swap). This pauses the swap after the first phase (applying settings and restarting the source slot). You can then validate that the source slot works correctly with the production settings before completing the swap.

If you cancel the swap, App Service reapplies the original configuration to the source slot. Note that swap with preview cannot be used if site authentication is enabled on either slot [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

*Illustrative example: The following PowerShell command initiates a swap with preview. It applies the production settings to the staging slot but pauses before completing the swap.*

```powershell
Switch-AzWebAppSlot -SourceSlotName "staging" -DestinationSlotName "production" -ResourceGroupName "myrg" -Name "myapp" -SwapWithPreviewAction ApplySlotConfig
```

## Rollback and auto swap

If you swap into production and find issues, you can roll back by swapping the same two slots again. The slot that now holds the previous production app (staging) will swap back into production, restoring the last known good state [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

Auto swap can automate this process. When enabled, App Service automatically swaps the slot into production after it is warmed up. This is useful for CI/CD pipelines where pre-swap validation is not needed. However, auto swap is not supported for web apps on Linux or Web Apps for Containers [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

Before configuring auto swap, consider testing it on a non-production target slot first. Also, remember that auto swap triggers the full warm-up and swap process, including the recycle of the former production instances [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).

## Verification

After a swap, verify the following:
1.  **Traffic:** Confirm that the production hostname now serves the new code.
2.  **Settings:** Check that the expected app settings and connection strings are present in the production slot.
3.  **Sticky Settings:** Ensure that IP restrictions, diagnostic settings, and other sticky settings remain unchanged.
4.  **Health:** Monitor the application logs and performance metrics to ensure the warm-up completed successfully and no instances failed to restart.

If you encounter issues, check the swap history in the Azure portal for any error messages related to instance restarts or warm-up failures [Set up staging environments](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots).
