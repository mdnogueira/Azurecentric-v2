---
title: "Foundational CSPM ou Defender CSPM: decidir o plano com base na evidência"
description: "Associe capacidades CSPM a recursos, permissões e faturação. Prepare uma fase piloto e distinga a gestão no Azure da pré-visualização no portal Defender."
pubDate: "2026-11-18T11:00:00-05:00"
language: "pt-PT"
category: "cloud-security"
tags: ["defender-for-cloud", "cloud-security", "cspm", "security-posture"]
translationKey: "defender-for-cloud-series-03-foundational-or-defender-cspm"
draft: false
---

*Episódio 3 da série Segurança na Cloud – Microsoft Defender*

[Ver a série](/pt/series/cloud-security-microsoft-defender)

Escolha um plano de gestão de postura com base nas decisões que a equipa precisa de tomar e nos recursos que precisa de avaliar. Um plano pago pode adicionar contexto útil, mas uma licença não estabelece que o componente necessário está a recolher dados, que o recurso é suportado ou que alguém irá agir sobre o resultado.

No Episódio 2, transformámos uma recomendação numa tarefa com um responsável e evidência de verificação. Esta semana, a **Orders Demo**, a nossa aplicação hipotética, precisa de uma decisão sobre o plano. A sua subscrição Azure contém uma aplicação web, uma base de dados, armazenamento e máquinas virtuais. Estes são requisitos ilustrativos, não um inventário inspecionado num tenant.

![Uma decisão de plano CSPM sugerida: estabelecer a cobertura atual, identificar as capacidades necessárias, verificar o suporte e permissões dos recursos, e acordar o âmbito, custo e evidência para uma fase piloto.](/images/series/defender-for-cloud/episode-03-plan-decision.pt.svg)

## Comece com a questão a que a equipa ainda não consegue responder

A equipa já pode discutir recomendações de configuração. A sua questão não resolvida é qual a combinação de exposição, permissões e vulnerabilidades merece investigação em primeiro lugar. Esse é um ponto de partida mais útil do que perguntar se o plano pago tem mais funcionalidades.

A [comparação de planos CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management) da Microsoft distingue o CSPM Fundacional gratuito do Defender CSPM pago. Para Azure, as capacidades partilhadas incluem inventário, recomendações de segurança e pontuação de segurança. A coluna paga adiciona capacidades como análise de caminhos de ataque, explorador de segurança e priorização de riscos. As tabelas publicadas diferem por cloud e funcionalidade; uma entrada para Azure não é evidência de suporte idêntico para AWS ou GCP.

Registe a decisão em falta, os ativos a que diz respeito e a evidência que poderia ajudar. Para a Orders Demo, o requisito proposto é um caminho suportado a partir de um ativo exposto externamente até aos dados sensíveis da aplicação. A equipa ainda tem de determinar se os recursos e relações relevantes estão representados. Um nome de plano não pode responder a isso por ela.

| Requisito a avaliar | Capacidade candidata | Evidência necessária antes de escolher |
| --- | --- | --- |
| Rever preocupações de configuração conhecidas | Recomendações Fundacionais | Os recursos relevantes aparecem e os resultados têm proprietários responsáveis. |
| Investigar a exposição interligada | [Análise de caminhos de ataque do Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-attack-path) | Os ativos suportados e o contexto necessário são realmente recolhidos. |
| Fazer perguntas em todo o ambiente | Explorador de segurança do Defender CSPM | O inventário e as relações pretendidas estão disponíveis para o revisor. |
| Priorizar o trabalho usando risco contextual | [Priorização de riscos do Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/risk-prioritization) | O contexto ajuda a explicar uma decisão de remediação específica. |

Esta ficha é uma ferramenta de decisão sugerida. Não é uma afirmação de que o exemplo produziu um caminho de ataque ou demonstrou uma redução no risco.

## Inspecione a cobertura, os componentes e o acesso separadamente

Utilize a [matriz de suporte na cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/support-matrix-defender-for-cloud) atual ao lado dos requisitos próprios de cada capacidade. Ambientes comerciais, governamentais e outras clouds podem diferir. Registe a cloud real, a região, o tipo de recurso e a integração. Uma linha não suportada é uma lacuna a resolver, em vez de uma razão para rotular toda a aplicação como coberta.

As [orientações de ativação](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan) da Microsoft separam o plano dos seus componentes. A análise sem agentes, por exemplo, necessita que o Subscription Owner ative o plano para funcionalidade completa; caso contrário, o contexto de vulnerabilidade pode estar ausente dos caminhos de ataque e do explorador de segurança. A visibilidade do inventário e um plano ativado respondem, portanto, a perguntas diferentes da recolha bem-sucedida.

Para uma subscrição gerida no Azure, o percurso de configuração documentado é Microsoft Defender for Cloud → **Environment settings** → a subscrição relevante → **Defender plans**. Reveja as definições do plano e o livro de cobertura antes de propor uma alteração. Selecionar **On** e guardar ativa um plano pago; não é um passo de inspeção apenas para leitura. Este artigo não instrui para ativar isto em produção simplesmente para completar a ficha.

A [referência de permissões](https://learn.microsoft.com/en-us/azure/defender-for-cloud/permissions) distingue a visualização da alteração de planos e a remediação de recursos. Security Reader fornece visibilidade de segurança apenas para leitura. Security Admin, Contributor ou Owner ao nível da subscrição podem ativar planos, enquanto Owner é necessário para todas as capacidades. Um revisor e um implementador de alterações não precisam de ser a mesma pessoa. Solicite a permissão necessária para a tarefa real, não o acesso amplo para todos os que participam na revisão.

## Trate o portal e o modelo de faturação como parte da decisão

A [experiência de gestão de planos no portal do Defender](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-portal/manage-plans-defender-portal) está em **pré-visualização** no momento da preparação. Suporta ambientes comerciais Azure e tem os seus próprios requisitos de função. A transição pode mover a ativação do plano para a faturação por unidades de carga de trabalho do Defender (DWU), e as configurações de plano ao nível do recurso não são preservadas. A ativação global também afeta os ambientes ligados e futuros. Não trate essa transferência como uma alteração meramente visual da navegação ou combine-a com uma pequena fase piloto sem rever o seu âmbito.

Para a Orders Demo, a fase piloto proposta permanece dentro de uma subscrição gerida no Azure e escolhida deliberadamente. Mover a gestão do plano é uma decisão separada. Se o ambiente já utiliza a experiência de pré-visualização, registe esse facto e avalie as suas permissões, cobertura e regras de faturação atuais em vez de aplicar o procedimento de gestão no Azure sem verificar a sua adequação.

Utilize a [página de preços do Defender for Cloud](https://azure.microsoft.com/en-us/pricing/details/defender-for-cloud/) e a estimativa aplicável para a oferta, moeda e modelo de faturação selecionados. Registe quais os recursos e componentes opcionais que são cobráveis, a sobreposição de planos existentes, as condições de teste gratuito, se relevante, e a posição esperada após o fim do teste gratuito. Uma pequena aplicação não significa necessariamente uma subscrição cobrável pequena. A infraestrutura utilizada para uma fase piloto também pode ter as suas próprias cobranças. Esta comparação não fornece um preço fixo ou uma poupança prometida.

## Faça com que a fase piloto produza um registo de decisão

Antes de qualquer ativação autorizada, acorde um responsável, âmbito, limite de custo e condição de paragem. Mantenha a configuração anterior e o procedimento de retorno proposto. Se uma política automática ou uma configuração mais ampla puder reativar um plano, tenha isso em conta no procedimento de retorno em vez de assumir que um único botão termina a alteração.

Em seguida, defina perguntas observáveis. O revisor consegue encontrar os ativos selecionados? Os componentes esperados estão ativados e os seus pré-requisitos estão satisfeitos? O contexto explica por que razão uma recomendação deve ter prioridade? O proprietário da aplicação consegue identificar uma alteração realista e a evidência necessária para a verificar? Se não aparecer nenhum caminho, investigue a recolha, o suporte e o âmbito antes de interpretar o resultado como uma ausência de exposição.

Mantenha um registo compacto:

| Campo de decisão | Entrada sugerida para a equipa completar |
| --- | --- |
| Âmbito e linha de base | Subscrição, cloud, inventário de recursos, planos atuais, componentes e data de captura. |
| Requisito e lacuna | Questão operacional, capacidade suportada e qualquer integração ou permissão em falta. |
| Limite comercial | Estimativa, modelo de faturação, condições de teste/fim e a pessoa que reverá as cobranças. |
| Resultado | Evidência recolhida, lacunas não resolvidas, responsável e decisão condicional de expansão/paragem. |

Nenhuma fase piloto, configuração de tenant ou medição de custos foi realizada para este artigo. O exercício proposto é preparar este registo com os proprietários da aplicação e da plataforma antes de autorizar alterações. Volte a verificar as [notas de lançamento](https://learn.microsoft.com/en-us/azure/defender-for-cloud/release-notes) e a documentação de funcionalidades no momento da implementação; uma tabela verificada para este artigo não é uma garantia de disponibilidade futura.

O CSPM Fundacional pode satisfazer o requisito presente da equipa. O Defender CSPM pode justificar uma fase piloto controlada onde uma capacidade avançada suportada responde a uma questão operacional real. Qualquer decisão é mais forte quando nomeia a lacuna, o responsável e a evidência, em vez de confiar numa lista de funcionalidades maior.

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
