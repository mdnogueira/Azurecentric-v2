---
title: "Set a budget boundary around a compute experiment"
description: "Set a budget boundary for Azure Batch experiments using Cost Management filters for service or user subscription modes."
pubDate: 2025-11-10
category: hpc-ai
tags: ["cost-management", "hpc", "azure-batch", "budgets", "alerts"]
translationKey: set-a-budget-boundary-around-a-compute-experiment
draft: false
---

You are running a compute experiment with Azure Batch and need to ensure the bill stays within a fixed limit. The most direct way to do this is to create a budget in Azure Cost Management and apply a filter that isolates the resources belonging to that specific experiment.

Azure Batch itself is a free service, but the underlying virtual machines, managed disks, storage, and networking used by the pools incur charges. To set a meaningful boundary, you must filter the cost analysis to show only the resources associated with your Batch account or pool. This prevents the budget from being diluted by other subscription costs and ensures alerts trigger when the experiment itself exceeds its allowance.

## Understand what you are budgeting for

Before creating the budget, it helps to know what drives the cost. The largest expense is typically the virtual machines allocated for pool nodes. If you are using Virtual Machine Configuration, each VM also uses an Azure-managed OS disk, which adds to the cost. You will also see charges for data transfer, storage of application packages and input/output files, and standard load balancers used by the pool [Get cost analysis and set budgets for Azure Batch](https://learn.microsoft.com/en-us/azure/batch/budget).

Azure Batch accounts can be created in two modes: Batch service mode or user subscription mode. This choice affects how you identify the resources in Cost Management. In Batch service mode, the pool resources are managed by the Batch service and appear under a specific resource filter. In user subscription mode, the resources are created in your subscription and are best identified using tags [Get cost analysis and set budgets for Azure Batch](https://learn.microsoft.com/en-us/azure/batch/budget).

## Identify the correct filter for your Batch mode

The first step is to determine whether your Batch account uses Batch service mode or user subscription mode. This dictates how you will filter the cost data.

### For Batch service mode

If your Batch account is in Batch service mode, the pools are identified by their resource name. You can filter the cost analysis by selecting the specific Batch pool. This gives you a view of the accumulated costs for that pool, including the VMs and associated resources [Get cost analysis and set budgets for Azure Batch](https://learn.microsoft.com/en-us/azure/batch/budget).

### For user subscription mode

If your Batch account is in user subscription mode, the pools are not listed under the **Resource** filter in Cost Management. Instead, you must use tags. You should have tagged your Batch pools with a unique identifier, such as `poolname`, when you created them. You can then filter the cost analysis by this tag to see the costs for specific pools [Get cost analysis and set budgets for Azure Batch](https://learn.microsoft.com/en-us/azure/batch/budget).

## Create the budget and set alerts

Once you have identified the correct filter, you can create the budget. This process is done through Azure Cost Management.

1. In the Azure portal, navigate to **Cost Management + Billing**.
2. Select the subscription that contains your Batch account.
3. Under **Cost Management**, select **Cost analysis**.
4. Apply the filter you identified in the previous step:
   - For **Batch service mode**: Select **Resource** and choose your Batch pool.
   - For **user subscription mode**: Select **Tag**, then choose your tag key (e.g., `poolname`) and the specific pool value.
5. With the filter applied, select **Budget: none** and then **Create new budget**.
6. Configure the budget amount, the time period (e.g., monthly), and the alert thresholds (e.g., 60%, 80%, 100%) [Get cost analysis and set budgets for Azure Batch](https://learn.microsoft.com/en-us/azure/batch/budget).

This budget will now track only the costs associated with your experiment. If the costs exceed the thresholds, you will receive alerts. Note that there can be a delay in spending alerts, so you might slightly exceed the budget before the notification arrives [Get cost analysis and set budgets for Azure Batch](https://learn.microsoft.com/en-us/azure/batch/budget).

## Verify the boundary

After creating the budget, verify that it is working correctly. Return to the **Cost analysis** page and ensure the filter is still applied. Check that the accumulated costs shown match the expected usage of your Batch pool. If you see costs from other resources, double-check your filter settings.

You can also check the budget status in the **Budgets** section of Cost Management. This will show you the current spend against the budget and any alerts that have been triggered. If the experiment is still running, you can adjust the budget amount or alert thresholds as needed.

## Clean up after the experiment

When the experiment is complete, remember to delete the Batch pool and any associated resources. However, be aware that some resources might continue to exist and incur costs even after the Batch pool is deleted. These can include virtual machines, disks, virtual networks, and load balancers [Plan to manage costs for Azure Batch](https://learn.microsoft.com/en-us/azure/batch/plan-to-manage-costs). Ensure you delete these resources to avoid unexpected charges.

By setting a budget with the correct filter, you have a clear boundary for your experiment. This allows you to monitor costs closely and take action if the spend starts to rise. It also provides a safety net, ensuring that the experiment does not inadvertently impact the rest of your subscription's budget.

## Next steps

- Review the [Azure Cost Management documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets) for more details on creating and managing budgets.
- Explore [Azure Batch cost optimization strategies](https://learn.microsoft.com/en-us/azure/batch/plan-to-manage-costs) to further reduce costs during your experiment.
- Consider using [Azure Spot VMs](https://learn.microsoft.com/en-us/azure/batch/batch-spot-vms) for non-critical workloads to take advantage of surplus computing capacity at a lower cost.
