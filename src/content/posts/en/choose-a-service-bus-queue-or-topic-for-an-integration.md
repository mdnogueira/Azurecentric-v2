---
title: "Choose a Service Bus queue or topic for an integration"
description: "Decide between Service Bus queues and topics by matching your integration pattern to competing consumers or publish-subscribe needs."
pubDate: 2024-07-06
category: apps
tags: ["azure-service-bus", "queues", "topics", "messaging", "integration", "publish-subscribe"]
translationKey: choose-a-service-bus-queue-or-topic-for-an-integration
draft: false
---

You are designing an integration between two systems and need to choose between a Service Bus queue and a topic. The decision rests on a single operational question: do you need one consumer to process each message, or do you need multiple distinct consumers to receive copies of the same message? 

If the answer is the former, use a queue. If the latter, use a topic with subscriptions. This choice dictates how you structure your application logic, how you handle scaling, and how you manage message delivery guarantees.

[![Service Bus Messaging Patterns](/images/posts/2024/azc-067-checkpoints.svg)](/images/posts/2024/azc-067-checkpoints.svg)

## The core distinction: One-to-one versus one-to-many

Azure Service Bus provides two primary messaging entities: queues and topics. While both offer durable storage and reliable delivery, they serve different architectural patterns.

A queue implements a point-to-point communication model. Messages are stored in the queue until a consumer retrieves them. The key characteristic is that each message is processed by only one consumer. If you have multiple worker processes reading from the same queue, they compete for the messages. This is known as the **competing consumer** pattern [Azure Service Bus messaging - queues, topics, and subscriptions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions). The queue ensures that a message is delivered to exactly one receiver, making it ideal for load balancing work across a pool of identical workers or for ensuring that a specific task is performed.

In contrast, a topic implements a publish-subscribe model. When a publisher sends a message to a topic, that message is made available to every subscription registered with the topic [Azure Service Bus messaging - queues, topics, and subscriptions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions). Each subscription acts as a virtual queue that receives a copy of the message. This allows for a one-to-many relationship where different applications or services can subscribe to the same data stream and process it independently. For example, an order processing system might publish an order message to a topic, while a separate inventory service and a notification service both subscribe to that topic to handle their respective parts of the workflow [Compare Azure messaging services](https://learn.microsoft.com/en-us/azure/service-bus-messaging/compare-messaging-services).

## When to choose a queue

Choose a queue when you have a discrete unit of work that needs to be processed by a single entity, but you need to decouple the producer from the consumer in time or scale.

Queues are particularly useful for **temporal decoupling**. The producer does not need to wait for the consumer to be online or ready to process the message. The message is stored durably in the queue, allowing the consumer to process it later [Azure Service Bus messaging - queues, topics, and subscriptions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions). This is common in scenarios where the producer is a web application that needs to return a response quickly, while the actual business logic is handled asynchronously by a backend worker.

Queues also provide **load leveling**. If your application experiences traffic spikes, the queue absorbs the excess messages. You can scale your consumer workers up or down based on the depth of the queue, ensuring that the processing capacity matches the average load rather than the peak load [Azure Service Bus messaging - queues, topics, and subscriptions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions). This pattern allows you to use the most cost-effective infrastructure by scaling workers only when necessary.

Furthermore, queues support **FIFO (First-In-First-Out)** ordering when using message sessions. If the order of processing is critical, such as in financial transactions or state machines, you can use sessions to ensure that messages are processed in the exact order they were sent [Introduction to Azure Service Bus, an enterprise message broker](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview). Without sessions, messages are delivered in the order they were added, but there is no strict guarantee across multiple competing consumers unless you use sessions to lock the processing to a specific consumer instance.

## When to choose a topic

Choose a topic when you need to distribute the same message to multiple, independent consumers. This is the **publish-subscribe** pattern [Azure Service Bus messaging - queues, topics, and subscriptions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions).

Topics are ideal for scenarios where different parts of your system need to react to the same event or data change. For instance, when a new product is added to a catalog, you might want to update the search index, send a notification to subscribers, and update the analytics dashboard. Instead of the producer sending separate messages to each system, it sends a single message to a topic, and each system subscribes to that topic.

Topics also support **filtering** through subscription rules. You can define rules on a subscription to receive only a subset of messages based on their properties. This allows you to create specialized subscriptions that process specific types of messages, while ignoring others. For example, you might have a subscription that only receives messages for high-value orders, while another subscription receives all messages for processing [Azure Service Bus messaging - queues, topics, and subscriptions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions). This filtering happens at the broker level, reducing the load on your consumers by only delivering relevant messages.

It is important to note that subscriptions are independent. If one subscription is slow or down, it does not affect the delivery of messages to other subscriptions. Each subscription maintains its own message state, including which messages have been received and processed. This allows you to scale each consumer independently based on its specific processing requirements.

## Practical example: Order processing integration

Consider an e-commerce application that processes customer orders. The order service needs to send order details to other systems for fulfillment and notification.

If you use a **queue**, only one system can process the order. You would need to chain the systems, where the first system processes the order and then sends a message to the next system in the queue. This creates a sequential dependency. If the first system fails, the entire pipeline stops until it recovers.

If you use a **topic**, the order service sends the order message to a topic. The fulfillment service subscribes to the topic to process the order for shipping. The notification service also subscribes to the topic to send an email confirmation to the customer. Both services receive the same message and process it independently. If the notification service is down, the fulfillment service continues to operate normally. This decouples the systems and improves overall reliability.

## Verification and next steps

To verify your choice, map your integration requirements to the messaging pattern:

1. **Identify the consumer relationship**: Is there one logical worker for each message, or multiple distinct consumers?
2. **Assess the need for filtering**: Do consumers need only a subset of messages, or all of them?
3. **Evaluate ordering requirements**: Is strict FIFO ordering required, and can it be achieved with sessions?

Once you have made your decision, create the corresponding entity in your Service Bus namespace. For a queue, simply create the queue and configure your consumer to read from it. For a topic, create the topic and then create the necessary subscriptions, defining any filters required for each consumer. Ensure that your consumers are configured to handle the appropriate receive mode, such as Peek Lock for at-least-once processing, to avoid message loss in case of failures [Azure Service Bus messaging - queues, topics, and subscriptions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions).

By aligning your choice with the actual communication pattern, you ensure that your integration is scalable, reliable, and maintainable. The queue and topic are not interchangeable; they serve distinct purposes in your architecture. Choose the one that matches your data flow and consumer needs.
