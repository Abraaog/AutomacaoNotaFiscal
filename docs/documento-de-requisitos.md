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

