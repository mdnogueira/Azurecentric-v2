---
title: "Set application scaling rules around measurable demand"
description: "Define measurable scaling rules for Azure Container Apps using HTTP concurrency thresholds and replica limits."
pubDate: 2026-02-19
category: apps
tags: ["azure-container-apps", "scaling", "keda", "container-apps", "devops"]
translationKey: set-application-scaling-rules-around-measurable-demand
draft: true
---

You have a containerised application that needs to handle variable HTTP traffic without manual intervention. The question is not whether to scale, but how to define the threshold that triggers scaling and the limits that bound it. Azure Container Apps uses KEDA (Kubernetes Event-driven Autoscaling) to manage this, but the configuration requires a clear understanding of concurrency, replica counts, and the immutable nature of revisions.

The first thing to check is your scaling objective. Do you need the application to scale to zero when idle to minimise cost, or do you require at least one instance to be running at all times to handle immediate requests? This decision sets the minimum replica count. The second decision is the concurrency threshold. This is the number of simultaneous requests that a single replica can handle before the platform decides to add another replica. Setting this too low causes unnecessary scaling; setting it too high risks latency spikes.

[![Container Apps HTTP Scaling Flow](/images/posts/2026/azc-279-checkpoints.svg)](/images/posts/2026/azc-279-checkpoints.svg)

## Define the scale limits

Scaling in Container Apps is defined by a range of replicas. The minimum number of replicas determines the baseline. If you set this to zero, the application scales to zero when idle, and you are not billed for usage during that time, though idle replicas may still incur a lower billing rate if they are retained in memory. If you set the minimum to one or more, an instance is always running, eliminating cold start latency for incoming requests.

The maximum number of replicas is the upper bound. The platform will not add more instances than this limit, regardless of the incoming load. This is a critical control to prevent runaway costs or resource exhaustion. The default maximum is 10, but you can configure it up to 1,000 replicas per revision. 

For a typical web application, you might start with a minimum of 1 to ensure availability and a maximum of 5 to contain costs during a pilot. These limits are applied per revision. A revision is an immutable snapshot of your container app. Any change to the scaling rules, including the minimum or maximum replica counts, creates a new revision. This means that scaling configuration changes are not applied in-place; they trigger a deployment of a new version of the application.

## Set the HTTP concurrency rule

The most common trigger for web applications is HTTP concurrency. This rule monitors the number of concurrent requests being processed by each replica. The platform calculates the average number of requests over a 15-second window. If the number of concurrent requests exceeds the threshold you define, a new replica is added. This process continues until the maximum replica limit is reached.

The default concurrency threshold is 10 requests per replica. This is a conservative starting point. If your application is lightweight and can handle more simultaneous connections, you might increase this value to 100 or higher. If your application is resource-intensive or has slow response times, you might lower it to 5 or 10 to ensure that individual replicas do not become bottlenecks.

To configure this, you need to specify the rule name, the type, and the concurrency value. The rule type is `http`. The concurrency value is an integer representing the threshold. For example, if you set the concurrency to 100, the platform will add a new replica when each existing replica is handling more than 100 concurrent requests.

You can apply this configuration using the Azure CLI. The following command creates a new container app with an HTTP scaling rule. Note that this command assumes you have already created a Container Apps environment and have a container image ready to deploy.

```azurecli
az containerapp create \
  --name <CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --environment <ENVIRONMENT_NAME> \
  --image <CONTAINER_IMAGE_LOCATION> \
  --min-replicas 1 \
  --max-replicas 5 \
  --scale-rule-name azure-http-rule \
  --scale-rule-type http \
  --scale-rule-http-concurrency 100
```

If you are updating an existing container app, you use the `az containerapp update` command with the same parameters. However, remember that any change to the scaling rules will create a new revision. You can verify this by checking the revisions list in the Azure portal or via the CLI. The new revision will be marked as active once the deployment is complete.

## Verify the scaling behaviour

Once the scaling rules are in place, you need to verify that they are working as expected. The platform does not provide a simple "test scaling" button in the portal. Instead, you need to generate load and observe the replica count. You can use a load testing tool to send concurrent requests to your application and monitor the replica count in the Azure portal or via the `az containerapp revision list` command.

Watch for the following:

1. **Scale-out:** As the number of concurrent requests exceeds the threshold, the replica count should increase. The platform adds replicas one at a time, so you might see a gradual increase rather than a sudden jump.
2. **Scale-in:** When the load subsides, the platform will eventually scale in. The cool-down period for scaling in is 300 seconds by default. This means that the platform will wait 5 minutes after the load drops below the threshold before removing replicas. This prevents flapping, where the application scales up and down rapidly due to transient load spikes.
3. **Revisions:** Check the revisions list to confirm that a new revision was created when you applied the scaling rules. The new revision should have the updated minimum and maximum replica counts.

If the scaling does not behave as expected, check the following:

- **Concurrency Threshold:** Ensure that the threshold is set to a value that is achievable by your application. If the threshold is too high, the platform might not scale out until the application is already struggling.
- **Maximum Replicas:** Ensure that the maximum replica count is high enough to handle the expected load. If the maximum is too low, the platform will stop scaling out once the limit is reached, and the application might become unresponsive.
- **Minimum Replicas:** If you set the minimum to zero, ensure that your application can handle cold starts. If you require immediate availability, set the minimum to one or more.

## Consider TCP and custom rules

HTTP concurrency is not the only scaling trigger. If your application uses TCP connections, you can use a TCP scaling rule. This rule monitors the number of concurrent TCP connections. The calculation is similar to HTTP: the platform averages the number of connections over a 15-second window. If the number of connections exceeds the threshold, a new replica is added.

TCP scaling rules are not supported for Container Apps jobs. They are only supported for long-running container apps. The configuration is similar to HTTP, but you use the `--scale-rule-tcp-concurrency` parameter instead of `--scale-rule-http-concurrency`.

For more complex scenarios, you can use custom scaling rules based on KEDA scalers. This allows you to scale based on metrics like CPU, memory, or external event sources like Azure Service Bus or Azure Event Hubs. Custom rules require more configuration, including authentication and metadata settings, but they provide greater flexibility. For example, you might want to scale based on the number of messages in a queue rather than the number of HTTP requests.

When using custom rules, remember that the cool-down period only applies when scaling in from the final replica to zero. It does not affect the removal of intermediate replicas. This means that if you have five replicas and the load drops, the platform might remove replicas one by one without waiting for the cool-down period, as long as the number of replicas remains above zero.

## Manage revisions and cost

Because scaling rules are immutable, every change creates a new revision. This can lead to a proliferation of revisions if you are frequently adjusting your scaling configuration. It is good practice to review and clean up old revisions periodically. You can delete inactive revisions to free up resources and reduce management overhead.

Cost management is also important. Scaling to zero can significantly reduce costs for intermittent workloads. However, if your application requires high availability, scaling to zero might introduce latency due to cold starts. In such cases, setting a minimum replica count of one or more is a better option, even though it incurs a baseline cost. You can balance cost and performance by adjusting the minimum and maximum replica counts and the concurrency threshold.

Finally, remember that scaling rules are applied per revision. If you have multiple revisions active, each revision will scale independently based on its own rules. This can lead to unexpected behaviour if you are not careful. Ensure that all active revisions have consistent scaling rules, or use active revisions mode to ensure that only one revision is active at a time.

By defining clear scaling limits and concurrency thresholds, you can ensure that your container application scales efficiently and predictably. Start with conservative values, monitor the behaviour under load, and adjust as needed. The key is to align the scaling rules with your application's performance characteristics and your business requirements for availability and cost.


References for Set application scaling rules around measurable demand: [How to Enable Automatic Scaling](https://learn.microsoft.com/en-us/azure/app-service/manage-automatic-scaling), [Azure Functions Scale and Hosting](https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale), [Scaling in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/scale-app#scale-definition).
