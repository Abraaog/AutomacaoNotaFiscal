package emiteja;

public class Cliente {

    private String nome;
    private final String documento;
    private String endereco;
    private String email;

    public Cliente(String nome, String documento, String endereco, String email) {
        if (documento == null || documento.isBlank()) {
            throw new IllegalArgumentException("Informe o CPF ou CNPJ do cliente");
        }
        this.documento = documento;
        this.endereco = endereco;
        this.email = email;

        setNome(nome);
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Informe o nome do cliente");
        }
        this.nome = nome;
    }

    public String getDocumento() {
        return documento;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return nome + " - documento " + documento;
    }
}
