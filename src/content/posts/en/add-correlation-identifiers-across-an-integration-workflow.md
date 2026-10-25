---
title: "Add correlation identifiers across an integration workflow"
description: "Propagate correlation identifiers through Azure API Management and Service Bus using set-variable and Diagnostic-Id."
pubDate: 2026-03-04
category: apps
tags: ["api-management", "service-bus", "distributed-tracing", "application-insights", "opentelemetry"]
translationKey: add-correlation-identifiers-across-an-integration-workflow
draft: false
---

You have an integration workflow where an API request triggers a Service Bus message, which is then processed by a downstream consumer. The logs for the API call, the message send, and the message processing appear as separate, unconnected events in your monitoring tool. You cannot trace the latency or the error path across the boundary.

The solution is to stamp every event with a trace context. This requires two distinct actions: configuring Azure API Management (APIM) to inject a correlation identifier into the message properties, and ensuring the Service Bus client libraries propagate that context to the consumer. This approach relies on the W3C Trace-Context protocol, which is the standard for distributed tracing in Azure.

## Inject the correlation identifier in API Management

The first step is to capture the incoming trace context from the client and pass it into the Service Bus message. API Management policies allow you to manipulate both the request headers and the message properties sent to the backend.

When a client calls your API, it typically includes a `traceparent` header if it is using a W3C-compliant tracing library. You need to extract this value and store it in a context variable, then assign it to the `Diagnostic-Id` property of the Service Bus message. The `Diagnostic-Id` property is the specific field that Service Bus clients use to correlate the message with the originating trace.

You can achieve this using the `set-variable` policy in the inbound section of your APIM API configuration. This policy allows you to define a context variable and assign it a value from an expression. In this case, you extract the `traceparent` header from the incoming request.

```xml
<!-- Illustrative example: Not run in production without specific header values -->
<set-variable name="traceId" value="@(context.Request.Headers.GetValueOrDefault("traceparent", ""))" />
```

Once you have the trace ID stored in a variable, you need to ensure it is attached to the message when you send it to Service Bus. If you are using the `send-request` policy to invoke a Service Bus REST API endpoint, or if you are using the built-in Service Bus integration, you must map this variable to the `Diagnostic-Id` property. The exact mechanism depends on whether you are calling the Service Bus REST API directly or using a higher-level integration policy. If you are using the REST API, you would include this in the message properties JSON payload.

If you are using the `send-request` policy, the policy statement allows you to define headers and body content. You would construct the body to include the `Diagnostic-Id` property.

```xml
<!-- Illustrative example: Demonstrates property mapping, not a complete send-request policy -->
<set-variable name="messageBody" value="@(new JObject(
    new JProperty("body", context.Request.Body.As<string>(preserveContent: true)),
    new JProperty("properties", new JObject(
        new JProperty("Diagnostic-Id", (string)context.Variables["traceId"])
    ))
).ToString())" />
```

The `set-variable` policy supports string literals and expressions. The expression above constructs a JSON object that includes the original body and the new properties. This ensures that the trace context is preserved in the message metadata.

## Propagate the context in Service Bus clients

Once the message is in Service Bus, the next step is to ensure that the consumer can read the `Diagnostic-Id` and use it to continue the trace. The Azure Service Bus client libraries provide built-in support for this.

The `Azure.Messaging.ServiceBus` SDK (the current recommended library) provides tracing instrumentation points that can be hooked by tracing systems. When you send a message, the SDK checks for an active `Activity` context. If an activity is active, it automatically sets the `Diagnostic-Id` property on the message. This means you do not need to manually extract and set the property in your application code if you are using the standard SDK patterns.

However, if you are manually constructing messages or using older SDK versions, you must ensure the property is set. The `Diagnostic-Id` property is a string that contains the W3C trace parent header value. The format is defined by the W3C Trace-Context specification.

When the consumer receives the message, it should extract the `Diagnostic-Id` and use it to create a new `Activity` that is a child of the incoming trace. The `ServiceBusProcessor` class in the SDK provides instrumentation points that can be hooked by tracing systems. If you are using Application Insights or OpenTelemetry, the SDK automatically correlates the message processing with the incoming trace context.

If you are processing messages manually, you need to extract the `Diagnostic-Id` from the message properties and use it to start a new activity.

```csharp
// Illustrative example: Demonstrates manual activity correlation
async Task ProcessMessageAsync(ProcessMessageEventArgs args)
{
    var message = args.Message;
    if (message.ApplicationProperties.TryGetValue("Diagnostic-Id", out var diagnosticId) && diagnosticId is string traceId)
    {
        var activity = new Activity("ProcessMessage");
        activity.SetParentId(traceId);
        activity.Start();

        try
        {
            // Process the message
            await ProcessMessageBody(message.Body);
        }
        finally
        {
            activity.Stop();
        }
    }
}
```

This code creates a new activity with the incoming `Diagnostic-Id` as the parent. This ensures that the telemetry emitted during message processing is correlated with the original request.

## Verify the end-to-end trace

To verify that your correlation identifiers are working correctly, you need to check your monitoring tool. If you are using Application Insights, you can use the Transaction Search or the Dependency Map to see the flow of the request.

1.  Send a test request to your API with a valid `traceparent` header.
2.  Check the API Management logs to see if the `traceId` variable was set correctly.
3.  Check the Service Bus message properties to confirm that the `Diagnostic-Id` property is present and matches the `traceparent` header.
4.  Check the consumer logs to see if the activity was started with the correct parent ID.
5.  In Application Insights, search for the transaction ID. You should see the API request, the Service Bus send operation, and the message processing operation linked together.

If the operations are not linked, check the following:

*   **APIM Policy:** Ensure the `set-variable` policy is executing and that the variable is being mapped to the message property. Check the APIM diagnostic logs for any policy errors.
*   **Service Bus SDK:** Ensure you are using the `Azure.Messaging.ServiceBus` SDK and that it is configured to use the correct tracing provider. If you are using manual processing, ensure you are extracting the `Diagnostic-Id` and starting the activity correctly.
*   **Monitoring Tool:** Ensure that your monitoring tool is configured to accept and correlate W3C Trace-Context headers. Some older tools may not support this standard.

## Considerations for legacy SDKs

If you are still using the older `Microsoft.Azure.ServiceBus` SDK, note that support for this library is being retired. The retirement date is 30 September 2026. You should migrate to the `Azure.Messaging.ServiceBus` SDK to ensure continued support and access to the latest tracing features. The older SDK uses the same `Diagnostic-Id` property, but the automatic instrumentation is less robust.

The `Diagnostic-Id` property is the key to end-to-end tracing in Service Bus. By ensuring that this property is set by the producer and consumed by the consumer, you can build a clear picture of your integration workflows. This allows you to diagnose issues faster and understand the performance characteristics of your systems.

Start by implementing the `set-variable` policy in APIM and verifying the message properties. Then, ensure your consumer is correctly correlating the trace context. This small investment in configuration pays off significantly in operational visibility.


References for Add correlation identifiers across an integration workflow: [Azure API Management policy reference - set-variable | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/set-variable-policy), [End-to-end tracing and diagnostics](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-end-to-end-tracing).
