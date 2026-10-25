---
title: "Azure Local: understand the operating model announced at Ignite"
description: "Clarify the Azure Local operating model: cloud-connected infrastructure enabled by Azure Arc, with customer-operated hardware and control."
pubDate: 2024-11-23
category: cloud
tags: ["azure-local", "azure-stack-hci", "azure-arc", "hybrid-cloud", "ignite-2024"]
translationKey: azure-local-understand-the-operating-model-announced-at-ignite
draft: false
---

Azure Local is the new name for the infrastructure solution previously known as Azure Stack HCI. It is not a separate product line but a rebranding that signals a shift in how Microsoft positions hybrid infrastructure. The core operating model remains consistent: you own the hardware, you control the operations, and Azure Arc provides the management plane. The announcement at Ignite 2024 clarifies that Azure Local is cloud-connected infrastructure, meaning the control plane lives in Azure, but the data plane stays local.

The first thing to understand is the relationship between Azure Local and Azure Arc. Azure Local is enabled by Azure Arc. You do not install Azure Arc separately to get management; it is part of the Azure Local software stack, which is packaged as Azure Arc extensions installed onto your machines. This is distinct from using Azure Arc-enabled servers, where you connect existing infrastructure to Azure. Azure Local is for new or refreshed infrastructure at distributed locations. If you already have servers, you use Azure Arc. If you need new infrastructure, you use Azure Local.

## Ownership and Operational Control

A common misconception is that "cloud-connected" implies Microsoft manages the workload. It does not. The operating model is customer-operated. You own the hardware and have operational control of your Azure Local environment. Day-to-day monitoring, management, support, and other functions are surfaced through Azure tools, but actions are customer-initiated. For example, when a software update is available, a notification appears in the Azure portal, but you control when the update gets applied.

This separation of control and data planes is critical for distributed locations. You can operate and scale distributed infrastructure using the Azure portal and APIs. You can run foundational Azure compute, networking, storage, and application services locally. The Azure Local software is packaged as Azure Arc extensions that are seamlessly installed onto your machines. This allows you to treat physical machines like cloud resources, using Azure portal and APIs to perform lifecycle operations like deployment, configuration, updates, and monitoring. This removes the need for separate local management tools and enables a more unified approach across cloud resources and distributed locations.

## Hardware Flexibility and Options

Azure Local offers flexible hardware and software options to precisely meet your requirements and budget. It works with more than 100 validated hardware platforms, including Premier solutions from Dell and Lenovo. Most solutions offer multiple storage and networking options, and many support the addition of powerful GPUs like Nvidia A2, A16, and L40 which can be used to accelerate AI workloads and/or virtual desktops. Many solutions can be purchased outright or as-a-service through programs like Dell APEX, HPE GreenLake, and Lenovo TruScale.

For situations with lighter computing requirements or budget constraints, Azure Local works with a variety of micro, tower, and rugged/industrial hardware that will be added to the solutions catalog over the coming months. The bare minimum hardware required is just one compatible machine with one additional SSD (besides boot). To provide high availability, you can connect multiple machines with simple 1 Gbps Ethernet networking, removing the need for high-speed switch(es). Compared to rack servers, this reduces the total hardware cost considerably.

Azure Local also works with or without Active Directory. If you’d prefer not to manage an on-premises Active Directory, choose the new Local identity option that uses local accounts and certificates to achieve all the same functionality as when the infrastructure is AD-joined, like VM live migration. In this option, Azure Local uses Azure Key Vault to back up your local secrets and recovery keys.

## Management and Updates

Azure Local software updates are combined into a single monthly package that covers the complete infrastructure software stack, plus OEM content like drivers and firmware for Premier solutions. You can conveniently view and manage Azure Local updates directly in Azure Update Manager, alongside other cloud resources. Select one or multiple Azure Local instances and apply updates with just a few clicks. Behind the scenes, Azure Local orchestrates moving workloads and updating each physical machine in sequence, to ensure that updates in multi-node environments are non-disruptive. You always control when to apply updates.

Azure Local integrates natively with Azure Monitor for unified observability across cloud resources and distributed locations, enabled by Azure Arc. You can monitor your distributed VMs, Kubernetes clusters, and physical infrastructure from a single pane of glass. Azure Local comes with 50+ standard Metrics, out-of-the-box Insights dashboards, and Alerts rules for the infrastructure stack. For example, you can track utilization of processor, memory, storage, and network capacity in the Azure portal, and set up email notifications or automated actions for when hardware fails. You can fully customize what’s collected with Data Collection Rules and how it’s visualised with Workbooks.

## Security and Compliance

Azure Local is deployed with a hardened infrastructure security posture by default. Secured-Core settings are automatically applied, data is automatically encrypted, and app control is automatically enforced. Machines configured for Azure Local comply with all applicable settings in the Azure security baseline, streamlining hundreds of configuration options compared to a general-purpose server with default settings.

To help you detect and correct drift over time, Azure Local integrates with Microsoft Defender for Cloud. This provides unified security tooling for all your resources, across cloud regions and distributed locations. In addition to workload protections for VMs and Kubernetes clusters, new built-in security recommendations cover your Azure Local infrastructure as part of the Cloud Security Posture Management plan. For example, if your hardware isn’t configured correctly, or if your storage isn’t encrypted, you’ll see it prominently within the Microsoft Defender for Cloud portal and reflected in your overall Secure Score.

Network segmentation is available in preview. Network security groups enable you to precisely filter network traffic between VMs using inbound and outbound allow and deny rules. Rules support the full five-tuple of source IP, source port, destination IP, destination port, and protocol, and are enforced within the virtual switch at the virtual port level. Trusted launch is also available in preview, hardening VMs against malware-based rootkits and boot kits. With Trusted launch, VMs get a virtual Trusted Platform Module (vTPM) that enables Secure Boot and guest OS features like BitLocker data encryption. vTPM state is seamlessly preserved when the VM moves around the Azure Local cluster, enabling live migration and automatic failover.

## Disconnected Operations

The simplest way to use Azure Local is connected to an Azure region. Your apps and data reside locally; the management services and portal are in the cloud. But if regulations or other constraints prevent you from connecting, Azure Local also offers disconnected operations for prequalified customers. In this option, you host the backend Azure portal, Azure Resource Manager, and Azure services like Key Vault yourself in your environment, packaged as a sizeable VM appliance. Doing so enables the same operational experience for VMs, Kubernetes clusters, and other resources, right down to the same APIs, without any connection to an Azure region at all.

Azure Local with disconnected operations is only available to customers who prequalify. This is a significant distinction from the standard connected model. It allows for disconnected mode operations, but requires prequalification and a different deployment model.

## Migration and Existing Customers

For existing customers of Azure Stack HCI, there is no action required. Simply continue applying the latest updates to transition seamlessly to Azure Local. You’ll continue to have access to the same features and functionality under the new name. In addition, you’ll see new features appear in the Azure portal over the coming months, and you’ll receive the same pricing and other enhancements as new Azure Local customers.

If you have an aging VMware by Broadcom environment, you can migrate VMs to your new Azure Local infrastructure with Azure Migrate (in preview). Using the same Azure portal and APIs as migrating to a cloud region, you can copy and convert your VMDKs to Azure Local VMs entirely on-location, with only metadata transiting the cloud. This may enable you to reduce your Broadcom footprint and licensing without costly app rewrites.

Azure Local is generally available for production use. Version 2411 is available now. Explore the solutions catalog to find hardware from your preferred vendor and read the deployment overview to get started today. Over the coming months, you can anticipate more low-spec, low-cost options will be added to the catalog. For evaluation, you can get a dedicated Azure Local sandbox in one click with Azure Arc Jumpstart. All you need is an Azure subscription to get started.


References for Azure Local: understand the operating model announced at Ignite: [Azure Local: understand the operating model announced at Ignite](https://techcommunity.microsoft.com/blog/azurearcblog/introducing-azure-local-cloud-infrastructure-for-distributed-locations-enabled-b/4296017/), [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview), [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview).
