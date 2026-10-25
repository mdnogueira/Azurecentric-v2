---
title: "Review identity and DNS dependencies before a migration"
description: "Verify identity and DNS dependencies before migrating workloads to Azure to avoid connectivity failures."
pubDate: 2026-02-27
category: cloud
tags: ["azure-migrate", "dns", "active-directory", "hybrid-connectivity", "migration-planning"]
translationKey: review-identity-and-dns-dependencies-before-a-migration
draft: false
---

You have replicated your on-premises workloads to Azure and the migration looks complete. Yet, when you try to connect to the new Azure VMs, the connection fails. The issue is rarely the migration tool itself; it is usually a dependency that was assumed to exist in the cloud but was never configured. Before you migrate, you must verify identity and DNS dependencies, because Azure does not inherit your on-premises Active Directory or DNS infrastructure automatically.

Azure Migrate handles many technical prerequisites, such as installing the Azure VM Agent or configuring SAN policies for Windows servers [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration). However, it does not configure the network identity or name resolution for the migrated machines. If your applications rely on domain membership or internal DNS names, those dependencies must be resolved in the target Azure environment before the cutover.

## Verify domain identity requirements

If your on-premises servers are members of an Active Directory domain, they will remain standalone computers in Azure unless you explicitly join them to a domain. Azure Migrate is a migration orchestration tool that replicates disks and does not perform identity provisioning tasks like domain joining. Domain joining is a post-migration configuration step required for the OS to function within the target identity infrastructure.

You need to decide how the identity will be managed in Azure. The common approaches are:

1. **Azure Active Directory Domain Services (AADDS):** If you want cloud-native domain services without managing domain controllers, you can join the Azure VMs to an AADDS instance. This requires the VMs to be able to reach the AADDS endpoints, which typically involves configuring network security groups and potentially a site-to-site VPN or ExpressRoute.
2. **On-premises domain via hybrid connectivity:** If you must remain in the on-premises domain, you need a reliable hybrid connection (such as ExpressRoute or a site-to-site VPN) and the Azure VMs must be able to communicate with the on-premises domain controllers. This includes ensuring that the necessary ports for LDAP, Kerberos, and other domain services are open [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration).
3. **Workgroup mode:** If domain membership is not required for the application, you can leave the VMs in a workgroup. In this case, you must ensure that local accounts and permissions are configured correctly for access.

The Azure Migrate documentation notes that you must prepare to connect after migration, which includes configuring Windows settings and enabling remote desktop [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration). If the VM is not domain-joined, you cannot use domain credentials to log in. You must have local administrator credentials ready. If you plan to use domain credentials, you must verify that the domain trust and network connectivity are established before the migration cutover.

## Check DNS resolution dependencies

DNS is another critical dependency that does not transfer automatically. On-premises, your applications likely resolve internal hostnames using your internal DNS servers. In Azure, the default DNS servers are provided by the Azure infrastructure, which only resolves Azure internal names and public DNS names. It does not know about your on-premises hostnames.

If your application uses internal DNS names to communicate with other services, those names will not resolve in Azure unless you configure forwarding or conditional zones. You have several options:

1. **Conditional Forwarders:** You can configure the Azure virtual network DNS settings to forward requests for your internal domain to your on-premises DNS servers. This requires a hybrid connection and that the on-premises DNS servers are accessible from Azure. Note that setting custom DNS servers in the VNet replaces Azure's default resolvers, so ensure your on-premises DNS server is configured to forward Azure-specific queries.
2. **Conditional Zones in AADDS:** If you are using AADDS, you can create conditional zones that forward requests for specific domains to on-premises DNS servers.
3. **Azure Private DNS Zones:** If you are migrating to Azure and no longer need on-premises DNS resolution, you can create Azure Private DNS Zones for your internal names and populate them with the IP addresses of the Azure VMs.

The Azure Migrate appliance collects metadata and performance data to help with assessment [Assessment Prerequisites](https://learn.microsoft.com/en-us/azure/migrate/assessment-prerequisites), but it does not configure DNS. You must manually configure the DNS settings in the Azure virtual network or on the VMs themselves. If you do not configure DNS, your applications may fail to start or lose connectivity to other services that rely on name resolution.

## Verify network connectivity for dependencies

Identity and DNS are not the only dependencies. You must also ensure that the Azure VMs can reach the services they depend on. This includes:

- **Domain Controllers:** If joining a domain, ensure the VMs can reach the domain controllers over the required ports.
- **DNS Servers:** Ensure the VMs can reach the DNS servers that will resolve their names.
- **Application Services:** If your application depends on on-premises databases or other services, ensure that the hybrid connection is stable and that the necessary ports are open.

The Azure Migrate documentation lists URL and port access requirements for the migration process itself [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration). However, these are for the migration tool, not for the application. You must separately verify that the application dependencies are accessible from the Azure environment.

## Plan for post-migration verification

Before you migrate, create a verification plan that includes:

1. **Identity Verification:** Check that the VMs are joined to the correct domain or are in the intended workgroup. Verify that you can log in with the expected credentials.
2. **DNS Verification:** Test name resolution for internal and external names. Ensure that the VMs can resolve the names of other services they depend on.
3. **Connectivity Verification:** Test connectivity to domain controllers, DNS servers, and application services. Ensure that the necessary ports are open and that the hybrid connection is stable.

If you skip these steps, you may find that the migrated VMs are not functional in Azure. The migration tool may have successfully copied the data, but the application may not start or may fail to connect to its dependencies. By verifying identity and DNS dependencies before migration, you can avoid these issues and ensure a smooth transition to Azure.

The first thing to check is whether your application relies on domain membership or internal DNS names. If it does, you must configure the appropriate identity and DNS services in Azure before you migrate. If you do not, you will face connectivity issues that are difficult to troubleshoot after the migration is complete.

Start by mapping out all the dependencies your applications have. Identify which ones are identity-related and which are DNS-related. Then, decide how you will provide those services in Azure. Finally, verify that the Azure VMs can reach those services before you perform the migration.

### Illustrative Example: Configuring Conditional Forwarders

If you decide to use conditional forwarders to resolve on-premises names in Azure, you can configure this in the Azure portal. This is an illustrative example of the steps involved, assuming you have already established a hybrid connection.

1. Navigate to the virtual network in the Azure portal.
2. Select **DNS servers** under Settings.
3. Choose **Custom** and enter the IP address of your on-premises DNS server.
4. Save the changes.

This configuration will cause the Azure VMs to forward DNS queries for all domains to your on-premises DNS server. If you only want to forward queries for a specific domain, you can use conditional zones in AADDS or configure the DNS server on-premises to handle the forwarding.

Remember that this is an illustrative example. The actual configuration may vary depending on your specific environment and requirements. Always test your DNS configuration in a non-production environment before applying it to production workloads.
