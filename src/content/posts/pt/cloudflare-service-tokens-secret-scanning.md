---
title: "Deteção de tokens de serviço do Cloudflare: mantenha a revogação no procedimento"
slug: "cloudflare-service-tokens-secret-scanning"
description: "O GitHub deteta tokens de serviço do Cloudflare Access. Confirme capacidades, licenciamento e a passagem da deteção à contenção da credencial."
pubDate: "2026-11-12T21:16:40+00:00"
language: "pt-PT"
category: "cloud-security"
tags: ["github", "cloud-security", "secret-scanning", "cloudflare", "devsecops"]
translationKey: "cloudflare-service-tokens-secret-scanning"
draft: false
---

![Fluxo de resposta que separa a deteção no GitHub da contenção da credencial no Cloudflare e da verificação do serviço](/images/news/cloudflare-service-token-response-pt.svg)

O GitHub passou a detetar tokens de serviço do Cloudflare Access através do padrão `cloudflare_access_service_token`. As equipas ganham assim outra forma de encontrar uma credencial exposta. A questão operacional útil é o que acontece depois da deteção: quem pode impedir que essa credencial continue a funcionar e quem pode restabelecer a automatização que depende dela?

O [anúncio de 12 de novembro](https://github.blog/changelog/2026-11-12-secret-scanning-adds-a-detector-for-cloudflare) identifica o novo padrão. Não anuncia revogação automática nem uma nova regra de falha de CI. A documentação atual específica do detetor é particularmente útil neste ponto: suporta alertas para o utilizador, mas não apresenta notificações ao parceiro, proteção de push ou verificações de validade como capacidades suportadas para este padrão.

## Leia a linha das capacidades antes de alterar o procedimento

A [tabela de padrões suportados](https://docs.github.com/en/code-security/reference/secret-security/supported-secret-scanning-patterns) distingue as capacidades de cada tipo de segredo. À data da revisão, a linha Cloudflare Access Service Token apresenta:

| Capacidade | Suporte atual para este padrão |
| --- | --- |
| Alerta para o utilizador | Sim |
| Notificação ao parceiro | Não |
| Proteção de push | Não |
| Verificação de validade | Não |
| Verificação de metadados / Base64 | Não / Não |

Esta distinção é relevante porque o anúncio também inclui uma explicação geral sobre segredos de parceiros. Essa explicação não demonstra que este padrão específico envia uma notificação ao Cloudflare. Uma deteção também não significa que o GitHub confirmou que a credencial ainda pode ser utilizada. Investigue o alerta sem interpretar a ausência de um resultado de validade como um sinal tranquilizador.

O suporte para o Cloudflare não é, por si só, uma novidade: a [atualização de padrões de abril](https://github.blog/changelog/2026-04-14-secret-scanning-pattern-updates-and-product-improvements/) já abrangia outros tipos de credenciais do Cloudflare. A novidade de novembro deve ser entendida ao nível dos tokens de serviço.

A [análise de segredos](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning) é executada automaticamente e sem custos em repositórios públicos. Para repositórios privados e internos pertencentes a organizações, o GitHub documenta como requisito a ativação do GitHub Secret Protection no GitHub Team ou Enterprise Cloud. Confirme o proprietário, o plano e as definições do repositório antes de pressupor cobertura; uma funcionalidade para repositórios públicos não estabelece o direito de utilização num repositório privado. A cobertura privada pode, por isso, implicar custos de licenciamento. Este anúncio não estabelece um novo preço nem uma alteração à subscrição do Cloudflare.

## Compreenda o acesso associado ao segredo

Um [token de serviço do Cloudflare](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/) tem um Client ID e um Client Secret. Permite que um serviço se autentique numa aplicação protegida pelo Cloudflare Access, sendo o acesso determinado pelas políticas da aplicação. Não equivale a um token genérico da API de administração do Cloudflare, e o nome não permite pressupor permissões alargadas.

Considere uma tarefa de compilação hipotética que chama um ponto de acesso interno de implementação protegido pelo Access. O alerta no repositório é uma parte do incidente. A política da aplicação, o responsável pelo token e a tarefa que o utiliza determinam a exposição e o impacto operacional da contenção. Registe estas relações antes de um incidente, incluindo um responsável com capacidade para gerir o token de serviço e outro que possa atualizar o armazenamento de segredos da tarefa.

O novo detetor fornece informação útil para essa resposta. Não substitui políticas de privilégio mínimo no Access nem a manutenção das credenciais fora do controlo de versões. Uma lista de alertas vazia também não prova que todos os formatos de credenciais ou todas as codificações estão abrangidos.

## Contenha a credencial e verifique o serviço dependente

As [orientações do GitHub para resolver alertas](https://docs.github.com/en/code-security/how-tos/manage-security-alerts/manage-secret-scanning-alerts/resolving-alerts) indicam que um segredo incluído num commit deve ser tratado como comprometido. Uma resposta prática exige ações tanto no repositório como no emissor da credencial:

| Responsável | Evidência a recolher |
| --- | --- |
| Responsável pela resposta no repositório | Localização do alerta, histórico afetado e serviço responsável, sem copiar o segredo para uma issue |
| Responsável pela credencial no Cloudflare | Decisão de contenção e evidência de que a credencial exposta deixou de permitir autenticação |
| Responsável pelo serviço | Configuração do segredo atualizada e pedido autorizado bem-sucedido com a credencial de substituição |
| Responsável pela resposta ao incidente | Análise dos registos de acesso relevantes, dependências afetadas e motivo para encerrar o alerta |

O Cloudflare documenta a gestão de tokens de serviço em **Zero Trust > Access controls > Service credentials > Service Tokens**. A ação **Rotate secret** pode conceder um período de tolerância ao segredo anterior ou revogá-lo imediatamente. Esse período facilita uma transição planeada, mas mantém a credencial antiga utilizável durante esse intervalo. Perante uma exposição, tome essa decisão no âmbito do processo de resposta ao incidente, sem confundir continuidade com contenção.

Eliminar o token de serviço revoga o respetivo acesso e pode interromper todos os serviços dependentes. **Refresh** prolonga a validade do token; não substitui a troca de um segredo exposto. Há outra distinção fácil de perder: **Revoke existing tokens**, numa aplicação Access, revoga sessões, mas um Client ID e um Client Secret de um token de serviço ainda válido podem obter uma nova sessão. Utilize a ação documentada sobre a credencial que seja adequada ao incidente, com um administrador autorizado e conhecimento do impacto nos serviços dependentes.

## Torne a verificação uma passagem de responsabilidade explícita

Como exercício sugerido, associe um serviço que utilize um token à respetiva aplicação Access, política, armazenamento de segredos e responsáveis. Depois documente as verificações esperadas: a credencial de substituição funciona para a finalidade prevista, a credencial exposta é recusada após a contenção e a tarefa deixou de depender do valor antigo. Utilize um ambiente de teste aprovado e evite colocar segredos reais nas notas de teste. Trata-se de um exercício de planeamento, não de um teste realizado para este artigo.

Os alertas surgem na área **Security and quality** do repositório. Encerrar um alerta regista uma decisão; não revoga uma credencial do Cloudflare. Remover o valor da versão mais recente do ficheiro também não constitui contenção da credencial. Mantenha o alerta aberto até que a evidência da resposta permita resolvê-lo.

A decisão de adoção é limitada: confirmar a cobertura, atribuir responsabilidades e acrescentar este padrão ao processo de resposta existente. A [proteção de push](https://docs.github.com/en/code-security/concepts/secret-security/push-protection) continua a ser uma capacidade separada. Não prometa que este novo detetor bloqueia um push ou faz falhar automaticamente uma compilação quando a linha de suporte atual indica o contrário.

Até à próxima,

**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
