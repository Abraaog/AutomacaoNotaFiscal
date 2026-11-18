package emiteja.modelo;

public abstract class PoliticaImposto {

    private final String nome;

    protected PoliticaImposto(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("A política de imposto precisa de um nome");
        }
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    public abstract double aliquota(Moto moto);

    public double calcular(Moto moto, double valor) {
        if (valor < 0) {
            throw new IllegalArgumentException("O valor da venda não pode ser negativo");
        }
        return Math.round(valor * aliquota(moto) * 100) / 100.0;
    }

    @Override
    public String toString() {
        return nome;
    }
}
