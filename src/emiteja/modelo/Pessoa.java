package emiteja.modelo;

public abstract class Pessoa {

    protected String nome;

    public Pessoa(String nome) {
        setNome(nome);
    }

    public String getNome() {
        return nome;
    }

    public final void setNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Informe o nome");
        }
        this.nome = nome.trim();
    }

    public abstract String getIdentificacao();

    @Override
    public String toString() {
        return nome + " - " + getIdentificacao();
    }
}
