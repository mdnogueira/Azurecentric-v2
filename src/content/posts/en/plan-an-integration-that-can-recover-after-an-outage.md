---
title: "Plan an integration that can recover after an outage"
description: "Plan integration recovery using Service Bus replication, API Management backup/restore, and Logic Apps error handling."
pubDate: 2026-08-17
category: apps
tags: ["azure-service-bus", "api-management", "logic-apps", "disaster-recovery", "resilience"]
translationKey: plan-an-integration-that-can-recover-after-an-outage
draft: false
---

When a dependent service goes down, your integration logic needs a clear path to recovery. Relying on a single namespace or instance creates a single point of failure. To plan for outages, you need to combine message replication, configuration backup, and workflow error handling. Each component requires a different strategy.

## Replicate messages across Service Bus namespaces

If your application depends on Azure Service Bus, you can insulate it against outages by deploying multiple namespaces. The documentation distinguishes between two general-purpose patterns: active and passive replication. These are not built-in Service Bus features but application-level logic that you implement in your sender and receiver clients.

Active replication sends every message to both the primary and secondary namespaces. The sender tags each message with a unique identifier, such as `ServiceBusMessage.MessageId`. The receiver processes the first copy and suppresses duplicates. This approach doubles the operation count and cost, but it ensures that if one namespace fails, the other is already populated.

Passive replication is more economical. The sender writes only to the active namespace. If that write fails with an error indicating unavailability, the sender retries against the backup namespace. The roles then switch. The receiver must still handle potential duplicates, as a message might have been processed by the primary before the failure was detected, or the primary might process it after the secondary receives a retry.

The [Azure Messaging Replication Tasks with .NET Core](https://github.com/Azure-Samples/azure-messaging-replication-dotnet) sample demonstrates this logic. You must implement the duplicate detection and role-switching logic in your client code. Service Bus does not provide this automatically.

## Backup and restore API Management configuration

Azure API Management instances do not replicate configuration automatically across regions. To recover from a regional outage, you must back up the service configuration to an Azure storage account and restore it to a standby instance in another region.

Backup and restore operations are supported in the Developer, Basic, Standard, and Premium tiers. They are not supported for instances with associated workspace gateways. Each backup expires after 30 days. If you attempt to restore an expired backup, the operation fails.

You can configure access to the storage account using either a storage access key or a managed identity. Using a managed identity is preferred for security. You must assign the `Storage Blob Data Contributor` role to the API Management managed identity, scoped to the storage account.

The backup process is asynchronous. During the backup, the API Management service state is `Updating`, but the gateway continues to handle requests. The restore operation also takes time. While the service is updating, you cannot make other infrastructure changes, but you can configure APIs, products, and policies. The restore operation does not change the custom hostname configuration of the target service. Therefore, you should use the same custom hostname and TLS certificate for both the active and standby services. This allows you to redirect traffic by updating a DNS CNAME record after the restore completes.

## Handle workflow errors in Logic Apps

Azure Logic Apps provides built-in mechanisms for handling errors and exceptions. You can use retry policies to automatically resend failed requests. The default retry policy for most operations is an exponential interval policy with up to 4 retries, scaling by 7.5 seconds and capped between 5 and 45 seconds.

You can change the retry policy type to `fixed` or `exponential` and specify the interval and count. For example, you might set a fixed interval of 30 seconds for 2 retries.

```json
{
  "Get_latest_news": {
    "type": "Http",
    "inputs": {
      "method": "GET",
      "uri": "https://mynews.example.com/latest",
      "retryPolicy": {
        "type": "fixed",
        "interval": "PT30S",
        "count": 2
      }
    }
  }
}
```

This code is an illustrative example. You must verify the specific limits for your Logic Apps tier (Consumption or Standard) before deploying.

You can also manage the "run after" behavior of actions. By default, an action runs only if the predecessor succeeds. You can change this to run if the predecessor fails, is skipped, or times out. This allows you to implement error handling branches. For example, you can send an email notification if an HTTP action fails.

:::image type="content" source="/images/posts/2026/azc-343-learn-1.png" alt-text="Screenshot shows list for Select actions with predecessor operations." lightbox="/images/posts/2026/azc-343-learn-1.png":::

To verify your error handling, check the run history in the Logic Apps designer. Ensure that the error branch executes as expected and that the retry policy behaves according to your configuration.

## Verify your recovery plan

A recovery plan is only as good as its verification. Test your Service Bus replication logic in a non-production environment. Confirm that the receiver correctly suppresses duplicates and that the sender switches namespaces on failure.

Test your API Management backup and restore process. Create a backup, then restore it to a standby instance. Verify that the configuration matches the original. Check that the custom hostname resolves correctly after the DNS change.

Test your Logic Apps error handling. Trigger a failure in an HTTP action and verify that the retry policy executes the correct number of times. Check that the error branch executes and sends the notification.

Document your recovery time objectives and recovery point objectives. Align your replication and backup strategies with these requirements. Regularly review and update your plan as your integration architecture evolves.

References for Plan an integration that can recover after an outage: [Use Multiple Azure Service Bus Namespaces to Insulate Applications against Outages and Disasters](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-outages-disasters), [Backup and restore your Azure API Management instance for disaster recovery](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-disaster-recovery-backup-restore), [Handle Workflow Errors and Exceptions](https://learn.microsoft.com/en-us/azure/logic-apps/error-exception-handling).
