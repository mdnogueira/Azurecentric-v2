---
title: "Check connectivity with Azure Network Watcher"
description: "Use Connection troubleshoot to diagnose a single connectivity failure between an Azure VM and a destination, interpreting the hop-by-hop results."
pubDate: 2025-02-20
category: networking
tags: ["azure-network-watcher", "troubleshooting", "azure-virtual-machines", "connection-troubleshoot"]
translationKey: check-connectivity-with-azure-network-watcher
draft: false
---

A virtual machine cannot reach a destination port, but the network configuration looks correct. The first step is to isolate whether the block is in the network path, the security rules, or the destination service itself. Azure Network Watcher’s Connection troubleshoot tool provides a single-point diagnostic that tests connectivity and returns a detailed hop-by-hop analysis. It is designed for on-demand checks, not continuous monitoring.

Connection troubleshoot is one of the diagnostic tools in Network Watcher, alongside tools like IP flow verify and effective security rules. While IP flow verify checks if a specific packet is allowed or denied at the VM level, Connection troubleshoot performs an actual connectivity test and maps the path. It helps you understand why a connection fails by identifying the exact hop where the issue occurs, whether it is a network security group (NSG) rule, a user-defined route, or a destination port issue.

## Prerequisites and scope

Before running a test, ensure you have the necessary permissions and that the source resource is correctly configured. Connection troubleshoot requires the source resource to have the Network Watcher agent VM extension installed. This is a critical dependency that is often overlooked. The extension is not required on the destination resource.

The tool supports testing from Azure virtual machines, virtual machine scale sets, Azure Bastion instances, and application gateways v2 (excluding those enrolled in Private Application Gateway deployment). Destinations can be virtual machines, fully qualified domain names (FQDNs), uniform resource identifiers (URIs), or IP addresses.

You need Contributor access to the source resource to install or verify the Network Watcher extension. If the extension is missing, the test will fail immediately with an error indicating that the agent is not installed.

## Running the test

Navigate to the Network Watcher resource in the Azure portal. Under the **Network diagnostic tools** section, select **Connection troubleshoot**. You will be presented with a form to configure the test.

1. **Source**: Select the resource group and the specific virtual machine (or other supported source) from which you want to run the test.
2. **Destination**: Enter the destination type (VM, FQDN, URI, or IP address) and the corresponding value. For an FQDN, ensure that DNS resolution is working from the source VM.
3. **Protocol**: Choose TCP or ICMP. TCP is generally more useful for application-level connectivity, as it tests the specific port. ICMP tests basic reachability but does not verify port availability.
4. **Port**: If using TCP, specify the destination port. For ICMP, this field is ignored.

Click **Test** to start the diagnostic. The tool will send probes from the source to the destination and analyze the response.

## Interpreting the results

The results page provides a comprehensive view of the connection attempt. The top section displays the **ConnectionStatus**, which will be either **Reachable** or **Unreachable**. If the connection is unreachable, the tool provides a detailed breakdown of the issues.

### Hop-by-hop analysis

The **Hops** section lists each hop in the path from the source to the destination. Each hop includes:

- **Type**: The type of resource (e.g., Source, VirtualAppliance, VnetLocal, Internet).
- **Address**: The IP address of the hop.
- **Issues**: A collection of issues detected at that hop. If there are no issues, this field is blank.

An issue might indicate a **NetworkSecurityRule** block, a **UserDefinedRoute** drop, or a **DNSResolution** failure. Each issue includes a severity (Error or Warning) and context details, such as the name of the rule that blocked the traffic.

For example, if an NSG rule is blocking traffic, the issue will specify the rule name and the action (Allow or Deny). This allows you to quickly identify and remediate the misconfiguration.

### Latency and probe statistics

The results also include latency metrics (**AvgLatencyInMs**, **MinLatencyInMs**, **MaxLatencyInMs**) if the connection is reachable. The **ProbesSent** and **ProbesFailed** counts indicate the reliability of the connection. If **ProbesFailed** is high, it suggests intermittent connectivity issues.

### Security rule analysis

The **SourceSecurityRuleAnalysis** and **DestinationSecurityRuleAnalysis** sections provide a detailed view of the security rules evaluated at the source and destination. This includes the matched rule, the action taken, and the profile of the rule (source, destination, port, protocol, direction). This level of detail is invaluable for understanding why a specific packet was allowed or denied.

## When to use Connection troubleshoot vs. Connection monitor

Connection troubleshoot is ideal for ad-hoc diagnostics. It provides a snapshot of the connection at a specific point in time. If you need continuous monitoring, you should use Connection monitor, which provides aggregated metrics and alerts over time. Connection monitor is better suited for production environments where you need to track connectivity trends and set up alerts for failures.

Connection troubleshoot does not require the Network Watcher extension on the destination, making it a quick tool for testing connectivity to external services or other Azure resources where you might not have control over the destination configuration.

## Verification and next steps

After running the test, verify the **ConnectionStatus** and review the **Issues** in the hop-by-hop analysis. If the connection is unreachable, use the details provided to remediate the issue. For example, if an NSG rule is blocking traffic, update the rule to allow the required traffic. If a route is dropping packets, review the user-defined routes and system routes to ensure traffic is being routed correctly.

If the connection is reachable but you are experiencing performance issues, review the latency metrics and probe statistics. High latency or packet loss might indicate network congestion or a problem with the destination service.

For further troubleshooting, you can use other Network Watcher tools like **IP flow verify** to check if specific traffic is allowed or denied at the VM level, or **Effective security rules** to view all security rules applied to a network interface. These tools complement Connection troubleshoot by providing additional layers of visibility into the network configuration.

If the issue persists, consider using **Packet capture** to capture traffic to and from the VM for deeper analysis. Packet capture is a resource-intensive operation that may impact VM performance and incurs storage costs for the captured data. Use it judiciously for deep-dive analysis only.

References for Check connectivity with Azure Network Watcher: [Azure Network Watcher overview](https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-overview), [Connection monitor overview](https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview), [Connection troubleshoot overview](https://learn.microsoft.com/en-us/azure/network-watcher/connection-troubleshoot-overview).
