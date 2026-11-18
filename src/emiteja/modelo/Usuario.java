package emiteja.modelo;

public class Usuario {

    private final String nome;
    private final String login;
    private final String perfil;

    public Usuario(String nome, String login, String perfil) {
        if (login == null || login.isBlank()) {
            throw new IllegalArgumentException("Informe o login do usuário");
        }
        this.nome = nome;
        this.login = login;
        this.perfil = perfil;
    }

    public String getNome() {
        return nome;
    }

    public String getLogin() {
        return login;
    }

    public String getPerfil() {
        return perfil;
    }

    public boolean podeCancelar() {
        return perfil.equals("Gerente");
    }

    @Override
    public String toString() {
        return nome + " (" + perfil + ")";
    }
}
