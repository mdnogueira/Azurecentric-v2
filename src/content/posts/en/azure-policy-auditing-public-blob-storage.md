---
title: "Azure Policy – Auditing public blob storage"
description: "In a Governance project, one of the most common policy to implement is the one that you don’t allow any blob storage to be public. That usually could be a major information…"
pubDate: 2018-06-05
category: governance
tags: [azure-policy]
translationKey: azure-policy-auditing-public-blob-storage
legacy: true
legacyUrl: /2018/06/azure-policy-auditing-public-blob-storage.html
---

In a Governance project, one of the most common policy to implement is the one that you don’t allow any blob storage to be public. That usually could be a major information breach. When you make a blob storage in Azure public, you are giving at least reading privilege to the world.

In this case, the idea is to audit what blob storage are public. This policy is not denying the user to create public blob storage on the subscription, it’s only auditing which blob storage is public, so you can take an action if applicable. 

Here is the example of the policy to be implemented:
```
{
    "policyRule": {
        "if": {
            "allOf": [
                {
                    "field":"type",
                    "equals":"Microsoft.Storage/storageAccounts"
                },
                {
                    "field":"Microsoft.Storage/storageAccounts/networkAcls.defaultAction",
                    "notequals":"Deny"
                }
            ]
        },
        "then": {
            "effect":"audit"
        }
    },
    "parameters": {}
}
```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
