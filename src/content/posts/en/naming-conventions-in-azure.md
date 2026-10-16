---
title: "Naming Conventions in Azure"
description: "Why having a good name convention in Azure have a huge importance?"
pubDate: 2017-02-22
category: governance
tags: []
translationKey: naming-conventions-in-azure
legacy: true
legacyUrl: /2017/02/naming-conventions-in-azure.html
---

Why having a good name convention in Azure have a huge importance?

Because describes type of resource in the subscription. Placing the naming pattern in an order that allows easier application level grouping for potential showback/chargeback billing and it help when you decide to use Azure Automation.

There isn’t, so far at my best knowledge, the perfect naming convention. Although here are some considerations that might help you creating one:
  * **Constrained unique across entire Azure** – Example: SQL Server Name, Storage Account Name, etc. must be unique across Azure not just on the subscription
  * **Constrained by length** – Example: Search Service is constrained 2 to 15 characters
  * **Constrained to alpha-numeric** – Example: Storage Account Name cannot have dash, dots, etc.
  * **Constrained unique within account** – Example: Storage Table Name must be unique within Azure subscription account
  * **Cannot include upper case characters** – Example: Storage account names must be all lower case
  * **Cannot contain offensive or forbidden sub-strings**.

So, when you create a naming convention for all the Azure resources, these are the requirements that you need to ensure that convention will address:
  * Unique Azure naming
  * Case sensitivity requirements
  * Application association
  * Environment association
  * Region association
  * Instance association
  * Object association
  
Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
