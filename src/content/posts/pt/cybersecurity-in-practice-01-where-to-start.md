---
title: "A cibersegurança começa com o que a sua empresa precisa de proteger"
description: "Comece por um serviço empresarial, compreenda o que pode correr mal e transforme as orientações de segurança da Microsoft numa primeira ação prática."
pubDate: 2026-10-30T11:00:00-04:00
language: pt-PT
category: cloud-security
tags: [cybersecurity, cloud-security, zero-trust, security-architecture]
translationKey: cybersecurity-in-practice-01-where-to-start
draft: false
---

*Episódio 1 da série Cibersegurança na Prática*

Tem uma aplicação para manter em funcionamento, pessoas que precisam de acesso à mesma e informações que nunca devem acabar nas mãos erradas. Alguém pergunta se o ambiente é seguro. Por onde começa?

Comece por descrever o que precisa de continuar a funcionar, que informação é importante e o que aconteceria se o serviço ou a informação fossem comprometidos. Isso dá um propósito à conversa sobre segurança. A escolha de controlos torna-se mais fácil quando consegue explicar o problema que cada um se destina a resolver.

Esta série constrói esse raciocínio desde a base. Vamos percorrer a identidade, os dados, a infraestrutura, o design da aplicação e as operações de segurança, utilizando as orientações da Microsoft quando nos ajudam a tomar uma decisão. Um novo artigo será publicado todas as sextas-feiras nas próximas semanas. Pode acompanhar o exercício com uma aplicação que gere, mesmo que ainda esteja a aprender a terminologia de segurança.

![Um portal do cliente ilustrativo ligado ao acesso dos colaboradores, registos de clientes e recuperação, com três perguntas sobre quem pode entrar, o que pode ser alterado e como o serviço regressa.](/images/series/cybersecurity-in-practice/episode-01-business-service-map.svg)

## Comece por um serviço que consiga descrever

Para este primeiro artigo, considere um **portal de clientes fictício**. Os clientes submetem pedidos, os colaboradores processam-nos e uma pequena equipa de operações mantém a aplicação. O portal armazena contactos e o histórico de cada pedido. Depende também de um serviço de identidade, alojamento da aplicação, armazenamento e um processo de recuperação.

Já existe aqui material suficiente para uma discussão útil sobre segurança. Alguém pode ler registos que não deveria ver. Alguém pode alterar um pedido ou apagar o seu histórico. O serviço pode deixar de funcionar quando os clientes mais precisam dele.

Essas são consequências diferentes. Uma cópia de segurança pode ajudar a recuperar informação apagada, mas não desfaz a divulgação dos dados de um cliente. Um início de sessão bem-sucedido diz-nos algo sobre a identidade; não estabelece que o utilizador deva ver todos os registos.

Os [princípios de segurança do Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/security/principles) da Microsoft utilizam a confidencialidade, a integridade e a disponibilidade como preocupações de segurança interligadas. Em termos quotidianos: restrinja a informação às pessoas a quem se destina, preserve a sua fiabilidade e mantenha o serviço disponível para as pessoas que dele precisam. Vamos examinar essa relação mais de perto no próximo artigo.

## Descreva o risco numa frase clara

«Precisamos de melhor segurança» é difícil de transformar em trabalho. Tente uma frase que nomeie o serviço, a falha possível e a sua consequência em vez disso.

Para o nosso portal fictício, isso poderia ser: **Uma conta com acesso desnecessário pode expor os pedidos de clientes de outras equipas.** Este é um cenário proposto para investigar, não uma prova de que um ambiente específico tem esse problema.

Agora, as próximas perguntas tornam-se mais precisas. Que contas podem ler esses pedidos? Quem aprovou esse âmbito? Conseguimos ver quando o acesso foi utilizado? Quem o pode remover se a conta for comprometida?

A tabela abaixo é um ponto de partida ilustrativo para essa discussão. Não é um resultado de avaliação nem uma lista de controlos que todas as aplicações devam implementar exatamente desta forma.

| Parte do portal | Pergunta a investigar | Evidência a apresentar |
|---|---|---|
| Acesso dos colaboradores | Cada função pode aceder apenas aos pedidos de que precisa? | Atribuições de funções atuais e um modelo de acesso acordado |
| Registos de clientes | Alguém pode alterar um pedido sem deixar rasto? | Uma explicação de como as alterações são autorizadas e registadas |
| Recuperação | A equipa consegue restaurar um serviço utilizável e fiável? | Um procedimento de recuperação e o resultado de um exercício de recuperação autorizado |

Note que a evidência é algo que uma pessoa pode examinar. Um painel verde pode ser útil, mas a conversa ainda precisa de chegar à aplicação e às pessoas responsáveis por ela.

## Utilize os frameworks da Microsoft para tarefas diferentes

Existem várias formas de aceder às orientações de segurança da Microsoft. Saber para que serve cada recurso poupa-nos de tratar um diagrama de referência como uma lista de verificação de implementação.

Os [recursos do Security Adoption Framework](https://learn.microsoft.com/en-us/security/adoption/adoption) apoiam um esforço de modernização da segurança em toda a organização. Isso é útil quando a discussão inclui estratégia, responsabilidades e a relação entre as prioridades empresariais e o trabalho técnico. Para o nosso portal, é aqui que ligaríamos o trabalho ao programa de segurança mais amplo, em vez de deixar a equipa da aplicação tomar todas as decisões sozinha.

O [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/pillars) analisa o design da carga de trabalho através de cinco pilares: fiabilidade, segurança, otimização de custos, excelência operacional e eficiência de desempenho. Ajuda a estruturar uma revisão do próprio portal. Por exemplo, uma alteração de segurança proposta precisa de um responsável pelas operações e de um design que a equipa consiga manter.

As [Arquiteturas de Referência de Cibersegurança da Microsoft](https://learn.microsoft.com/en-us/security/adoption/mcra), ou MCRA, ajudam a explicar como as capacidades de segurança se encaixam em todo o ambiente. Utilize-as como referência quando precisar de compreender relações ou discutir uma arquitetura de referência para o estado pretendido. Não são evidência de que o seu ambiente já tenha essas capacidades configuradas corretamente.

Estes recursos operam em níveis diferentes. Vamos regressar a eles à medida que a série se desenvolve, com uma pergunta específica a responder em cada ocasião.

## As fases de trabalho que utilizo

Organizo este trabalho em seis fases práticas que resultam da minha experiência: **Avaliar, Planear, Proteger, Detetar, Responder e Recuperar**. Avaliar permite perceber o que temos e onde estão as preocupações; Planear transforma essas preocupações em decisões com responsáveis. As restantes fases abrangem a aplicação de medidas de proteção, a identificação de atividade suspeita, a resposta a incidentes e o restabelecimento de um serviço fiável.

Estas fases descrevem a forma como estruturo o trabalho. Não são os nomes oficiais de fases do SAF da Microsoft, nem uma sequência de sentido único. A governação, a atribuição de responsabilidades e a aprendizagem acompanham as seis fases, e a deteção e a preparação da resposta continuam enquanto avaliamos ou melhoramos a proteção. O [NIST Cybersecurity Framework 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) oferece uma comparação útil: as suas funções são Governar, Identificar, Proteger, Detetar, Responder e Recuperar, e devem ser tratadas em paralelo. As minhas fases Avaliar e Planear são uma forma prática de organizar trabalho relacionado, sem substituir diretamente essas funções.

## Introduza o Zero Trust na primeira decisão

A Microsoft descreve três princípios fundamentais do [Zero Trust](https://learn.microsoft.com/en-us/security/zero-trust/zero-trust-overview): verificação explícita, acesso com o mínimo de privilégios e assumir que pode haver uma intrusão.

Para o nosso exemplo, isso dá-nos uma linha prática de questionamento. Como é avaliado o acesso de um colaborador? A sua função precisa de acesso aos pedidos de todas as equipas? Se a conta for comprometida, o que limita o impacto e quem investiga a atividade?

Não precisamos de redesenhar todo o portal nesta primeira discussão. Precisamos é de deixar de assumir que o acesso é apropriado simplesmente porque a conta pertence à organização. O resultado útil é uma decisão que podemos explicar e verificar.

## Uma sessão de trabalho sugerida

Este é um exercício de planeamento, não um procedimento oficial do portal. Não requer uma nova subscrição, um plano de segurança pago nem alterações à produção.

1. **Escolha um serviço.** Escreva o que faz e quem depende dele. Mantenha o primeiro âmbito pequeno o suficiente para que as pessoas na conversa o compreendam.
2. **Esboce as suas dependências.** Inclua pessoas, identidades, dados, alojamento e recuperação. Um diagrama simples é suficiente; registe tudo o que ainda precisa de confirmar.
3. **Descreva uma possível falha.** Utilize uma frase como o exemplo de acesso desnecessário acima. Explique a consequência sem inventar uma probabilidade ou um valor financeiro.
4. **Atribua a próxima investigação.** Nomeie a pessoa que verificará o estado atual, a evidência que trará de volta e quando a equipa a irá analisar.
5. **Defina o que acontece após a verificação.** Se a preocupação for confirmada, quem aprova a alteração? Se não for confirmada, que evidência encerra a questão?

A primeira sessão deve terminar com uma próxima ação clara. Se ninguém conseguir dizer o que será verificado ou quem é o responsável, reduza o âmbito e tente novamente.

Antes da próxima sexta-feira, faça esse exercício para um serviço que conheça. **No Episódio 2, utilizaremos a confidencialidade, a integridade e a disponibilidade para examinar o mesmo serviço de três ângulos diferentes**, e veremos por que razão melhorar uma área não resolve automaticamente as outras.

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
