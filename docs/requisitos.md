# Documento de Requisitos: EmiteJá

> Responsável: Ednaldo Guilherme Lima Cordeiro (issue #2)

Prioridade: **A** (essencial), **M** (importante), **B** (desejável).

## 1. Requisitos Funcionais

| ID | Descrição | Prioridade |
|---|---|---|
| RF01 | O sistema deve permitir login com usuário e senha, com perfis Vendedor, Gerente e Contador. | A |
| RF02 | O sistema deve permitir cadastrar, editar e inativar clientes (pessoa física ou jurídica). | A |
| RF03 | Ao informar um CNPJ, o sistema deve buscar razão social e endereço em serviço público de consulta e preencher o formulário. | M |
| RF04 | O sistema deve permitir cadastrar produtos com código, descrição, unidade, preço, NCM e CFOP padrão. | A |
| RF05 | O sistema deve permitir registrar uma venda selecionando cliente, produtos, quantidades e forma de pagamento. | A |
| RF06 | O sistema deve gerar a NF-e a partir de uma venda registrada, sem redigitação de dados. | A |
| RF07 | O sistema deve validar os campos obrigatórios da nota antes de enviá-la à SEFAZ e apontar cada erro encontrado. | A |
| RF08 | O sistema deve exibir o motivo de rejeição retornado pela SEFAZ e permitir corrigir e reenviar a nota. | A |
| RF09 | O sistema deve gerar o DANFE em PDF e enviá-lo, junto com o XML, para o e-mail do cliente. | M |
| RF10 | O sistema deve permitir ao Gerente cancelar uma NF-e autorizada dentro do prazo legal, informando justificativa. | A |
| RF11 | O sistema deve permitir consultar notas por período, cliente, número ou situação (autorizada, rejeitada, cancelada). | A |
| RF12 | O sistema deve gerar o pacote mensal (.zip com XMLs e resumo em PDF) e disponibilizá-lo ao Contador. | M |
| RF13 | O sistema deve permitir ao Gerente cadastrar usuários e definir seus perfis. | M |

## 2. Requisitos Não Funcionais

| ID | Categoria | Descrição |
|---|---|---|
| RNF01 | Desempenho | A emissão de uma nota, do clique até a resposta da SEFAZ, deve levar no máximo 10 segundos em condições normais. |
| RNF02 | Segurança | Senhas devem ser armazenadas com hash e o certificado A1 deve ficar criptografado no servidor. |
| RNF03 | Segurança | Todo acesso deve ser feito por HTTPS. |
| RNF04 | Usabilidade | Um vendedor deve conseguir emitir a primeira nota após no máximo 15 minutos de treinamento. |
| RNF05 | Disponibilidade | O sistema deve funcionar no horário comercial da loja (8h às 18h) com disponibilidade de 99%. |
| RNF06 | Conformidade | O XML gerado deve seguir o leiaute vigente da NF-e publicado pelo Portal Nacional da NF-e. |
| RNF07 | Retenção | XMLs autorizados devem ser guardados por no mínimo 5 anos. |

## 3. Regras de Negócio

| ID | Regra |
|---|---|
| RN01 | Uma venda só pode gerar uma NF-e autorizada. |
| RN02 | Somente o perfil Gerente pode cancelar notas. |
| RN03 | O cancelamento só é permitido em até 24 horas após a autorização. |
| RN04 | A justificativa de cancelamento deve ter no mínimo 15 caracteres. |
| RN05 | Produto sem NCM cadastrado não pode ser incluído em venda que gere nota. |
| RN06 | Cliente pessoa jurídica deve ter CNPJ válido (dígitos verificadores conferidos). |
| RN07 | O pacote mensal só inclui notas autorizadas ou canceladas do mês fechado. |
| RN08 | O perfil Contador tem acesso apenas de leitura às notas e aos pacotes mensais. |
