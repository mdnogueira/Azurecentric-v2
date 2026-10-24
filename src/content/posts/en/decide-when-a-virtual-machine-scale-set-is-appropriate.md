---
title: "Decide when a virtual machine scale set is appropriate"
description: "Decide between Azure VMs and Scale Sets by comparing orchestration modes, scaling needs, and specific feature constraints."
pubDate: 2024-10-11
category: compute
tags: []
translationKey: decide-when-a-virtual-machine-scale-set-is-appropriate
draft: true
---

You are planning a multi-instance deployment. The immediate question is whether to use individual Azure Virtual Machines or a Virtual Machine Scale Set. The answer depends on whether you need platform-managed orchestration for scaling, updates, and instance replacement, or if you require full individual control over each machine's lifecycle and management features.

Scale sets are designed for deployments where the platform manages the group. They allow you to define a configuration model and automatically add or remove instances based on metrics or schedules. Individual VMs are better when you need distinct management capabilities, such as capturing images from specific instances or using features that are not yet supported in scale set orchestration modes.

## Orchestration modes and their implications

Azure Virtual Machine Scale Sets offer two orchestration modes: Uniform and Flexible. This choice is critical because it determines which features are available and how you manage the instances. The orchestration mode is defined at creation and cannot be changed later.

Uniform orchestration is optimised for large-scale stateless workloads with identical instances. It uses a VM profile to scale up to a desired capacity. However, individual instances in a Uniform scale set are exposed via the Virtual Machine Scale Set VM API commands, not the standard Azure IaaS VM API commands. This means you cannot use standard Azure management features such as Azure Resource Manager resource tagging, RBAC permissions on individual instances, Azure Backup, or Azure Site Recovery for those specific VM instances. Uniform orchestration provides fault domain high availability guarantees when configured with fewer than 100 instances.

Flexible orchestration provides a unified experience across the Azure VM ecosystem. It manages standard Azure IaaS VMs, giving you full control over the VM lifecycle, network interfaces, and disks using standard Azure APIs. This mode supports high availability guarantees up to 1,000 VMs by spreading instances across fault domains or availability zones. It is suitable for quorum-based workloads, stateful applications, and services that require mixing VM types or Spot and on-demand instances. Flexible orchestration supports all VM sizes, though constraints apply to VMs that do not support memory-preserving updates when fixed spreading is used.

## When to choose individual Virtual Machines

Individual Virtual Machines are appropriate when you need features that are currently exclusive to the VM resource type or when the workload does not benefit from automated orchestration.

Some features are only available in individual VMs. For example, you can capture an image from a VM in a flexible scale set, but not from a VM in a uniform scale set. You can also migrate an individual VM from classic disks to managed disks, but you cannot migrate VM instances in a uniform scale set. If your deployment requires these specific migration or imaging workflows on individual instances, a scale set may not be the right tool.

Additionally, if you need to manage each instance independently with full RBAC permissions, Azure Backup, or Azure Site Recovery, individual VMs provide this control natively. In a Uniform scale set, these features are not available for individual instances. Even in Flexible orchestration, while you have more control, the scale set still manages the group lifecycle. If you need to add or remove existing VMs to the group dynamically, only Flexible orchestration supports this, but individual VMs outside a scale set offer the most granular control.

## When to choose Virtual Machine Scale Sets

Scale sets are useful for any multi-VM deployment where you want to define whether instances are spread across availability zones or fault domains, coordinate platform updates to reduce downtime, and use orchestrations and batch instance management.

Key scale set-specific features include the ability to update the capacity property to deploy more VMs in parallel, which is more efficient than scripting individual deployments. You can use Azure Autoscale to automatically add or remove instances based on predefined schedules, metrics, or predictive AI. You can also specify an upgrade policy to roll out upgrades across VMs in the scale set, whereas with individual VMs, you must orchestrate updates yourself.

Overprovisioning is another feature available in Uniform orchestration mode that improves provisioning success rates and reduces deployment time. With overprovisioning turned on, the scale set spins up more VMs than requested and deletes the extras once the requested number are successfully provisioned. You are not billed for the extra VMs, and they do not count toward quota limits. However, this can cause confusing behavior for applications not designed to handle extra VMs appearing and disappearing.

Limits also play a role in the decision. A scale set built on a Marketplace image or a user-defined custom image in an Azure Compute Gallery and configured to use Azure Managed Disks supports a capacity of up to 1,000 VMs. If you configure your scale set to support more than 100 VMs, not all scenarios work the same, such as load balancing. A scale set configured with user-managed storage accounts is limited to 100 VMs, with 5 storage accounts recommended for this scale.

## Decision criteria

To decide between individual VMs and a scale set, consider the following:

1. **Scaling and Automation**: Do you need automatic scaling based on metrics or schedules? If yes, a scale set is appropriate. Individual VMs require manual or scripted scaling.
2. **Management Features**: Do you need Azure Backup, Azure Site Recovery, or individual RBAC permissions on each instance? If yes, individual VMs or Flexible orchestration scale sets are better. Uniform scale sets do not support these features for individual instances.
3. **Workload Type**: Is the workload stateless and identical across instances? Uniform scale sets are optimised for this. Is it stateful or requires mixing VM types? Flexible orchestration scale sets are suitable.
4. **Feature Requirements**: Do you need to capture images from individual instances or migrate disks? Individual VMs support these features. Scale sets have limitations here.
5. **Scale**: Do you need more than 100 instances? Scale sets support up to 1,000 VMs in Flexible orchestration. Uniform scale sets are limited to 100 instances for fault domain guarantees.

By evaluating these criteria against your specific workload requirements, you can determine whether individual Virtual Machines or a Virtual Machine Scale Set is the appropriate choice for your deployment.

### Verification

To verify your choice, review the feature matrix in the [Orchestration modes for Virtual Machine Scale Sets in Azure](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-orchestration-modes) documentation. Compare the features required for your workload against the supported features in Uniform and Flexible orchestration modes, as well as individual VMs. Ensure that the selected option meets your scaling, management, and availability requirements.

tags: [azure-virtual-machines, virtual-machine-scale-sets, azure-compute, cloud-architecture, infrastructure-as-code]
diagram: {title:
