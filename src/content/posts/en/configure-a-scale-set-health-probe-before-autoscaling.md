---
title: "Configure a scale set health probe before autoscaling"
description: "Configure Application Health extension for VMSS instance repairs and upgrades before enabling metric-based autoscaling."
pubDate: 2024-12-11
category: compute
tags: ["azure-virtual-machine-scale-sets", "autoscaling", "application-health", "instance-repairs", "vmss-orchestration"]
translationKey: configure-a-scale-set-health-probe-before-autoscaling
draft: false
---

Autoscaling a Virtual Machine Scale Set (VMSS) based on CPU or memory metrics is often the first step in managing capacity, but it does not account for application health. If the application is hung or the service is down, the VM may still report low CPU usage, and the autoscale engine will not trigger a repair. You need a health probe that understands the application state to drive instance repairs and safe upgrades.

The Application Health extension provides this capability by monitoring the application from inside the VM. It is important to distinguish this from the load balancer health probe. The load balancer probe checks connectivity and is used for traffic distribution. The Application Health extension checks the application's internal state and is used by the scale set orchestration engine for repairs and upgrades. You cannot use both simultaneously for orchestration purposes; you must choose one source of health monitoring for the scale set.

[![VMSS Health and Autoscaling Flow](/images/posts/2024/azc-124-checkpoints.svg)](/images/posts/2024/azc-124-checkpoints.svg)

## Choose between Binary and Rich Health States

The Application Health extension offers two modes: Binary Health States and Rich Health States. Your choice depends on whether you need an initialisation grace period for new instances and whether you want to use custom health logic in your application response.

Binary Health States are simpler. An instance is *Healthy* if it receives a successful TCP handshake or an HTTP 200 response. If it does not, the instance is marked *Unhealthy*. This mode is suitable if you do not need a grace period for new instances and do not require custom health logic in the response body.

Rich Health States provide more control. They introduce *Initializing* and *Unknown* states. The *Initializing* state allows new instances to settle before being marked as healthy or unhealthy, which is useful for rolling upgrades. You can also send custom health signals via the HTTP response body. For example, a response body of `{"ApplicationHealthState": "Healthy"}` marks the instance as healthy, while `{"ApplicationHealthState": "Unhealthy"}` marks it as unhealthy. If the response code is not 2xx, or the body is missing or invalid, the instance is marked as *Unknown*. Both *Unhealthy* and *Unknown* states trigger instance repairs if enabled.

## Configure the Application Health extension

You can deploy the Application Health extension using the Azure portal, Azure CLI, or Azure PowerShell. The extension requires a publisher, type, and settings for the protocol and port.

### Binary Health States

For Binary Health States, use type handler version 1.0. The extension expects a TCP connection or an HTTP/HTTPS request. If you use HTTP or HTTPS, you must specify a request path. If you use TCP, you must specify a port.

```json
{
  "extensionProfile": {
    "extensions": [
      {
        "name": "HealthExtension",
        "properties": {
          "publisher": "Microsoft.ManagedServices",
          "type": "ApplicationHealthWindows",
          "autoUpgradeMinorVersion": true,
          "typeHandlerVersion": "1.0",
          "settings": {
            "protocol": "http",
            "port": 80,
            "requestPath": "/health",
            "intervalInSeconds": 5,
            "numberOfProbes": 1
          }
        }
      }
    ]
  }
}
```

### Rich Health States

For Rich Health States, use type handler version 2.0. This version supports the `gracePeriod` setting, which defines how long an instance remains in the *Initializing* state before transitioning to *Healthy*, *Unhealthy*, or *Unknown*. The grace period is calculated as `intervalInSeconds` multiplied by `numberOfProbes`, with a maximum of 7200 seconds.

```json
{
  "extensionProfile": {
    "extensions": [
      {
        "name": "HealthExtension",
        "properties": {
          "publisher": "Microsoft.ManagedServices",
          "type": "ApplicationHealthWindows",
          "autoUpgradeMinorVersion": true,
          "typeHandlerVersion": "2.0",
          "settings": {
            "protocol": "http",
            "port": 80,
            "requestPath": "/health",
            "intervalInSeconds": 5,
            "numberOfProbes": 3,
            "gracePeriod": 600
          }
        }
      }
    ]
  }
}
```

## Enable Automatic Instance Repairs

Once the Application Health extension is deployed, you can enable Automatic Instance Repairs. This feature uses the health status reported by the extension to automatically replace unhealthy instances. When an instance is marked as *Unhealthy* or *Unknown* (in Rich Health States), the scale set will replace it with a new instance.

To enable repairs, go to the scale set in the Azure portal, select **Instance repairs** under **Settings**, and toggle **Enable automatic instance repairs**. You can also configure the repair policy to specify how many instances to repair simultaneously and the maximum number of repairs per hour.

## Verify the Configuration

To verify that the Application Health extension is working, check the health status of the instances in the scale set. In the Azure portal, navigate to the **Instances** blade and look at the health status column. You should see *Healthy*, *Unhealthy*, or *Initializing* (if using Rich Health States) for each instance.

You can also test the extension by stopping your application or returning a non-200 status code from the health endpoint. The instance should transition to *Unhealthy* or *Unknown* within the configured interval. If Automatic Instance Repairs is enabled, a new instance should be created to replace the unhealthy one.

## Next Steps

With the Application Health extension configured and Automatic Instance Repairs enabled, your scale set can now respond to application failures. You can still use metric-based autoscaling for capacity management, but the health extension ensures that unhealthy instances are replaced promptly. This combination provides a robust foundation for managing scale set reliability and availability.

For more information on autoscaling rules, see the [Autoscale Virtual Machine Scale Sets in the Azure portal](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-autoscale-portal) documentation. For details on the Application Health extension, refer to the [Use Application Health extension with Azure Virtual Machine Scale Sets](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-health-extension) guide.
