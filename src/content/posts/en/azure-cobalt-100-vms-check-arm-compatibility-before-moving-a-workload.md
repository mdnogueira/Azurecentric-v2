---
title: "Azure Cobalt 100 VMs: check Arm compatibility before moving a workload"
description: "Verify Arm compatibility and select the correct Cobalt 100 VM series before migrating workloads to the new general-purpose and memory-optimized sizes."
pubDate: 2024-10-19
category: compute
tags: ["azure-virtual-machines", "arm-architecture", "cobalt-100", "migration", "compatibility"]
translationKey: azure-cobalt-100-vms-check-arm-compatibility-before-moving-a-workload
draft: false
---

You are planning to move a workload to Azure Cobalt 100-based Virtual Machines to take advantage of the improved price performance, but you need to confirm whether your current infrastructure can actually run on the new silicon. The first thing to check is not the pricing or the region availability, but whether your operating system and application binaries are compatible with the 64-bit Arm architecture.

Azure Cobalt 100-based VMs are built on Microsoft’s first 64-bit Arm-based processor. They are not x86 machines. If your workload relies on x86-specific binaries, drivers, or libraries, it will not run on these VMs regardless of how well the underlying hardware is optimised. The announcement of general availability on 16 October 2024 confirms that the Dpsv6, Dplsv6, Epsv6 series and their disk-enabled variants (Dpdsv6, Dpldsv6, Epdsv6) are now production-ready, but the architectural shift remains the primary constraint for migration [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/).

## Confirm the architecture of your current workload

Before selecting a VM size, you must determine if your application stack is Arm-native or x86-dependent. This is a binary decision that dictates your migration path.

If you are running Linux workloads, check the architecture of your base image and installed packages. Most modern Linux distributions, including Ubuntu, provide native Arm packages. Canonical has confirmed that the vast majority of Ubuntu packages are compiled and available for Arm, which facilitates a smooth transition for many infrastructure components [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/). However, you still need to verify that any custom binaries, proprietary drivers, or specific versions of databases are available in Arm form.

If you are running Windows workloads, the situation is more restrictive. Windows Server on Arm is supported, but the ecosystem of x86 applications is not directly compatible. You cannot simply swap an x86 VM for an Arm VM and expect the same binaries to execute. You must ensure that your application has an Arm-compatible version or that you can containerise it with an Arm-based image.

Deploying an x86-based OS image on an Arm VM results in a guest OS that cannot boot or execute code, as the binary architecture is incompatible with the Cobalt 100 silicon. Even with an Arm OS image, x86-specific binaries, drivers, or libraries will not run. You must ensure the guest operating system itself is built for Arm64.

## Check container and orchestration support

Many workloads are moving to containers, which can abstract the underlying host architecture. If your workload is containerised, you need to verify that your container images are built for Arm64.

Azure Kubernetes Service (AKS) supports the creation of Arm agent nodes. You can mix x86 and Arm architecture nodes within the same cluster, which allows for a gradual migration strategy. However, the pods scheduled on the Arm nodes must use Arm-compatible container images. If your CI/CD pipeline builds x86 images by default, you will need to update your build definitions to produce Arm64 images for the new Cobalt 100 nodes [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/).

GitHub Actions, often used for CI/CD, now offers Arm-hosted runners. This means you can build and test your Arm-compatible artifacts directly in the cloud without needing local Arm hardware. This is a significant enabler for developers who need to validate their software before deploying it to the new VM series [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/).

## Select the correct VM series

Once you have confirmed Arm compatibility, you can choose from the available Cobalt 100 VM series. These are designed for different workload profiles and include variants with and without local NVMe storage:

*   **Dpsv6-series and Dpdsv6-series:** General purpose VMs with up to 96 vCPUs and a 4:1 memory-to-vCPU ratio. They are ideal for scale-out workloads, cloud-native solutions like AKS, small to medium open-source databases, application servers, and web servers. The Dpdsv6 variant includes local NVMe storage [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/).
*   **Dplsv6-series and Dpldsv6-series:** These VMs provide up to 96 vCPUs with a 2:1 memory-to-vCPU ratio. They are perfect for media encoding, small databases, gaming servers, microservices, and workloads that don't need high RAM per vCPU. The Dpldsv6 variant includes local NVMe storage [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/).
*   **Epsv6-series and Epdsv6-series:** Memory-optimized VMs with up to 96 vCPUs and a ratio of up to 8:1. These are designed for memory-intensive workloads such as large databases, in-memory caching applications, and data analytics. The Epdsv6 variant includes local NVMe storage [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/).

All these series support Standard SSD, Premium SSD, and Ultra Disk storage. They are available in regions such as Canada Central, Central US, East US 2, East US, Germany West Central, Japan East, Mexico Central, North Europe, Southeast Asia, Sweden Central, Switzerland North, UAE North, West Europe, and West US 2 [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/).

## Verify deployment prerequisites

You can deploy these VMs using the Azure portal, SDKs, APIs, PowerShell, or the Azure CLI. When creating a VM, you must explicitly select an Arm-based size. If you try to deploy an x86-based OS image on an Arm VM, the deployment will fail. Conversely, if you try to deploy an Arm image on an x86 VM, it will also fail.

To verify compatibility before committing to a full migration, consider deploying a single test VM in a non-production environment. Use the same OS image and application configuration as your production workload. Monitor the boot process and application startup to ensure there are no architecture-related errors. This small-scale test can save significant time and effort later.

## Consider cost and performance implications

Compared to previous generation Azure Arm-based VMs, Cobalt 100 VMs offer up to 50% better price performance and up to 1.4x CPU performance for specific benchmarks [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/). However, price performance is not the same as absolute cost. You must compare the specific vCPU and memory costs of the Dpsv6, Dplsv6, or Epsv6 series against your current x86 or previous-generation Arm VMs in the same region. Use the Azure Pricing Calculator to model the costs for your expected workload duration. You can also take advantage of Reserved Instances, Azure Savings Plans for Compute, and Spot Virtual Machines to lower costs [Azure Cobalt 100 VMs: check Arm compatibility before moving a workload](https://azure.microsoft.com/en-us/blog/azure-cobalt-100-based-virtual-machines-are-now-generally-available/).

## Next steps

If your workload is Arm-compatible, you can proceed with deployment. If it is not, you have two options: migrate the application to an Arm-native version, or continue using x86-based VMs. There is no hybrid mode where x86 binaries run on Cobalt 100 hardware.

Check the Azure Virtual Machines pricing page for current costs and the Azure Virtual Machines documentation for detailed specifications. If you are unsure about your application’s compatibility, consult the vendor’s documentation for Arm support or test in a sandbox environment first.

The decision to move to Cobalt 100 is not just about hardware; it is about ensuring your entire software stack is ready for the Arm architecture. Verify compatibility, test thoroughly, and then leverage the performance and efficiency gains.
