---
title: "Plan Security Compute Unit usage for a small pilot"
description: "Plan Microsoft Copilot for Security pilot usage by understanding SCU drivers and monitoring actual consumption against estimates."
pubDate: 2024-10-03
category: security-copilot
tags: ["microsoft-security-copilot", "security-compute-units", "cost-management", "microsoft-sentinel"]
translationKey: plan-security-compute-unit-usage-for-a-small-pilot
draft: false
---

You are planning a pilot for Microsoft Copilot for Security and need to estimate the cost and capacity required. The service operates on a consumption-based model driven by Security Compute Units (SCUs). To keep the pilot within budget, you must understand what generates those units and how to track them, rather than relying on fixed per-user estimates. 

Microsoft Copilot for Security is a generative AI-powered assistant designed for security and IT operations. It connects to existing Microsoft security products to help teams investigate and respond to threats. Because it uses generative AI, the compute resources required vary significantly depending on the task. This variability is measured in Security Compute Units (SCUs). 

## Understand what drives SCU consumption

It is tempting to think of SCU usage as a simple function of the number of users or the size of your subscription. That approach often leads to inaccurate budgets. SCU consumption is driven by the complexity and volume of the interactions with the Copilot service. 

Several factors influence how many units a single interaction consumes:

*   **Query complexity:** Simple questions, such as "What are my top alerts?", consume fewer units than complex, multi-step analytical queries that require deep reasoning across multiple data sources.
*   **Data volume:** Queries that scan large amounts of log data, security alerts, or threat intelligence require more compute power. The more data the model needs to process to generate a response, the higher the SCU cost.
*   **Plugin usage:** Copilot for Security can use plugins to extend its capabilities. Using custom or community plugins can increase compute requirements depending on the logic and data retrieval steps involved in the plugin's execution.
*   **Frequency of use:** More frequent interactions naturally lead to higher total SCU consumption, but the cost per interaction will still vary based on the factors above.

The official documentation for Microsoft Copilot for Security provides the detailed pricing tiers and SCU rates. You should refer to that source for the most current unit costs, as they are subject to change and may vary by region or commitment tier. 

## Estimate usage for a small pilot

For a small pilot, you are likely dealing with a limited number of users and a subset of your security data. A practical approach is to start with a conservative estimate and adjust based on actual usage. 

1.  **Define the pilot scope:** Identify the specific security operations team members who will use Copilot and the specific workloads (e.g., a single Sentinel workspace) they will query. Limiting the scope helps contain initial costs and makes monitoring easier.
2.  **Estimate daily queries:** Ask the pilot users to estimate how many queries they might run per day. For a small team, this might be 10-20 queries per user per day. Be realistic; overestimating usage can lead to unnecessary capacity reservations.
3.  **Estimate SCU per query:** The documentation suggests that a typical query might consume a variable number of SCUs, depending on complexity. For a pilot, using a moderate average is a reasonable starting point, but you should treat this as a placeholder rather than a fixed rule. 
4.  **Calculate daily and monthly usage:**
    *   Daily SCUs = (Number of pilot users) × (Queries per user per day) × (Estimated SCUs per query)
    *   Monthly SCUs = Daily SCUs × 30

For example, if you have 5 pilot users, each running 15 queries a day, with an estimated average of 2 SCUs per query:

*   Daily SCUs = 5 × 15 × 2 = 150 SCUs
*   Monthly SCUs = 150 × 30 = 4,500 SCUs

This gives you a baseline for budgeting. You can then compare this against the SCU capacity included in your Microsoft 365 or Azure subscriptions, or the additional SCU packs you may need to purchase. 

## Monitor and adjust

Once the pilot begins, monitor the actual SCU consumption. The Microsoft Copilot for Security documentation outlines how to access usage metrics. Compare the actual usage against your estimates. 

If usage is significantly lower than expected, you may have overestimated. If it is higher, investigate the types of queries being run. Are they overly complex? Are they scanning too much data? Use these insights to refine your estimates and adjust the pilot scope if necessary. 

## Key considerations for a pilot

*   **Start small:** Limit the pilot to a few users and a single data source to keep initial costs predictable. 
*   **Train users:** Ensure pilot users understand how to formulate effective queries to avoid unnecessary SCU consumption from poorly constructed requests. 
*   **Review documentation:** Regularly check the official documentation for updates on SCU pricing and usage patterns. 
*   **Set alerts:** Configure cost alerts in your Azure subscription to notify you if SCU consumption exceeds your budget thresholds. 

By starting with a clear estimate, monitoring actual usage, and adjusting your approach, you can run a successful pilot of Microsoft Copilot for Security without unexpected costs. 

References for Plan Security Compute Unit usage for a small pilot: [README](https://github.com/Azure/Security-Copilot/blob/a6f3ba73e1ad766d5279b63bd333414e3a59b89a/README.md).
