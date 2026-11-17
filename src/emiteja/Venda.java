package emiteja;

public class Venda {

    String codigo;
    Moto moto;
    Cliente cliente;
    Usuario vendedor;
    String formaPagamento;
    double valor;
    String situacao;

    public Venda(String codigo, Moto moto, Cliente cliente, Usuario vendedor, String formaPagamento) {
        this.codigo = codigo;
        this.moto = moto;
        this.cliente = cliente;
        this.vendedor = vendedor;
        this.formaPagamento = formaPagamento;
        this.valor = moto.preco;
        this.situacao = "Confirmada";
    }
}
