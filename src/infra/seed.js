import { gerarHash } from './senhas.js';

// Dados fictícios da Rota Motos para a demonstração. Nenhum dado real.
const USUARIOS = [
  { nome: 'Marcos Andrade', login: 'marcos', perfil: 'Vendedor' },
  { nome: 'Paula Rocha', login: 'paula', perfil: 'Vendedor' },
  { nome: 'Diego Souza', login: 'diego', perfil: 'Vendedor' },
  { nome: 'Sandra Lima', login: 'sandra', perfil: 'Gerente' },
  { nome: 'Fábio Teles', login: 'fabio', perfil: 'Contador' },
];

const MOTOS = [
  ['9C2JC4110PR104857', 'Honda', 'CG 160 Titan', 160, 2026, 'Vermelha', 17990],
  ['9C2JA0410SR220913', 'Honda', 'Pop 110i', 110, 2026, 'Branca', 9990],
  ['9C2JF2510SR031746', 'Honda', 'Biz 125', 125, 2026, 'Azul', 14490],
  ['9C6RG3150SA011592', 'Yamaha', 'Fazer FZ25', 250, 2026, 'Preta', 23890],
  ['9C6DG2510SA087321', 'Yamaha', 'XTZ 250 Lander', 250, 2025, 'Cinza', 25290],
  ['9C2KC2210RR000123', 'Honda', 'CB 300F Twister', 293, 2026, 'Vermelha', 26990],
  ['9C2ND1110SR112380', 'Honda', 'XRE 300 Sahara', 293, 2026, 'Verde', 29990],
  ['9BWZZZ3TZSB011872', 'BMW', 'G 310 GS', 313, 2025, 'Branca', 36950],
  ['JKAEXK040SDA20441', 'Kawasaki', 'Ninja 400', 399, 2026, 'Verde', 38990],
  ['9C2RH0610SR331907', 'Honda', 'CB 650R', 649, 2026, 'Cinza', 59900],
  ['JYARM3270SA005831', 'Yamaha', 'MT-07', 689, 2026, 'Azul', 54990],
  ['SMTE21BF5ST104452', 'Triumph', 'Tiger 900 GT', 888, 2025, 'Preta', 79990],
];

const CLIENTES = [
  { documento: '52998224725', nome: 'Ana Beatriz Costa', endereco: 'Rua das Acácias, 120, Centro, Rio Tinto - PB', email: 'ana.costa@exemplo.com' },
  { documento: '11144477735', nome: 'Carlos Henrique Melo', endereco: 'Av. Getúlio Vargas, 845, Mamanguape - PB', email: 'carlos.melo@exemplo.com' },
  { documento: '12345678909', nome: 'José Ribamar Lima', endereco: 'Rua São José, 33, Baía da Traição - PB', email: 'jose.lima@exemplo.com' },
  { documento: '11222333000181', nome: 'Transportes Litoral Ltda', endereco: 'Rodovia PB-041, km 12, Rio Tinto - PB', email: 'compras@litoral.exemplo.com' },
];

// Cria usuários, estoque e clientes; depois registra três vendas pelos próprios serviços,
// para o painel já mostrar documentos em estados diferentes.
export async function popularSeVazio(servicos, senhaDemo) {
  const { repos, venda, gestao } = servicos;
  if (repos.usuarios.contar() > 0) return false;

  const ids = Object.fromEntries(USUARIOS.map((u) => [u.login, repos.usuarios.inserir({ ...u, senhaHash: gerarHash(senhaDemo) })]));
  MOTOS.forEach(([chassi, marca, modelo, cilindrada, ano, cor, preco]) =>
    venda.cadastrarMoto({ chassi, marca, modelo, cilindrada, ano, cor, preco }));
  const clientes = CLIENTES.map((c) => venda.cadastrarCliente(c));

  const gerente = repos.usuarios.porId(ids.sandra);
  const vender = async (login, chassi, cliente, formaPagamento) => {
    const { processamento } = venda.confirmar({ chassi, clienteId: cliente.id, formaPagamento }, repos.usuarios.porId(ids[login]));
    await processamento;
  };

  gestao.alterarConfiguracao({ politica: 'A_ALIQUOTA_UNICA', cenario: 'SUCESSO' }, gerente);
  await vender('marcos', '9C2JC4110PR104857', clientes[0], 'PIX');
  gestao.alterarConfiguracao({ politica: 'B_POR_CILINDRADA', cenario: 'SUCESSO' }, gerente);
  await vender('paula', '9C2RH0610SR331907', clientes[3], 'Boleto');
  gestao.alterarConfiguracao({ politica: 'B_POR_CILINDRADA', cenario: 'REJEICAO' }, gerente);
  await vender('diego', '9C2ND1110SR112380', clientes[1], 'Cartão de crédito');
  gestao.alterarConfiguracao({ politica: 'A_ALIQUOTA_UNICA', cenario: 'SUCESSO' }, gerente);
  return true;
}
