---
title: "Use dependency information to plan migration waves"
description: "Use Azure Migrate dependency analysis to group servers into migration waves, avoiding outages and identifying decommission candidates."
pubDate: 2024-08-24
category: cloud
tags: ["azure-migrate", "migration-planning", "dependency-analysis", "cloud-adoption"]
translationKey: use-dependency-information-to-plan-migration-waves
draft: false
---

You have a list of on-premises servers and a deadline. The first question is not which cloud SKU to choose, but which servers must move together. If you migrate a database server before its application server, or leave a dependency behind, you get an outage. Azure Migrate: Discovery and assessment provides dependency analysis specifically to answer that question.

The tool groups servers into logical sets based on their network traffic. You use those groups to define migration waves. A wave is a set of servers that must be migrated simultaneously to maintain application functionality. This approach also helps you identify servers that are no longer in use, so you can decommission them instead of paying for migration.

## Understand the two analysis methods

Azure Migrate offers two ways to discover dependencies: agentless and agent-based. Your choice depends on your infrastructure and the level of detail you need.

**Agentless analysis** is generally available for VMware VMs, Hyper-V VMs, bare-metal servers, and servers on other public clouds like AWS or GCP. It works by capturing TCP connection data. No agents are installed on the servers you want to analyze. The Azure Migrate appliance polls this data every five minutes. It gathers the name of processes with active connections, the application running those processes, and the destination port. The appliance processes this data to deduce identity information and sends it to Azure Migrate every six hours. This method is often the fastest way to start, as it requires minimal change to your existing environment. Note that for physical servers, the appliance must be positioned to capture network traffic, such as via SPAN ports or network taps, which may involve additional infrastructure setup compared to VM-based discovery.

**Agent-based analysis** uses the Service Map solution in Azure Monitor. You must install the Microsoft Monitoring Agent (Log Analytics agent) and the Dependency agent on each server. This method provides richer data, including the number of connections, latency, and data transfer information, which is available for Log Analytics queries. However, it requires more management overhead. Note that agent-based analysis is not supported in Azure Government. You also need a Log Analytics workspace in a supported region (East US, Southeast Asia, or West Europe) to associate with your project.

| Requirement | Agentless | Agent-based |
|---|---|---|
| Support | Generally Available for VMware, Hyper-V, Physical, AWS, GCP | Generally Available |
| Agent | No agents needed | Agents required on each server |
| Log Analytics | Not required | Required |
| Data | Source/dest server, process, app, port | Adds connection count, latency, data transfer |
| Visualization | Single server map (1 hour to 30 days) | Single or group server map (1 hour only) |

## Group servers for migration waves

Once you have dependency data, you can create groups. These groups are the foundation of your migration plan. A group represents an application or a set of tightly coupled services. You should migrate all servers in a group together to avoid breaking connections.

In the Azure portal, you can view the dependency map for a single server. This map shows outgoing and incoming connections. You can filter the view by duration, from one hour to 30 days, to see how dependencies change over time. For agent-based analysis, you can also view a map for a group of servers, which helps visualize the entire application topology. You can add and remove servers from this group view to refine your understanding. Note that agent-based maps are limited to a one-hour view window in the portal interface, with historical data available via Log Analytics queries.

The key advantage here is confidence. You can identify servers that must be migrated together, especially if you are unsure which servers are part of a specific app deployment. You can also see if a server is in use. If a server has no connections and is not part of any critical group, it might be a candidate for decommissioning. This prevents you from migrating "zombie" servers that add cost without value.

## Build the migration plan

With your groups defined, you can start building the migration plan. Azure Migrate: Discovery and assessment provides assessment reports that include readiness and sizing recommendations. You can filter these reports to identify servers that are "Ready for Azure," "Conditionally ready," or "Not ready."

Use the dependency groups to prioritize your waves. Start with low-risk groups, such as dev/test workloads or servers that are fully ready for Azure. This "apply and learn" approach helps you iron out flaws before migrating production workloads. You can also prioritize based on business urgency, compliance requirements, or end-of-support operating systems. For example, migrating Windows Server 2008 R2 servers early can secure free security updates in Azure.

When you finalize the plan, consider network bandwidth and latency. These factors affect replication speed and downtime constraints. Allow time for post-migration testing, including functional, integration, and performance tests. A test migration in Azure Migrate is recommended to estimate the time involved and tweak your plan before the full cut-over.

## Verify your groups

Before you start migrating, verify that your groups make sense. Export the dependency data as a CSV for the last 30 days. Review the connections to ensure no critical dependencies are missing. Check the assessment reports for any blockers that might prevent migration. If a server is marked as "Not ready," address the remediation guidance before including it in a wave.

Dependency analysis is not a one-time task. As your application evolves, dependencies may change. Re-run the analysis periodically to keep your migration plan accurate. This ongoing visibility ensures that nothing is left behind and helps you avoid surprise outages after migration.

The next step is to set up the dependency visualization for your environment. Choose the method that fits your infrastructure, create your first groups, and start planning your waves. This structured approach turns a complex migration into a series of manageable, low-risk steps.


References for Use dependency information to plan migration waves: [Dependency analysis in Azure Migrate Discovery and assessment](https://learn.microsoft.com/en-us/azure/migrate/concepts-dependency-visualization), [Build a migration plan with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/concepts-migration-planning).
