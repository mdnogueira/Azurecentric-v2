---
title: "Document and test manual replay of failed messages"
description: "How to inspect, recover, and manually replay failed Service Bus messages using the .NET SDK and Service Bus Explorer."
pubDate: 2026-10-09
category: apps
tags: ["azure-service-bus", "dead-letter-queue", "message-deferral", "replay-messages", "azure-messaging-servicebus"]
translationKey: document-and-test-manual-replay-of-failed-messages
draft: false
---

Messages end up in the dead-letter queue (DLQ) or become deferred for different reasons, and the recovery path changes depending on where they are. If you need to replay a failed message, the first step is identifying whether it is dead-lettered or deferred, then retrieving it and resubmitting it to the main queue. You can do this programmatically with the Azure.Messaging.ServiceBus SDK or manually via Service Bus Explorer.

## Identify where the message is

Dead-lettered messages are moved to a subqueue when they cannot be processed after the maximum delivery count is exceeded, when they expire, or when a system error occurs. Deferred messages, by contrast, remain in the main queue but are set aside because processing is not currently possible, such as in a workflow waiting for a prior step. You can discover deferred messages via message browsing (peeking) if you have lost track of their sequence numbers.

To check the dead-letter queue, you address the subqueue directly. For a queue, the path is `<queue path>/$deadletterqueue`. For a topic subscription, it is `<topic path>/Subscriptions/<subscription path>/$deadletterqueue`. Service Bus Explorer provides a UI for browsing these queues, which is often the quickest way to inspect messages without writing code.

## Inspect and retrieve dead-lettered messages

Dead-lettered messages are held in the DLQ until you explicitly retrieve them. The DLQ does not have automatic cleanup, and messages do not expire in the DLQ. To retrieve a message, you need a receiver scoped to the dead-letter subqueue. In the .NET SDK, you set `ServiceBusReceiverOptions.SubQueue` to `SubQueue.DeadLetter`.

```csharp
using Azure.Identity;
using Azure.Messaging.ServiceBus;

// Prerequisites: Azure.Messaging.ServiceBus NuGet package, connection string or credential
string fullyQualifiedNamespace = "<NAMESPACE-NAME>.servicebus.windows.net";
string queueName = "<QUEUE-NAME>";

// 1. Create the client
await using var client = new ServiceBusClient(fullyQualifiedNamespace, new DefaultAzureCredential());

// 2. Configure options to target the dead-letter subqueue
var options = new ServiceBusReceiverOptions
{
    SubQueue = SubQueue.DeadLetter
};

// 3. Create a receiver scoped to the dead-letter queue
ServiceBusReceiver dlqReceiver = client.CreateReceiver(queueName, options);

// 4. Receive a dead-lettered message
ServiceBusReceivedMessage dlqMessage = await dlqReceiver.ReceiveMessageAsync();

// 5. Inspect why the message was dead-lettered
string reason = dlqMessage.DeadLetterReason;
string description = dlqMessage.DeadLetterErrorDescription;

// 6. Complete the message to remove it from the DLQ
await dlqReceiver.CompleteMessageAsync(dlqMessage);
```

The `DeadLetterReason` and `DeadLetterErrorDescription` properties help you identify the cause. Common reasons include `MaxDeliveryCountExceeded` if the message could not be consumed after the maximum delivery attempts, or `TTLExpiredException` if the message expired. Once you have retrieved the message, you can inspect its body and properties to understand the failure.

## Retrieve deferred messages

Deferred messages remain in the main queue and can be discovered via message browsing. To retrieve a deferred message, you must know its sequence number. If you have lost track of the sequence number, you can use the peek operation to enumerate messages in the queue and identify the deferred ones.

```csharp
using Azure.Messaging.ServiceBus;

// Prerequisites: Azure.Messaging.ServiceBus NuGet package, connection string
string connectionString = "<CONNECTION-STRING>";
string queueName = "<QUEUE-NAME>";
long sequenceNumber = <SEQUENCE-NUMBER>; // Must be known

ServiceBusClient client = new ServiceBusClient(connectionString);
ServiceBusReceiver receiver = client.CreateReceiver(queueName);

// Retrieve the deferred message by sequence number
ServiceBusReceivedMessage deferredMessage = await receiver.ReceiveMessageAsync(sequenceNumber);

// Process or resubmit the message
Console.WriteLine(deferredMessage.Body.ToString());

// Complete the message to remove it from the queue
await receiver.CompleteMessageAsync(deferredMessage);
```

Note that deferred messages do not expire until a client attempts to receive them. If a deferred message has expired by the time you try to retrieve it, it will be moved to the dead-letter queue if dead-lettering is enabled for the entity.

## Replay the message

Once you have retrieved the message, whether from the DLQ or as a deferred message, you can replay it by sending it back to the main queue. You can do this programmatically by creating a sender and sending the message body and properties, or manually via Service Bus Explorer.

In Service Bus Explorer, you can peek messages in the dead-letter queue, edit their content or properties if needed, and resend them individually or in batches. This is often preferred by operators because it surfaces which message types failed, from which source entities, and why, while still allowing batch resubmission.

Programmatically, you create a sender for the main queue and send the message. It is important to preserve the original message metadata so downstream consumers can correlate the replayed message with the original request.

```csharp
using Azure.Messaging.ServiceBus;

// Prerequisites: Azure.Messaging.ServiceBus NuGet package, connection string
string connectionString = "<CONNECTION-STRING>";
string queueName = "<QUEUE-NAME>";

ServiceBusClient client = new ServiceBusClient(connectionString);
ServiceBusSender sender = client.CreateSender(queueName);

// Reuse the message body and properties from the retrieved message
ServiceBusMessage replayMessage = new ServiceBusMessage(dlqMessage.Body);
replayMessage.MessageId = dlqMessage.MessageId;
replayMessage.CorrelationId = dlqMessage.CorrelationId;
// Add other properties as needed

await sender.SendMessageAsync(replayMessage);

// Clean up
await sender.DisposeAsync();
await client.DisposeAsync();
```

After resending, you should verify that the message is processed successfully by the consumer. If the underlying issue that caused the failure is not resolved, the message may fail again and return to the DLQ. It is important to address the root cause before replaying messages to avoid repeated failures.

## Verify and clean up

After replaying messages, check the main queue to ensure the messages are being processed. Monitor the DLQ to see if new messages are accumulating, which could indicate ongoing issues. If you have resolved the issue, you can clear any remaining messages in the DLQ by retrieving and completing them, or by using Service Bus Explorer to remove them in batches.

Remember to settle messages before closing the receiver or connection. If you close the receiver before settling a message, the settlement does not reach the service, and the message stays locked until the lock expires, potentially increasing its delivery count and leading to it being dead-lettered again.

References for Document and test manual replay of failed messages: [Azure Service Bus - Browse or peek messages](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-browsing), [Service Bus Dead-Letter Queues](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues), [Message Deferral Overview](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-deferral).
