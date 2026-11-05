# Documento de Requisitos

**Projeto EmiteJá: Automação de Emissão de Nota Fiscal**
Revisão 1.0

| Elaboração | Elaboração | Elaboração | Aprovação |
|---|---|---|---|
| Abraão Gomes da Silva Araújo | Ednaldo Guilherme Lima Cordeiro | Kayk Thierry Araujo Silva | Rita Mendes |
| Equipe de desenvolvimento (Grupo04) | Equipe de desenvolvimento (Grupo04) | Equipe de desenvolvimento (Grupo04) | Cliente (fictícia), proprietária da Elétrica Ponto Certo |
| Data: 05/11/2026 | Data: 05/11/2026 | Data: 05/11/2026 | Data: 05/11/2026 |

## Registro de Alterações

| Versão | Responsável | Data | Alterações |
|---|---|---|---|
| 1.0 | Abraão, Ednaldo, Kayk | 05/11/2026 | Elaboração inicial do Documento de Requisitos do EmiteJá. |

## 1. Introdução

Este documento reúne os requisitos de usuário do EmiteJá. A seção 2 descreve o propósito do sistema; a seção 3 apresenta o minimundo e o problema enfrentado pelo cliente; a seção 4 lista os requisitos funcionais, as regras de negócio e os requisitos não funcionais; a seção 5 apresenta o modelo de casos de uso; a seção 6 traz os diagramas de atividades; e a seção 7 indica o protótipo.

## 2. Descrição do Propósito do Sistema

O EmiteJá é um sistema web que transforma a venda feita no balcão em nota fiscal eletrônica (NF-e) sem que o vendedor precise redigitar dados. Ele reaproveita os cadastros de clientes e produtos, confere os campos obrigatórios antes de enviar a nota à SEFAZ, entrega o documento ao cliente por e-mail e organiza todas as notas para consulta e para o fechamento mensal com a contabilidade.

## 3. Descrição do Minimundo

A Elétrica Ponto Certo é uma loja de materiais elétricos de bairro, de propriedade de Rita Mendes, que atende consumidores finais, eletricistas e pequenas construtoras. A equipe tem três vendedores que se revezam no balcão, uma gerente e um contador externo responsável pela escrituração.

Hoje a venda é anotada no sistema de caixa e, quando o cliente pede nota, o vendedor abre o emissor gratuito do estado e digita tudo de novo: dados do cliente, cada produto, NCM e CFOP. Nos horários de pico isso forma fila no balcão. Como os vendedores não dominam tributação, é comum a nota voltar rejeitada por NCM ou CFOP incorreto, e o vendedor só descobre depois de enviar. Cancelamentos são feitos por qualquer funcionário, sem registro de quem cancelou nem por quê. No fim do mês, a gerente procura os XMLs em pastas de computadores diferentes para mandar ao contador, e já aconteceu de notas ficarem de fora.

O EmiteJá deve permitir que a nota seja gerada a partir da venda já registrada, com os dados fiscais vindos do cadastro de produtos, que os erros sejam apontados antes do envio, que apenas a gerente possa cancelar notas e que o contador baixe sozinho o pacote do mês.

## 4. Requisitos de Usuário

Tomando por base o minimundo, foram identificados os seguintes requisitos de usuário.

### Requisitos Funcionais

| Identificador | Descrição | Prioridade | Depende de |
|---|---|---|---|
| US01 | Como vendedor, quero entrar no sistema com meu usuário e senha, para que as notas que eu emitir fiquem registradas em meu nome. | Alta | - |
| US02 | Como gerente, quero cadastrar os usuários da loja e definir o perfil de cada um (vendedor, gerente ou contador). | Alta | US01 |
| US03 | Como gerente, quero enviar o certificado digital A1 da loja e ser avisada antes do vencimento. | Alta | US01 |
| US04 | Como vendedor, quero cadastrar um cliente informando apenas o CNPJ e ter razão social e endereço preenchidos automaticamente. | Alta | US01 |
| US05 | Como gerente, quero cadastrar produtos com NCM, CFOP e unidade, para que o vendedor não precise conhecer tributação. | Alta | US01 |
| US06 | Como vendedor, quero registrar a venda no balcão e gerar a nota dela com um clique, sem redigitar dados. | Alta | US03, US04, US05 |
| US07 | Como vendedor, quero saber exatamente qual campo está errado antes do envio, para evitar nota rejeitada. | Alta | US06 |
| US08 | Como vendedor, quero que o cliente receba o DANFE e o XML por e-mail automaticamente após a autorização. | Média | US06 |
| US09 | Como gerente, quero cancelar uma nota emitida por engano informando a justificativa. | Alta | US06 |
| US10 | Como vendedor, quero buscar notas por cliente, número, período ou situação. | Média | US06 |
| US11 | Como contador, quero baixar em um único arquivo todas as notas do mês com um resumo. | Alta | US06, US09 |
| US12 | Como gerente, quero ver quanto foi faturado em notas no mês e quantas foram canceladas. | Média | US06, US09 |

### Regras de Negócio

| Identificador | Descrição | Prioridade | Requisitos Relacionados |
|---|---|---|---|
| RN01 | Uma venda só pode gerar uma única NF-e autorizada. | Alta | US06 |
| RN02 | Somente o perfil Gerente pode cancelar notas. | Alta | US02, US09 |
| RN03 | O cancelamento só é permitido em até 24 horas após a autorização. | Alta | US09 |
| RN04 | A justificativa de cancelamento deve ter no mínimo 15 caracteres. | Alta | US09 |
| RN05 | Produto sem NCM cadastrado não pode ser incluído em venda que gere nota. | Alta | US05, US07 |
| RN06 | CPF e CNPJ de clientes devem ter os dígitos verificadores conferidos no cadastro. | Alta | US04 |
| RN07 | O pacote mensal inclui apenas notas autorizadas ou canceladas de um mês já encerrado. | Alta | US11 |
| RN08 | O perfil Contador tem acesso somente de leitura às notas e aos pacotes mensais. | Alta | US02, US11 |
| RN09 | O sistema avisa a gerente 30 dias antes do vencimento do certificado A1 e bloqueia a emissão após o vencimento. | Média | US03 |

### Requisitos Não Funcionais

| Identificador | Descrição | Origem do requisito | Critérios de Aceitação | Categoria | Prioridade |
|---|---|---|---|---|---|
| RNF01 | A emissão deve ser rápida o suficiente para não formar fila no balcão. | Minimundo (fila no pico) | Do clique em "Gerar nota" até a resposta da SEFAZ, no máximo 10 segundos em 95% das emissões. | Desempenho | Alta |
| RNF02 | Senhas e certificado digital devem ser protegidos no servidor. | US01, US03 | Senhas armazenadas apenas como hash; certificado A1 armazenado criptografado. | Segurança | Alta |
| RNF03 | Todo acesso ao sistema deve ser feito por conexão segura. | US01 | 100% das requisições servidas via HTTPS. | Segurança | Alta |
| RNF04 | Um vendedor novo deve conseguir usar o sistema com pouco treinamento. | Minimundo (revezamento no balcão) | Vendedor emite a primeira nota sozinho após no máximo 15 minutos de treinamento. | Usabilidade | Média |
| RNF05 | O sistema deve estar disponível no horário de funcionamento da loja. | Minimundo | Disponibilidade de 99% entre 8h e 18h, de segunda a sábado. | Disponibilidade | Média |
| RNF06 | O XML gerado deve seguir o leiaute oficial da NF-e. | Legislação fiscal | 100% dos XMLs validados contra o schema vigente do Portal Nacional da NF-e. | Legal e regulatório | Alta |
| RNF07 | Os XMLs autorizados devem ser guardados pelo prazo legal. | Legislação fiscal | XMLs mantidos e recuperáveis por no mínimo 5 anos. | Legal e regulatório | Alta |

