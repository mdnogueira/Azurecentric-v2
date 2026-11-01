---
title: "O que é realmente o Defender for Cloud: CNAPP em linguagem simples"
description: "Compreenda como o Defender for Cloud relaciona postura, proteção de cargas de trabalho e segurança DevOps, e defina quem deve atuar sobre cada resultado."
pubDate: 2026-11-04T11:00:00-05:00
language: pt-PT
category: cloud-security
tags: [defender-for-cloud, cloud-security, cspm, devsecops]
translationKey: defender-for-cloud-series-01-cnapp-in-plain-english
draft: false
---

*Episódio 1 da série Segurança na Cloud – Microsoft Defender*

Uma recomendação sobre um recurso na cloud, um alerta de atividade suspeita e um problema identificado num repositório podem fazer parte da mesma análise de segurança. Isso não significa que exijam a mesma resposta ou a intervenção da mesma pessoa.

Esta distinção é um ponto de partida útil para compreender o Microsoft Defender for Cloud. Antes de ativarmos mais um plano ou criarmos mais um dashboard, precisamos de perceber as diferentes tarefas em que a plataforma nos pode ajudar.

A Microsoft descreve o Defender for Cloud como uma **plataforma de proteção de aplicações nativas da cloud**, normalmente identificada pela sigla **CNAPP**. A ideia é relacionar a segurança ao longo do ciclo de vida de uma aplicação, desde o desenvolvimento até ao ambiente cloud onde é executada. A [apresentação do Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction) reúne a gestão da postura, a segurança DevOps e a proteção de cargas de trabalho nesta abordagem.

![Modelo de segurança do Microsoft Defender for Cloud, desde o código até à execução, que relaciona desenvolvimento, arquitetura cloud e operações de segurança.](/images/series/defender-for-cloud/episode-01-cloud-security-pillars.png)

## Três perguntas para compreender a sigla

Podemos tornar estas três áreas mais fáceis de trabalhar se as traduzirmos em perguntas.

| Área | A pergunta a fazer | A ação que procuramos identificar |
| --- | --- | --- |
| Gestão da postura de segurança na cloud, ou CSPM | Como está configurado este ambiente e que riscos precisam de atenção? | Uma alteração à configuração ou à exposição, com um responsável identificado. |
| Proteção de cargas de trabalho na cloud, ou CWPP | Que atividade potencialmente ameaçadora precisa de ser investigada? | Uma investigação e, quando se justificar, uma resposta. |
| Segurança DevOps | O que precisa de ser corrigido no código ou no processo de entrega? | Uma alteração que resolva o problema antes de uma nova implementação. |

Estas perguntas estão relacionadas. Não representam três opções de subscrição, nem a tabela garante que todas as funcionalidades estejam disponíveis para qualquer recurso ou cloud.

Na gestão da postura, o Defender for Cloud avalia os recursos e apresenta recomendações. A Microsoft distingue as funcionalidades sem custo do **Foundational CSPM** das funcionalidades adicionais do plano pago **Defender CSPM**. A [documentação de CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management) explica essa diferença e as condições de suporte. Vamos analisar a escolha do plano com mais detalhe no Episódio 3.

A proteção de cargas de trabalho trata de outra parte do problema. Os planos Defender disponibilizam proteção para tipos de recursos específicos, e os seus alertas de segurança identificam atividade que requer atenção. A [documentação da Microsoft sobre alertas e incidentes](https://learn.microsoft.com/en-us/azure/defender-for-cloud/alerts-overview) explica a relação entre esses planos e os alertas que geram. Um problema de configuração e um alerta sobre atividade não devem, por isso, ser tratados como se fossem o mesmo tipo de evidência.

A segurança DevOps inclui o ambiente de desenvolvimento nesta análise. A [apresentação da segurança DevOps](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-devops-introduction) abrange resultados da análise de código, segredos, dependências e infraestrutura como código nos ambientes ligados à plataforma. Isto ajuda a perceber porque é que uma revisão de segurança na cloud pode exigir que um programador altere um repositório, em vez de um administrador mudar uma definição no portal.

## Acompanhar uma aplicação através destas perguntas

Consideremos uma aplicação de exemplo chamada **Orders Demo**. Inclui uma aplicação Web, uma conta de armazenamento e um repositório com a configuração de implementação. Este exemplo hipotético permite-nos acompanhar a mesma aplicação ao longo da série.

Suponha que a equipa identifica uma configuração de armazenamento que permite mais acesso de rede do que a arquitetura da aplicação exige. A primeira tarefa é confirmar o percurso de acesso pretendido. Que clientes precisam de aceder ao serviço? O que deixaria de funcionar se esse acesso fosse alterado? Quem pode aprovar e implementar a alteração?

Esta é uma discussão sobre a postura de segurança. A recomendação ajuda a identificar o trabalho que deve ser analisado; os responsáveis pela aplicação e pela plataforma continuam a ter de acordar qual deve ser a configuração correta.

Agora, suponha que é necessário investigar um alerta de proteção de cargas de trabalho. A equipa tem de analisar os elementos do alerta, o recurso afetado e a atividade observada. Fechar a tarefa anterior de configuração não explicaria, por si só, o que aconteceu, nem permitiria determinar se ocorreu um incidente.

Por fim, suponha que a configuração de implementação no repositório continua a criar a definição indesejada. Uma alteração manual no recurso pode resolver a configuração atual e, ao mesmo tempo, deixar a próxima implementação pronta para recriar o problema. O programador ou o responsável pela infraestrutura como código também precisa de rever a origem da configuração.

O valor de relacionar estas perspetivas é prático: podemos atuar sobre o recurso atual, investigar a atividade e corrigir a origem de um problema de configuração recorrente. Cada tarefa precisa da sua própria evidência e de um responsável.

## Verificar a proteção separadamente da postura

O facto de um recurso aparecer numa vista é um motivo para verificar o seu estado, não para assumir que todas as proteções estão ativadas.

Por exemplo, o Defender for App Service é um plano específico para aplicações Web e APIs executadas no App Service. A [documentação do produto](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-app-service-introduction) descreve os pré-requisitos, as capacidades de deteção e os aspetos de faturação. Vamos usar este plano como exemplo prático no Episódio 5.

Para esta primeira revisão, separe três elementos nas suas notas:

- Os recursos que pretende incluir.
- As funcionalidades de postura e proteção que pretende utilizar nesses recursos.
- As pessoas responsáveis por investigar os resultados e efetuar alterações.

Assim, evitamos uma passagem de responsabilidade pouco clara, como «o Defender está ativado». O responsável por uma aplicação precisa de saber o que está incluído, sobre que resultados deve atuar e quem vai investigar um alerta que esteja fora das responsabilidades da sua equipa.

## Uma primeira revisão sugerida, sem alterar a configuração

Escolha uma aplicação cujos responsáveis consiga identificar. Utilize os acessos que já lhe foram autorizados para analisar o ambiente; este exercício não exige a ativação de um plano pago nem a alteração de um recurso.

1. **Registe o âmbito.** Identifique a subscrição ou o ambiente cloud ligado à plataforma, os recursos da aplicação e o repositório. Registe qualquer componente da aplicação que não consiga analisar.
2. **Escolha um problema de postura para discutir.** Leia uma recomendação disponível e identifique os recursos afetados. Descreva a preocupação no contexto da aplicação, em vez de copiar apenas o título da recomendação para uma tarefa.
3. **Verifique a proteção pretendida.** Registe o plano aplicável e a informação de cobertura a que tem acesso. Se o estado não for claro, deixe essa questão identificada para o responsável pela plataforma.
4. **Identifique o processo de investigação.** Registe quem recebe um alerta de proteção de cargas de trabalho e onde pode obter os elementos de apoio à investigação. Uma lista de alertas vazia não demonstra que a proteção está a funcionar.
5. **Identifique o responsável pelo código de origem.** Confirme quem mantém a configuração de implementação da aplicação e como seria revista uma alteração.

Esta é uma rotina de revisão sugerida, não um procedimento oficial do portal da Microsoft nem o registo de um laboratório já executado. O resultado pode ser uma pequena tabela de responsabilidades:

| Tarefa | Equipa responsável sugerida | Evidência a conservar |
| --- | --- | --- |
| Confirmar e corrigir a configuração do recurso | Equipa da plataforma, em conjunto com o responsável pela aplicação | Âmbito, acesso pretendido e alteração revista. |
| Investigar atividade potencialmente ameaçadora | Operações de segurança | Contexto do alerta, notas da investigação e decisão de resposta. |
| Impedir que a implementação recrie o problema | Equipa da aplicação ou de infraestrutura como código | Alteração no repositório e verificação do estado resultante do recurso. |

A sua organização pode distribuir estas responsabilidades de outra forma. O importante é que cada tarefa tenha um responsável capaz de atuar e um processo claro para envolver as outras equipas.

## Começar por uma decisão operacional

Numa primeira adoção, uma aplicação com um âmbito acordado e responsáveis disponíveis é um exercício mais útil do que uma lista de problemas sem responsável. Pode usá-la para identificar falhas na passagem de responsabilidades antes de repetir o processo num conjunto mais alargado de recursos.

Registe também a experiência do portal que está a utilizar. A apresentação da Microsoft descreve a expansão do Defender for Cloud para o portal Defender, pelo que a documentação e as capturas de ecrã devem corresponder à experiência em análise. Vamos voltar a este tema de gestão de alterações no Episódio 8.

Antes do próximo episódio, preencha a tabela de responsabilidades para a aplicação escolhida. Depois, selecione uma recomendação que a equipa responsável possa avaliar. **No Episódio 2, vamos usar essa decisão para transformar a pontuação de segurança numa rotina de remediação**, com uma alteração proposta e evidência que mostre o que foi corrigido.

---

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
