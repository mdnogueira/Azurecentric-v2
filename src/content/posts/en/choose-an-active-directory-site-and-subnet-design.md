---
title: "Choose an Active Directory site and subnet design"
description: "Design Active Directory sites and subnets using latency thresholds and application requirements to control replication and client traffic."
pubDate: 2025-01-08
category: windows-server
tags: ["active-directory", "site-topology", "subnet-design", "replication", "windows-server"]
translationKey: choose-an-active-directory-site-and-subnet-design
draft: false
---

Active Directory site topology is not a cosmetic layer; it is the mechanism that controls replication traffic and directs clients to the closest domain controllers. If you place subnets incorrectly, users experience slow logons, and your WAN links become congested with unnecessary replication data. The first step is to decide which physical locations require a site object and which IP subnets belong to them.

## Decide which locations become sites

[![Active Directory Site and Subnet Association Flow](/images/posts/2025/azc-134-checkpoints.svg)](/images/posts/2025/azc-134-checkpoints.svg)

You do not need a site for every office. The decision depends on two factors: the presence of domain controllers and the requirements of specific applications.

Create a site for any location where you plan to place a domain controller. This ensures that replication topology is optimised for that location and that the domain controller is treated as a local resource for replication purposes. You also need a site for locations hosting servers running applications that rely on site objects for location-based service discovery. Distributed File System Namespaces (DFS) is a common example; it uses site information to direct clients to the nearest namespace server [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design).

The critical technical threshold for grouping subnets into a single site is network latency. If the round-trip network latency between two subnets is 10 milliseconds or less, you can include them in the same Active Directory site. This typically applies to subnets within the same building or campus connected by high-speed local links. If the latency exceeds 10 milliseconds, you should not include the subnets in a single Active Directory site. This threshold exists because Active Directory replication and client site-binding are optimised for low-latency environments. Grouping high-latency subnets into one site forces clients to contact domain controllers that are effectively remote, degrading performance [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design).

Even if latency is within the 10 ms threshold, you may choose to create separate sites if you need to segment traffic for Active Directory-based applications. For example, if you have distinct security or administrative boundaries, separate sites provide that logical separation [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design).

For locations that do not require a site, you still need to manage their subnets. Add the subnet of such a location to a site for which the location has the maximum wide area network (WAN) speed and available bandwidth. This ensures that clients in that location bind to the most appropriate domain controller available, even if a local domain controller is not present [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design).

## Create site and subnet objects

Once you have decided on the site structure, you must implement it in Active Directory Domain Services (AD DS). This involves creating site objects and subnet objects, then associating them.

For every location designated as a site, create a site object. Document these locations clearly. The site object itself does not contain network information; it is a logical container.

Next, create subnet objects for every IP subnet associated with each location. A subnet object represents the IP addresses within that site. When you create an Active Directory subnet object, the system automatically translates the IPv4 address and subnet mask into network prefix length notation. For example, the IPv4 address 172.16.4.0 with a subnet mask 255.255.252.0 appears as 172.16.4.0/22. Windows Server also supports IPv6 subnet prefixes, such as 3FFE:FFFF:0:C000::/64 [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design).

You must associate each subnet object with a site object. This association is what allows Active Directory to determine which site a client belongs to based on its IP address. Without this association, clients cannot be correctly bound to a site, and they may contact domain controllers in other sites, increasing latency and replication traffic [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design).

## Document your design

A site design is only as good as its documentation. You should document the locations that will become sites, the network addresses, and the subnet masks within each location. Use a worksheet to assist in this process. The "Associating Subnets with Sites" worksheet is particularly useful for mapping subnets to their respective sites [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design).

For IPv4, ensure you record the network address and subnet mask. For IPv6, record the subnet prefix. This documentation is essential for troubleshooting and for ensuring that future changes to the network infrastructure are reflected in the Active Directory site topology [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design).

## Verify the topology

After creating the site and subnet objects, verify that the topology is functioning as intended. Check that clients are binding to the correct site based on their IP address. You can use tools such as `nltest` or `repadmin` to verify site membership and replication status.

Ensure that replication traffic is flowing as expected between sites. If you have created separate sites, replication should occur over the site link, which you can configure to optimise bandwidth usage. If you have grouped subnets into a single site, replication should occur within the site, using the default intrasite replication topology.

The key to a successful site design is aligning the logical structure of Active Directory with the physical reality of your network. By respecting the 10 ms latency threshold and correctly associating subnets with sites, you ensure that your directory service performs efficiently and that your users have a seamless experience.

### Prerequisites

-   Permissions to create objects in the Active Directory Configuration partition, typically held by Enterprise Administrators or delegated accounts.
-   Knowledge of your network topology, including IP subnets and latency between locations.
-   Documentation of locations with domain controllers and applications requiring site-based service discovery.

### Steps

1.  **Identify Locations:** List all locations with domain controllers or applications requiring site objects.
2.  **Assess Latency:** Measure round-trip latency between subnets. Group subnets with <10 ms latency into the same site.
3.  **Create Site Objects:** Create a site object for each designated location in AD DS.
4.  **Create Subnet Objects:** Create subnet objects for each IP subnet, noting the automatic conversion to prefix notation.
5.  **Associate Subnets:** Link each subnet object to its corresponding site object.
6.  **Document:** Record all sites, subnets, and associations in a design document.
7.  **Verify:** Use `nltest` or `repadmin` to confirm client site binding and replication status.

### Expected Verification

-   Clients report the correct site name.
-   Replication traffic is optimised for the defined site links.
-   Applications like DFS locate the nearest servers.

### Tags

[active-directory, site-topology, subnet-design, replication, windows-server]


References for Choose an Active Directory site and subnet design: [Creating a Site Design](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/creating-a-site-design), [Understanding Active Directory Site Topology](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/understanding-active-directory-site-topology).
