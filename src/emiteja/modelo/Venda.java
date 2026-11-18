package emiteja.modelo;

public class Venda {

    public static final String CONFIRMADA = "Confirmada";
    public static final String CANCELADA = "Cancelada";

    private final String codigo;
    private final Moto moto;
    private final Cliente cliente;
    private final Usuario vendedor;
    private final String formaPagamento;
    private final double valor;
    private String situacao;

    public Venda(String codigo, Moto moto, Cliente cliente, Usuario vendedor, String formaPagamento) {
        if (moto == null || cliente == null || vendedor == null) {
            throw new IllegalArgumentException("A venda precisa de moto, cliente e vendedor");
        }
        this.codigo = codigo;
        this.moto = moto;
        this.cliente = cliente;
        this.vendedor = vendedor;
        this.formaPagamento = formaPagamento;
        this.valor = moto.getPreco();
        this.situacao = CONFIRMADA;

        moto.reservar();
    }

    public String getCodigo() {
        return codigo;
    }

    public Moto getMoto() {
        return moto;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Usuario getVendedor() {
        return vendedor;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public double getValor() {
        return valor;
    }

    public String getSituacao() {
        return situacao;
    }

    public boolean estaCancelada() {
        return situacao.equals(CANCELADA);
    }

    public void cancelar(Usuario responsavel) {
        if (!responsavel.podeCancelar()) {
            throw new IllegalStateException("Só a gerência pode cancelar uma venda");
        }
        if (estaCancelada()) {
            throw new IllegalStateException("A venda " + codigo + " já está cancelada");
        }
        situacao = CANCELADA;
        moto.liberar();
    }

    @Override
    public String toString() {
        return "Venda " + codigo + " (" + situacao + ")"
                + "\n  Moto: " + moto
                + "\n  Cliente: " + cliente
                + "\n  Vendedor: " + vendedor
                + "\n  Pagamento: " + formaPagamento + String.format(" - R$ %.2f", valor);
    }
}
