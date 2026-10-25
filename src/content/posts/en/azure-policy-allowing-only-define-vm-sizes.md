---
title: "Azure Policy – Allowing only define VM sizes"
description: "Azure Policy is the big step to start to have some sort of governance on your Azure environment. It’s really easy to implement, efficient and powerful. With Azure Policies, you…"
pubDate: 2018-06-01
category: governance
tags: ["azure-policy", "vm-sizing"]
translationKey: azure-policy-allowing-only-define-vm-sizes
legacy: true
legacyUrl: /2018/06/azure-policy-allowing-only-define-vm-sizes.html
---

Azure Policy is the big step to start to have some sort of governance on your Azure environment. It’s really easy to implement, efficient and
powerful. With Azure Policies, you can control how and what you allow users to deploy. It’s important to have such policies to control the cost of the subscription, special when you have a monthly budget like mine. On other hand, you are limiting the number of possible human mistake, by selecting the wrong VM size.

You can always suspend the policy, for a brief moment, in case you need to deploy that VM size and then resume the policy again.

In this case, the idea is to limit the size of the VM, that you are allowing to deploy on the subscription.

Here is the example of the policy:
```
{
    "policyRule": {
        "if": {
            "allOf": [
                { 
                "field": "type",
                "equals": "Microsoft.Compute/virtualMachines"
                },
                {
                "not": {
                    "field": "Microsoft.Compute/virtualMachines/sku.name",
                    "in": ["Standard_A0", "Standard_A1","Standard_D1"]
                    }
                }
            ]
        },
        "then": {
            "effect": "deny"
        }
    }
}
```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
