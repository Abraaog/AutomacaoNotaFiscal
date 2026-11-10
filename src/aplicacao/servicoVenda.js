import { ErroNegocio } from '../dominio/erros.js';
import { chassiValido, normalizarChassi, documentoValido, somenteDigitos } from '../dominio/validacoes.js';
import { transacao } from '../infra/banco.js';

export const FORMAS_PAGAMENTO = Object.freeze(['PIX', 'Cartão de crédito', 'Cartão de débito', 'Boleto', 'Dinheiro']);
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(valor, campo, minimo = 2) {
  const t = String(valor ?? '').trim();
  if (t.length < minimo) throw new ErroNegocio(`Preencha ${campo}.`);
  return t;
}

export function criarServicoVenda({ db, repos, emissao, relogio = () => new Date() }) {
  function cadastrarMoto(dados) {
    const chassi = normalizarChassi(dados.chassi);
    if (!chassiValido(chassi)) throw new ErroNegocio('Chassi inválido: 17 caracteres, sem as letras I, O e Q.');
    if (repos.motos.porChassi(chassi)) throw new ErroNegocio('Já existe uma moto com esse chassi no estoque.', 409);
    const cilindrada = Number(dados.cilindrada);
    const ano = Number(dados.ano);
    const precoCentavos = Math.round(Number(dados.preco) * 100);
    if (!Number.isInteger(cilindrada) || cilindrada < 50 || cilindrada > 2500) {
      throw new ErroNegocio('Cilindrada fora do intervalo de 50 a 2500 cc.');
    }
    if (!Number.isInteger(ano) || ano < 2000 || ano > relogio().getFullYear() + 1) throw new ErroNegocio('Ano inválido.');
    if (!(precoCentavos > 0)) throw new ErroNegocio('Preço precisa ser maior que zero.');
    repos.motos.inserir({
      chassi, marca: texto(dados.marca, 'a marca'), modelo: texto(dados.modelo, 'o modelo'),
      cor: texto(dados.cor, 'a cor', 3), cilindrada, ano, precoCentavos,
    });
    return repos.motos.porChassi(chassi);
  }

  function dadosCliente(dados) {
    const email = String(dados.email ?? '').trim();
    if (!FORMATO_EMAIL.test(email)) throw new ErroNegocio('E-mail inválido.');
    return { nome: texto(dados.nome, 'o nome', 3), endereco: texto(dados.endereco, 'o endereço', 8), email };
  }

  function cadastrarCliente(dados) {
    const documento = somenteDigitos(dados.documento);
    if (!documentoValido(documento)) throw new ErroNegocio('CPF ou CNPJ inválido: confira os dígitos.');
    if (repos.clientes.porDocumento(documento)) throw new ErroNegocio('Cliente já cadastrado com esse documento.', 409);
    const id = repos.clientes.inserir({ documento, ...dadosCliente(dados) });
    return repos.clientes.porId(id);
  }

  function atualizarCliente(id, dados) {
    if (!repos.clientes.porId(Number(id))) throw new ErroNegocio('Cliente não encontrado.', 404);
    repos.clientes.atualizar(Number(id), dadosCliente(dados));
    return repos.clientes.porId(Number(id));
  }

  // US05 e US06: confirma a venda, reserva a moto (RN03) e dispara a emissão.
  function confirmar({ chassi, clienteId, formaPagamento }, usuario) {
    if (!FORMAS_PAGAMENTO.includes(formaPagamento)) throw new ErroNegocio('Escolha a forma de pagamento.');
    const moto = repos.motos.porChassi(normalizarChassi(chassi));
    if (!moto) throw new ErroNegocio('Moto não encontrada.', 404);
    const cliente = repos.clientes.porId(Number(clienteId));
    if (!cliente) throw new ErroNegocio('Cliente não encontrado.', 404);
    const codigo = transacao(db, () => {
      if (!repos.motos.trocarSituacao(moto.chassi, 'Disponível', 'Reservada')) {
        const situacao = repos.motos.porChassi(moto.chassi).situacao;
        throw new ErroNegocio(`Esta moto não está mais disponível (${situacao}).`, 409);
      }
      const novo = repos.vendas.proximoCodigo(relogio().getFullYear());
      repos.vendas.inserir({
        codigo: novo, chassi: moto.chassi, clienteId: cliente.id, vendedorId: usuario.id,
        formaPagamento, valorCentavos: moto.preco_centavos, dataHora: relogio().toISOString(),
      });
      return novo;
    });
    return { venda: repos.vendas.porCodigo(codigo), ...emissao.emitir(codigo, usuario.id) };
  }

  return Object.freeze({ cadastrarMoto, cadastrarCliente, atualizarCliente, confirmar });
}
