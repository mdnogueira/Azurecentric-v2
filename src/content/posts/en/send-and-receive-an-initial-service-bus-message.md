---
title: "Send and receive an initial Service Bus message"
description: "Send and receive an initial Service Bus message using Python, covering namespace setup, authentication, and verification."
pubDate: 2024-08-31
category: apps
tags: []
translationKey: send-and-receive-an-initial-service-bus-message
draft: true
---

You need to get a message into an Azure Service Bus queue and read it back to confirm the pipeline works. The first step is always infrastructure: a namespace and a queue. After that, you choose how the application authenticates. Microsoft recommends using passwordless authentication with Microsoft Entra ID for production workloads, as it avoids hard-coded secrets. However, for a quick initial test, a connection string is often simpler to set up.

This guide uses Python, as the syntax is concise and the official quickstart provides clear examples. We will create the resources in the portal, then write a small script to send a message and another to receive it.

## Create the Service Bus namespace and queue

A Service Bus namespace provides a scoping container for all messaging entities. You need a unique name across Azure. The naming conventions are strict: 6 to 50 characters, starting with a letter, ending with a letter or number, and containing only letters, numbers, and hyphens. It cannot end with `-sb` or `-mgmt`.

1. Sign in to the Azure portal.
2. Select **All services**, then **Integration**, and choose **Service Bus**.
3. Click **+ Create**.
4. On the **Basics** tab:
   - Select your **Subscription**.
   - Choose or create a **Resource group**.
   - Enter a **Namespace name**.
   - Select a **Region**.
   - For **Pricing tier**, select **Standard**. The quickstart documentation explicitly recommends Standard for this scenario. Basic tier does not support topics and subscriptions, though it works for queues. Standard is the recommended tier for most scenarios.
5. Click **Review + create**, then **Create**.
6. Once deployed, click **Go to resource**.

Next, create the queue:

1. In the left menu of the namespace, select **Queues**.
2. Click **+ Queue**.
3. Enter a **Name** for the queue (e.g., `test-queue`).
4. Leave the other settings at their defaults.
5. Click **Create**.

## Choose your authentication method

You have two main options for connecting to Service Bus from code:

1. **Connection String**: A single string containing the namespace endpoint and SAS keys. It grants full control. It is easy to use but less secure for production because the secret is embedded in your code or configuration.
2. **Passwordless (Recommended)**: Uses your Microsoft Entra identity. You assign the **Azure Service Bus Data Sender** and **Azure Service Bus Data Receiver** roles to your user or managed identity. This is the secure, production-ready approach.

For this initial test, we will use the **Connection String** method because it requires no role assignment delays. In production, you should switch to passwordless authentication.

To get the connection string:
1. In the Service Bus namespace portal blade, select **Shared access policies** from the left menu.
2. Click **RootManageSharedAccessKey**.
3. Copy the **Primary Connection String**.

## Send a message with Python

You need the `azure-servicebus` package. Install it using pip:

```bash
pip install azure-servicebus
```

Create a file named `send.py`. The code below uses the connection string to create a sender and sends a single message.

```python
import asyncio
from azure.servicebus.aio import ServiceBusClient
from azure.servicebus import ServiceBusMessage

# Replace with your actual connection string
CONN_STR = "<NAMESPACE-CONNECTION-STRING>"
QUEUE_NAME = "test-queue"

async def send_single_message():
    # Create a Service Bus client using the connection string
    async with ServiceBusClient.from_connection_string(
        conn_str=CONN_STR,
        logging_enable=True
    ) as servicebus_client:
        # Get a Queue Sender object
        sender = servicebus_client.get_queue_sender(queue_name=QUEUE_NAME)
        async with sender:
            # Create a message
            message = ServiceBusMessage("Hello from Python")
            # Send the message
            await sender.send_messages(message)
            print("Sent a single message")

asyncio.run(send_single_message())
```

Run the script:

```bash
python send.py
```

You should see `Sent a single message` in the console. To verify, go back to the Azure portal, select your queue, and check the **Active message count** in the Essentials pane. It should be 1.

## Receive a message with Python

Now, create a file named `recv.py` to receive the message. The receiver must complete the message to remove it from the queue.

```python
import asyncio
from azure.servicebus.aio import ServiceBusClient

# Replace with your actual connection string
CONN_STR = "<NAMESPACE-CONNECTION-STRING>"
QUEUE_NAME = "test-queue"

async def receive_messages():
    # Create a Service Bus client using the connection string
    async with ServiceBusClient.from_connection_string(
        conn_str=CONN_STR,
        logging_enable=True
    ) as servicebus_client:
        # Get a Queue Receiver object
        receiver = servicebus_client.get_queue_receiver(queue_name=QUEUE_NAME)
        async with receiver:
            # Receive messages (wait up to 5 seconds for new messages)
            received_msgs = await receiver.receive_messages(
                max_wait_time=5,
                max_message_count=1
            )
            for msg in received_msgs:
                print(f"Received: {str(msg)}")
                # Complete the message to remove it from the queue
                await receiver.complete_message(msg)

asyncio.run(receive_messages())
```

Run the script:

```bash
python recv.py
```

You should see `Received: Hello from Python`. Check the Azure portal again. The **Active message count** should now be 0, and the **Dead-lettered message count** should remain 0. The message has been successfully consumed.

tags: [azure-service-bus, python, messaging, quickstart, rbac],
  

References for Send and receive an initial Service Bus message: [Use the Azure portal to create a Service Bus queue](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-portal), [Quickstart - Use Azure Service Bus queues from .NET app](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dotnet-get-started-with-queues), [Get started with Azure Service Bus queues (Python)](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-python-how-to-use-queues).
