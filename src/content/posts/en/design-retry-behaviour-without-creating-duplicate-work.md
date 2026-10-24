---
title: "Design retry behaviour without creating duplicate work"
description: "Design retry policies for Azure API Management, Logic Apps, and Event Grid to ensure reliability without creating duplicate work."
pubDate: 2025-02-17
category: apps
tags: ["azure-api-management", "logic-apps", "event-grid", "retry-policies", "idempotency", "integration"]
translationKey: design-retry-behaviour-without-creating-duplicate-work
draft: false
---

A retry repeats an attempt. It does not establish whether the earlier attempt already changed the business system. That distinction matters when an integration creates orders, sends messages or changes a balance.

A timeout can leave the caller uncertain even though the destination committed the work. Retrying that request safely needs an agreement with the destination about duplicate handling. A retry count alone cannot provide that agreement.

[![Retry Flow and Idempotency Check](/images/posts/2025/azc-148-checkpoints.svg)](/images/posts/2025/azc-148-checkpoints.svg)

## Decide which operations are safe to repeat

Start by identifying the business operation and its side effects. A read-only status request is a different case from creating a payment. Even when an HTTP method is normally idempotent, inspect the API's actual contract and any additional side effects.

Use a stable operation identifier across all attempts for the same business action. Generating a new identifier on each retry makes those attempts look like different operations. The destination needs to record and enforce the identifier, for example through an appropriate unique constraint and a transaction that ties the recorded result to the work.

A separate check followed by a write is not sufficient if concurrent requests can pass the check together. The duplicate decision and the protected operation need a consistent, atomic design.

## Configure API Management retries deliberately

The API Management [retry policy](https://learn.microsoft.com/en-us/azure/api-management/retry-policy) executes its child policies and can repeat them while a condition remains true, within the configured limit. It does not make a backend operation idempotent.

This illustrative backend policy fragment uses a fixed interval. It is a fragment for an existing policy document, not a complete API configuration:

```xml
<retry
    condition="@(context.Response != null &amp;&amp; context.Response.StatusCode >= 500)"
    count="2"
    interval="30"
    first-fast-retry="false">
    <forward-request buffer-request-body="true" />
</retry>
```

Choose the retry condition for the API's documented behaviour. Not every error is transient, and validation or authorisation failures generally require a corrected request rather than another identical attempt. Buffering the body allows it to be sent again; it does not prevent duplicate business processing.

Include the initial request and subsequent attempts when estimating the caller's waiting time. Set limits which fit the end-to-end timeout and the destination's capacity.

## Keep Logic Apps retry and failure handling separate

Logic Apps supports retry policies for actions which support retries. The available defaults and limits depend on the operation, so verify the specific connector rather than applying a single rule to every action.

Here is an illustrative HTTP action entry, wrapped as a JSON object. It belongs inside a workflow's actions object and is not a complete workflow definition. Replace the example HTTPS endpoint with a controlled test endpoint:

```json
{
  "HTTP": {
    "type": "Http",
    "inputs": {
      "method": "GET",
      "uri": "https://example.com/status",
      "retryPolicy": {
        "type": "fixed",
        "interval": "PT30S",
        "count": 2
      }
    },
    "runAfter": {}
  }
}
```

The count requests two additional retry attempts after the initial attempt where the retry policy applies. Configure subsequent failure handling against the action's final status. If the action ultimately succeeds, a handler configured only for Failed does not run merely because an earlier attempt failed.

Use the documented [run-after and retry behaviour](https://learn.microsoft.com/en-us/azure/logic-apps/error-exception-handling) to decide what should happen when attempts are exhausted. Recording an error, notifying an operator and reconciling an uncertain transaction are separate responsibilities.

## Expect duplicate event delivery

[Event Grid delivery](https://learn.microsoft.com/en-us/azure/event-grid/delivery-and-retry) uses at-least-once semantics. A subscriber must be prepared for duplicates. Retain an appropriate event or business-operation identifier and define how long duplicate history must remain available.

Configure dead-letter handling where needed. Do not assume failed events will appear in storage without that configuration. Someone also needs to monitor and reconcile the dead-lettered work; replaying it can repeat earlier side effects if duplicate handling is absent.

## Verify the uncertain outcome

Use a controlled test in which the destination completes the operation but the caller does not receive the response. Repeat the request with the same operation identifier and inspect both the business result and the recorded response.

Then test a genuine transient failure, a permanent validation failure and concurrent duplicate requests. Check attempt counts, elapsed time and the final workflow or delivery status. These are proposed tests, not measured results from a live deployment. The useful outcome is one intended business operation, an explainable response to each attempt and a clear reconciliation path when completion remains uncertain.
