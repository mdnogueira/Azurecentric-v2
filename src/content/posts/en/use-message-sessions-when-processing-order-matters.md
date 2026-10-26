---
title: "Use message sessions when processing order matters"
description: "Use Service Bus sessions to guarantee ordered processing of related messages, avoiding the pitfalls of sequence numbers alone."
pubDate: 2024-12-23
category: integration
tags: ["azure-service-bus", "message-sessions"]
translationKey: use-message-sessions-when-processing-order-matters
draft: false
---

You have a queue where the order of messages matters. If you send an "update" followed by a "commit", the consumer must process them in that exact sequence. You might reach for Service Bus's built-in sequencing first, but sequence numbers alone do not guarantee processing order. To enforce it, you need message sessions.

Service Bus assigns a gap-free, increasing `SequenceNumber` to every message as it arrives. This number reflects the true order of arrival in the broker. However, as the documentation notes, "Sequence number on its own guarantees the queuing order and the extraction order of messages, but not the processing order" [Azure Service Bus message sequencing and timestamps](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sequencing).

Consider a scenario with two consumers. Consumer A picks up message 1. Consumer B picks up message 2. Consumer B finishes processing message 2 and picks up message 3, while Consumer A is still working on message 1. Consumer B then finishes message 3. Finally, Consumer A completes message 1. The processing order is now 2, 3, 1. If your business logic requires 1, 2, 3 to be processed in order, you must use sessions [Azure Service Bus message sequencing and timestamps](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sequencing).

## Why sessions are necessary for ordered processing

When you enable sessions on a queue or subscription, Service Bus groups messages by a `SessionId`. The broker holds an exclusive lock on all messages belonging to a specific session ID. This lock is held by the client that accepted the session. As long as that client holds the lock, no other consumer can receive messages from that session [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

This mechanism allows multiple concurrent receivers to pull from the same queue, but ensures that all messages for a particular session are dispatched to the same receiver. This receiver can then process the messages in the order they arrived, because the lock prevents other consumers from stealing the next message in the sequence [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

It is important to distinguish between retrieval order and processing order. If you only need to read messages in order, sessions are not required. If you need to process them in order, sessions are the correct tool. The same `SessionId` should be set on all messages that belong together, such as messages 1, 4, and 8 in one logical set, and 2, 3, and 6 in another [Azure Service Bus message sequencing and timestamps](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sequencing).

## Enabling sessions at creation

Sessions are a property of the queue or subscription entity itself. You cannot enable or disable them after the entity is created. You must set this flag at creation time [Enable Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/enable-message-sessions).

Additionally, the Service Bus tier matters. The basic tier does not support sessions. You must use the standard or premium tier [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

If you are using the Azure CLI, you can create a session-enabled queue with the `--enable-session` flag:

```azurecli-interactive
az servicebus queue create \
    --resource-group myresourcegroup \
    --namespace-name mynamespace \
    --name myqueue \
    --enable-session true
```

For a subscription on a topic, the command is similar:

```azurecli-interactive
az servicebus topic subscription create \
    --resource-group myresourcegroup \
    --namespace-name mynamespace \
    --topic-name mytopic \
    --name mysubscription \
    --enable-session true
```

If you prefer PowerShell, use `-RequiresSession $True` [Enable Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/enable-message-sessions). In an ARM template, set `requiresSession` to `true` in the queue or subscription properties [Enable Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/enable-message-sessions).

## Sending and receiving with sessions

When sessions are enabled on a queue, all messages sent to that queue must have a `SessionId` set. Regular messages without a session ID cannot be sent to a session-enabled queue [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions). Similarly, clients must accept the session to receive messages. You cannot simply peek or receive without acknowledging the session lock [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

In your application code, you will typically use a session receiver. When you accept a session, you obtain the exclusive lock. You can then receive messages from that session in order. The lock is renewed automatically or manually as needed. If you abandon a message, it remains in the session and will be served again when you receive from the same session [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

For example, in .NET, you might use the `ServiceBusSessionProcessor` to handle the complexity of accepting sessions and processing messages concurrently across multiple sessions. This handler-based model hides the low-level lock management while ensuring that messages within a single session are processed in order [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

## Managing session state and expiration

Sessions can persist for a long time. Service Bus does not define a specific time or API for when a session expires. Theoretically, a message could be received for a session today, and the next message a year later, and the session would still be the same from the broker's perspective [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

Because of this, you should manage session state carefully. If your application stores state within the session (using `SetState`), remember that this state counts towards the entity's storage quota. When you are finished with a session, clear the state to avoid unnecessary costs [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

Be aware of message expiration. If the Time-To-Live (TTL) for any message in a session expires, all messages in that session are either dropped or dead-lettered, depending on the entity's configuration. This happens even if other messages in the session have not yet expired [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).

## Verification

To verify your setup, send a batch of messages with the same `SessionId` to your queue. Ensure they are received by a single consumer instance in the expected order. If you have multiple consumer instances, confirm that messages with different `SessionId`s are distributed across them, but messages with the same `SessionId` are always routed to the same instance. This confirms that the session lock is working as intended to preserve processing order [Azure Service Bus message sessions | Microsoft Docs](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions).
