---
title: "Choose a placement approach for tightly coupled compute jobs"
description: "Configure Azure Batch pools across availability zones, handling SKU constraints and inter-node communication limits."
pubDate: 2026-01-02
category: compute
tags: ["azure-batch", "availability-zones", "fault-tolerance", "compute", "infrastructure"]
translationKey: choose-a-placement-approach-for-tightly-coupled-compute-jobs
draft: false
---

You are designing a Batch pool that must survive a datacentre failure. The first decision is whether your workload can tolerate nodes being distributed across availability zones and whether the application logic can handle the resulting network topology. Azure Batch allows you to create pools with a zonal policy, ensuring that if one zone experiences an infrastructure failure, your compute nodes in the other zones remain available for task scheduling. However, this capability comes with specific constraints regarding VM SKUs, inter-node communication, and region support.

## Prerequisites and constraints

Before configuring a zonal pool, you must verify that your environment supports it. The Batch service maintains parity with Azure on availability zone support, so the region must support zones for the specific VM SKU you intend to use.

### Validate VM SKU support

You cannot create a zonal pool if the requested VM SKU is only available in a single zone. You can validate this by calling the Resource Skus List API and checking the `locationInfo` field of the `resourceSku` object. Ensure that more than one zone is listed for your target region.

Additionally, if you are using a user subscription mode Batch account, check for zone offer restrictions. Call the same API and inspect the `ResourceSkuRestrictions` field. If a restriction exists, you must submit a support ticket to remove it before proceeding.

### Inter-node communication limitation

A critical constraint for tightly coupled workloads is that you cannot create a pool with a zonal policy if it has inter-node communication enabled and uses a VM SKU that supports InfiniBand. If your application requires both low-latency inter-node communication and zonal distribution, you must choose one or the other, or use a VM SKU that does not support InfiniBand. This trade-off is particularly relevant for High-Performance Computing (HPC) scenarios where node proximity matters.

## Creating the pool

The Batch service will attempt to allocate your pool across all availability zones in the selected region. You cannot specify a particular allocation ratio across the zones; the service manages the distribution to ensure resilience. The allocation is contingent on the VM SKU's support for zones in that region.

### Using the .NET SDK

The following example demonstrates how to create a pool with a zonal node placement policy using the Azure Batch Management Client .NET SDK. This code assumes you have already authenticated and have a valid Batch account resource ID.

```csharp
var credential = new DefaultAzureCredential();
ArmClient _armClient = new ArmClient(credential);

var batchAccountIdentifier = ResourceIdentifier.Parse("your-batch-account-resource-id");
BatchAccountResource batchAccount = _armClient.GetBatchAccountResource(batchAccountIdentifier);

var poolName = "zonal-pool-example";
var imageReference = new BatchImageReference()
{
    Publisher = "canonical",
    Offer = "0001-com-ubuntu-server-jammy",
    Sku = "22_04-lts",
    Version = "latest"
};
string nodeAgentSku = "batch.node.ubuntu 22.04";

var batchAccountPoolData = new BatchAccountPoolData()
{
    VmSize = "Standard_DS1_v2",
    DeploymentConfiguration = new BatchDeploymentConfiguration()
    {
        VmConfiguration = new BatchVmConfiguration(imageReference, nodeAgentSku)
        {
            // This setting enables zonal distribution
            NodePlacementPolicy = BatchNodePlacementPolicyType.Zonal,
        },
    },
    ScaleSettings = new BatchAccountScaleSettings()
    {
        FixedScale = new BatchFixedScaleSettings()
        {
            TargetDedicatedNodes = 5,
            ResizeTimeout = TimeSpan.FromMinutes(15),
        }
    },
};

ArmOperation<BatchAccountPoolResource> armOperation = batchAccount.GetBatchAccountPools().CreateOrUpdate(
    WaitUntil.Completed, poolName, batchAccountPoolData);
BatchAccountPoolResource pool = armOperation.Value;
```

This code sets the `NodePlacementPolicy` to `Zonal`. The Batch service will then distribute the five dedicated nodes across the available zones in the region. Note that `Standard_DS1_v2` is used as an example; ensure this SKU supports zones in your target region.

### Using the REST API

If you prefer using the REST API, you can create the pool by sending a `POST` request to the pools endpoint. The key is to include the `nodePlacementConfiguration` object with the `policy` set to `Zonal`.

```http
POST {batchURL}/pools?api-version=2021-01-01.13.0
client-request-id: 00000000-00-00-00-00-000000000000
```

Request body:

```json
{
    "id": "zonal-pool-rest-example",
    "vmSize": "standard_ds1_v2",
    "virtualMachineConfiguration": {
        "imageReference": {
            "publisher": "Canonical",
            "offer": "UbuntuServer",
            "sku": "20.04-lts"
        },
        "nodePlacementConfiguration": {
            "policy": "Zonal"
        },
        "nodeAgentSKUId": "batch.node.ubuntu 20.04"
    },
    "resizeTimeout": "PT15M",
    "targetDedicatedNodes": 5,
    "targetLowPriorityNodes": 0,
    "maxTasksPerNode": 3,
    "enableAutoScale": false,
    "enableInterNodeCommunication": false
}
```

In this example, `enableInterNodeCommunication` is set to `false`. If your workload requires inter-node communication, you must ensure that the VM SKU does not support InfiniBand, as previously noted.

## Verification

After creating the pool, verify that the nodes are distributed across zones. You can do this by checking the pool details in the Azure portal or by querying the Batch service API. The pool should show nodes in multiple availability zones, confirming that the zonal policy was applied successfully.

If the pool fails to allocate nodes, check the following:
1. **Region support:** Ensure the region supports availability zones.
2. **SKU support:** Verify that the VM SKU is available in more than one zone.
3. **Quotas:** Check that your Batch account has sufficient core quota to support the number of nodes.
4. **Restrictions:** Confirm that there are no zone offer restrictions on the VM SKU.

Checking the node distribution confirms whether the zonal policy was applied as intended, allowing you to proceed with confidence in your fault tolerance strategy.


References for Choose a placement approach for tightly coupled compute jobs: [Create a pool across availability zones](https://learn.microsoft.com/en-us/azure/batch/create-pool-availability-zones), [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools).
