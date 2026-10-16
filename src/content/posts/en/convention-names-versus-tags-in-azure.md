---
title: "Convention Names versus Tags in Azure"
description: "Sometimes when I am working on an Azure Foundation project, usually they ask me “What is the difference between Convention Names and Tags?” followed by “When we should use each…"
pubDate: 2017-02-26
category: governance
tags: []
translationKey: convention-names-versus-tags-in-azure
legacy: true
legacyUrl: /2017/02/convention-names-versus-tags-in-azure.html
---

Sometimes when I am working on an Azure Foundation project, usually they ask me “What is the difference between Convention Names and Tags?” followed by “When we should use each one?”

So, I decide to write this post to try to help to clarify what is the difference and when you should use each one.

## **Names**

For more information about Naming Convention on Azure, see this previous post ([here](/posts/naming-conventions-in-azure)). Although naming the resource that you are creating is mandatory. You should have a very clear strategy to easy identify the resource and address all the requirements that a resource name must have.
  * Names are the resource/object name
  * They are required on the creation (it’s a mandatory field)
  * Names are surfaced at the top level of the portal
  * Names are used in PowerShell.

## **Tags**

Regarding Tags, it’s not mandatory when you create a resource, but is highly recommend that you combine both. If you want more information about Tags, see my previous post ([here](/posts/when-to-use-resource-tags-in-azure)).
  * Tags are metadata for the resource/object
  * Names/Tags can be used for billing drilldown
  * Name/Tags can be used for data analysis
  * Tags can be used for lot more scenarios then names, the reason why is each resource/object can have up to 15 different tags
  * Tags are used to provide context that a name cannot

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
