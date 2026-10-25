---
title: "Review the plugins available to a Copilot for Security session"
description: "Use the Security Copilot sample prompt library to identify supported security domains, distinguishing content scope from active tenant configuration."
pubDate: 2025-05-20
category: governance
tags: ["security-copilot", "plugins", "data-sources", "azure-security", "how-to"]
translationKey: review-the-plugins-available-to-a-copilot-for-security-session
draft: false
---

You are working in Microsoft Security Copilot and need to understand which security domains the product can address. The interface does not always provide a static list of active data sources or plugins. Instead, the most reliable way to understand the scope of capabilities is to look at the official sample prompt library. This library categorises examples by the underlying security domain, giving you a clear view of what the product is designed to support.

## Use the sample prompt library as a reference

[![Security Copilot Plugin Verification Flow](/images/posts/2025/azc-181-checkpoints.svg)](/images/posts/2025/azc-181-checkpoints.svg)

Microsoft maintains a Sample Prompts Library on GitHub. This is not a live inventory of your tenant’s configuration, but it is a definitive list of the integration domains the product supports. The library organises examples into specific categories, which helps you understand the intended scope of each domain.

The current categories listed in the library are:

*   Microsoft External Attack Surface Management
*   Microsoft Entra
*   Microsoft Intune
*   Microsoft Defender and Microsoft Sentinel
*   Microsoft Defender Threat Intelligence
*   Vulnerabilities
*   Microsoft Purview
*   Script Analysis

If you see a category in this list, it indicates that the product is designed to handle tasks within that security domain. However, the presence of a category does not guarantee that the corresponding data source is active or accessible in your specific environment. The library itself includes a disclaimer that these are sample prompts and are subject to change.

## Distinguish between capability and availability

A common mistake is to assume that because a domain category exists, it is automatically available to you. Availability depends on several factors that are outside the scope of the sample library.

First, your organisation must have the relevant underlying services enabled and configured. For example, the Microsoft Sentinel domain requires a Sentinel workspace to be connected and configured. Second, your user account must have the necessary permissions to access data in those services. A domain may be technically supported, but if you lack Reader access to the relevant workspace, you will not see data.

Third, licensing plays a role. Security Copilot requires its own license, but the domains rely on the licenses of the connected services. If your organisation does not have the appropriate licenses for Microsoft Purview or Microsoft Defender, the corresponding domains will not function, even if they are listed in the sample library.

## Verify functionality through documentation

Since the sample library does not provide a live status check, you need to verify functionality through other means. The most practical approach is to consult the official documentation for the specific domain you are interested in. This documentation will detail the prerequisites, such as required data connections and permissions.

For example, if you want to use the Microsoft Entra domain, you should check the documentation for any specific identity-related permissions or data access requirements. Similarly, for the Microsoft Purview domain, you need to ensure that your Purview account is configured correctly and that you have the necessary data governance permissions.

If you are unsure whether a domain is active, you can try running a query related to that category. However, be aware that a lack of response may be due to permissions, data availability, or the domain being disabled, rather than the domain not existing. The sample library helps you understand what is possible; it does not tell you what is currently working in your tenant.

## Next steps

To move forward, identify the domain category that matches your security task. Check the official documentation for that domain to understand its prerequisites. Ensure your tenant has the necessary services enabled and your account has the required permissions. This approach gives you a clear understanding of what Security Copilot can do, without relying on assumptions about active availability.

If you find that a domain is not returning expected results, check the administrative settings for the underlying service and verify your permissions. This systematic review helps you maximise the value of Security Copilot by ensuring you are using the full range of available capabilities.

References for Review the plugins available to a Copilot for Security session: [Readme](https://github.com/Azure/Security-Copilot/blob/b9fb72cb5aa2f7fe3fff48ec6735f04f674ede36/Sample Prompts/Readme.md).
