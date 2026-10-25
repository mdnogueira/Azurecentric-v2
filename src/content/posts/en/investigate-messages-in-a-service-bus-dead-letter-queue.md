---
title: "Investigate messages in a Service Bus dead-letter queue"
description: "How to inspect Service Bus dead-letter queues, identify failure reasons, and verify the fix."
pubDate: 2024-10-26
category: apps
tags: ["service-bus", "dead-letter-queue", "troubleshooting", "azure-cli", "dotnet"]
translationKey: investigate-messages-in-a-service-bus-dead-letter-queue
draft: false
---

You have messages stuck in a Service Bus dead-letter queue (DLQ). The immediate question is not how to clear them, but why they ended up there. Service Bus moves messages to the DLQ when they cannot be delivered or processed. Without inspecting the specific reason codes attached to those messages, any attempt to reprocess them will likely fail again.

The DLQ is a secondary subqueue that exists automatically for every queue and topic subscription. You do not create it, and you cannot delete it independently of the parent entity. Its purpose is to hold messages that the messaging engine cannot deliver or that your application could not process. Messages remain in the DLQ until you explicitly retrieve them and complete the dead-letter message. There is no automatic cleanup.

## Identify the dead-letter reason

The first step is to determine why the message was dead-lettered. Service Bus attaches two properties to every dead-lettered message: `DeadLetterReason` and `DeadLetterDescription`. These properties are set by the system when the messaging engine moves the message.

Common system-set reasons include:

- `MaxDeliveryCountExceeded`: The message could not be consumed after the maximum number of delivery attempts. The default limit is 10 attempts. This happens when a message is delivered under a peek-lock, but is either explicitly abandoned or the lock expires before the message is completed.
- `TTLExpiredException`: The message expired. When dead-lettering on message expiration is enabled, all expiring messages are moved to the DLQ. Deferred messages are not purged and moved to the DLQ after they expire; this is by design.
- `HeaderSizeExceeded`: The size quota for the message stream exceeded the limit.
- `Session ID is null`: A session-enabled entity received a message without a session identifier.
- `MaxTransferHopCountExceeded`: The message passed through more than four queues or topics in a chain. The maximum number of allowed hops is 4.

If your application explicitly dead-letters a message, it can define its own codes for the `DeadLetterReason` and `DeadLetterDescription` properties. It is good practice to include the type of exception and a stack trace in these properties to make troubleshooting easier. However, be aware that large stack traces might cause messages to exceed the 256 KB quota limit for the Standard Tier of Azure Service Bus.

## Access the dead-letter queue

To inspect the messages, you need to access the DLQ directly. The path to the DLQ follows a specific syntax based on the parent entity.

For a queue, the path is:
```
<queue path>/$deadletterqueue
```

For a topic subscription, the path is:
```
<topic path>/Subscriptions/<subscription path>/$deadletterqueue
```

In .NET, you can use the `QueueClient.FormatDeadLetterPath` or `SubscriptionClient.FormatDeadLetterPath` methods to construct these paths correctly. The DLQ supports normal operations such as peek-lock delivery, receive-and-delete, and transactional operations. However, time-to-live is not observed in the DLQ, and you cannot dead-letter a message from a DLQ.

You can also check the count of messages in the DLQ using the Azure CLI. For a subscription, use the `az servicebus topic subscription show` command. For a queue, use `az servicebus queue show`. Note that obtaining the count at the topic level is not applicable because messages are forwarded to subscriptions within milliseconds and no longer reside at the topic level.

## Inspect and reprocess messages

Once you have accessed the DLQ, you can peek at or receive the messages. The peek operation returns a disconnected snapshot of the messages. It does not lock them, so other receivers can still process them. However, peeking does not remove the messages from the DLQ.

If you determine that the issue causing the dead-lettering has been resolved, you can resubmit the message to the original queue or topic. Tools like Azure Service Bus Explorer allow manual moving of messages. For bulk operations, you can write code to read from the DLQ and send to the main queue.

Here is an illustrative example in .NET of how to peek messages from a DLQ. This code assumes you have the connection string and queue name. It is marked as an illustrative example and has not been tested in this context.

```csharp
using Azure.Messaging.ServiceBus;

// Prerequisites: Install Azure.Messaging.ServiceBus NuGet package
// Replace with your actual namespace connection string and queue name
string connectionString = "<NAMESPACE CONNECTION STRING>";
string queueName = "<QUEUE NAME>";

ServiceBusClient client = new ServiceBusClient(connectionString);

// Format the DLQ path using QueueClient
string dlqPath = QueueClient.FormatDeadLetterPath(queueName);

// Create a receiver for the DLQ
ServiceBusReceiver dlqReceiver = client.CreateReceiver(dlqPath);

// Peek messages from the DLQ
var peekedMessages = await dlqReceiver.PeekMessagesAsync(maxMessages: 10);

foreach (var message in peekedMessages)
{
    Console.WriteLine($"Reason: {message.SystemProperties.DeadLetterReason}");
    Console.WriteLine($"Description: {message.SystemProperties.DeadLetterDescription}");
    Console.WriteLine($"Body: {message.Body.ToString()}");
}
```

After resolving the issue, you can complete the dead-letter message in the DLQ. This removes it from the DLQ. If you want to reprocess it, you must send it to the original queue. Note that completing the dead-letter message does not automatically resubmit it; you must explicitly send it again.

## Verify the fix

After reprocessing, verify that the messages are no longer in the DLQ and are being processed correctly by the application. Check the application logs for any errors related to the previously dead-lettered messages. If the issue persists, review the `DeadLetterReason` and `DeadLetterDescription` properties again to see if a new reason has been added.

If you are dealing with a large number of dead-lettered messages, consider using a tool that provides a user interface for troubleshooting. Tools like ServicePulse with NServiceBus allow you to view failed messages, identify the source queues, and resubmit batches of messages. This can be more efficient than writing custom code for bulk operations.

Remember that enabling dead-lettering on message expiration is a separate configuration from the default dead-lettering behavior. By default, messages are dead-lettered when they exceed the maximum delivery count. Enabling dead-lettering on message expiration ensures that expired messages are also moved to the DLQ. This setting can be enabled or disabled for existing queues and subscriptions using the Azure portal, Azure CLI, or Azure PowerShell.

If you find that messages are consistently dead-lettered due to header size, consider upgrading your Service Bus namespace from the Standard tier to the Premium tier, which offers higher quotas and limits. However, this is a cost consideration and should be weighed against the benefits of higher throughput and lower latency.

The key to managing dead-letter queues is not just clearing them, but understanding the root cause of the failures. By inspecting the `DeadLetterReason` and `DeadLetterDescription` properties, you can identify whether the issue is related to delivery limits, message expiration, header size, or application logic. Once you understand the cause, you can take appropriate action to resolve the issue and prevent future dead-lettering.

References for Investigate messages in a Service Bus dead-letter queue: [Service Bus dead-letter queues | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues), [Enable dead lettering for Azure Service Bus queues and subscriptions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/enable-dead-letter), [Azure Service Bus - Browse or peek messages](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-browsing).
