---
title: "Prepare permissions before onboarding Copilot for Security"
description: "Clarify that the community repo covers code contributions, not service onboarding permissions, and direct readers to official deployment docs."
pubDate: 2024-06-16
category: governance
tags: ["copilot-for-security", "azure-rbac", "onboarding", "documentation", "github"]
translationKey: prepare-permissions-before-onboarding-copilot-for-security
draft: false
---

You are preparing to onboard Microsoft Copilot for Security, and the first technical hurdle is often permission management. It is easy to assume that the community repository for the service contains the operational guidance needed to deploy it, but that is not the case. The [Microsoft Copilot for Security Community repository](https://github.com/Azure/Security-Copilot/blob/a6f3ba73e1ad766d5279b63bd333414e3a59b89a/README.md) is strictly for open-source contributions to plugins and connectors. It does not document the Azure Resource Manager permissions, built-in roles, or licensing prerequisites required to enable the service itself.

If you are looking for the steps to configure Azure RBAC for onboarding, you need to look at the official Microsoft Learn documentation, not the community code repository. Conflating the two can lead to confusion about what permissions are actually needed to create the resource versus what permissions are needed to contribute code to the project.

[![Separation of Community Contribution and Service Onboarding](/images/posts/2024/azc-060-checkpoints.svg)](/images/posts/2024/azc-060-checkpoints.svg)

## Distinguish code contribution from service deployment

The [README](https://github.com/Azure/Security-Copilot/blob/a6f3ba73e1ad766d5279b63bd333414e3a59b89a/README.md) in the community repository outlines a workflow for developers: forking the repository, cloning it locally, creating branches, and submitting pull requests. This process requires a GitHub account and adherence to a Contributor License Agreement (CLA). It is a software development lifecycle, not a service deployment guide.

Attempting to derive Azure RBAC roles from this documentation is a category error. The repository describes how to contribute to the *ecosystem* of Copilot for Security (e.g., writing a KQL plugin), not how to *enable* the Copilot for Security resource in your Azure tenant. The permissions required to manage a GitHub repository are entirely separate from the permissions required to create an Azure resource and configure its data connectors.

## Locate the correct onboarding documentation

To onboard Microsoft Copilot for Security, you must follow the official Get started with Microsoft Copilot for Security guidance. This documentation provides the specific steps for:

1.  **Licensing and Availability**: Confirming that your tenant has the appropriate licensing and that the service is available in your region.
2.  **Prerequisites**: Identifying the Azure subscriptions and resource groups where the service will be deployed.
3.  **Permissions**: Specifying the exact Azure built-in roles or custom permissions required for the identity performing the onboarding. Typically, this involves permissions to create resources in the target scope and potentially Reader or Contributor roles on the data source subscriptions if the service needs to ingest data from them.
4.  **Deployment**: The actual steps to enable the service, either through the Azure Portal, PowerShell, or Bicep/ARM templates.

Do not assume that the community repository's structure or contribution guidelines offer any insight into these operational requirements. The service deployment is a managed Azure resource, and its configuration is governed by Azure's resource management policies, not the open-source contribution model.

## Prepare your Azure environment

Before you begin the onboarding process, ensure you have the following:

*   **A valid Azure subscription**: With sufficient quota and licensing for Copilot for Security.
*   **Appropriate Azure RBAC permissions**: The identity you use must have permissions to create resources in the target subscription or resource group. The official documentation will specify the exact roles (e.g., Contributor, Owner, or a custom role). A general Contributor role on the subscription is often sufficient for deployment, but data access may require additional permissions on the source subscriptions.
*   **Identified data sources**: Know which security data sources (e.g., Microsoft Defender for Cloud, Azure Sentinel) you intend to connect. You will need permissions to configure connectors for these sources.

## Verify the deployment

Once you have followed the official onboarding steps, verify that the service is active. Check the Azure Portal for the presence of the Microsoft Copilot for Security resource in your target resource group. Ensure that the connectors are configured and that the service is able to ingest data from your identified sources.

If you encounter permission errors during deployment, refer back to the official Get started documentation for the specific role definitions. Do not look to the community repository for troubleshooting deployment issues, as it is not designed for that purpose.

The community repository remains a valuable resource for extending the capabilities of Copilot for Security through custom plugins, but it is not the source of truth for service onboarding. Keep your operational and development guidance separate to avoid confusion and ensure a smooth deployment.
