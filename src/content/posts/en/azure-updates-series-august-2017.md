---
title: "Azure Updates Series – August 2017"
description: "From the all the enhances or new features that Azure releases on the month of August, there was 2 that will make our live easier, at least in my opinion/experience/area of work…"
pubDate: 2017-08-24
category: cloud
tags: ["cloud-computing"]
translationKey: azure-updates-series-august-2017
legacy: true
legacyUrl: /2017/08/azure-updates-series-august-2017.html
---

From the all the enhances or new features that Azure releases on the month of August, there was 2 that will make our live easier, at least in my opinion/experience/area of work off course:
  * Public Preview of Azure Event Grid
  * Enhance of Azure Monitor with new capabilities for diagnostics

Azure Event Grid is an important solution how to handle the challenging world of IoT. Most of the actual application based on IoT are built using events, the way that you respond to those events and initiate business process can be really difficult. With the increase of the serverless platforms, comes the grow of the event-based applications, there is where Azure Event Grid will help you.

On the announcement, Microsoft says that, Event Grid has built-in support for events that come from Azure services, like storage blobs and resource groups. Event Grid also has built-in support for custom and third-party events, using custom topics and custom webhooks. You can use filters to route specific events to different endpoints, multicast to multiple endpoints, and make sure your events are reliably delivered.

For more information about the Azure Event Grid, just look at [Introducing Azure Event Grid.](https://azure.microsoft.com/en-ca/blog/introducing-azure-event-grid-an-event-service-for-modern-applications/)

Microsoft just add two new capabilities into Azure Monitor, the creation of multiple resource diagnostic setting per resource (in this case, in public preview) and you can send the metrics and the logs to a different subscription.

Why those capabilities are important, you may thing. The first one, creation of multiple diagnostic settings per resource, it makes easier to create a template with all the setting that you want to monitor/alert related to a specific resource. For example, if you want to monitor the diagnostic of your storage account to see what is going on, you need to enable several times and you could only send those logs and metrics to one storage account.

The second new capability, send the metrics and logs to a different subscription, it will make your live easier, if you are a Managed Services (for example), that you can centralize all your metrics into this subscription, without affecting other subscriptions.

For more information about the new capabilities, just look at the announcement of [Azure Monitor: Enhanced capabilities for routing logs and metrics](https://azure.microsoft.com/en-ca/blog/azure-monitor-multiple-diagnostic-settings/)

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
