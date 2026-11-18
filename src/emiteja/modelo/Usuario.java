package emiteja.modelo;

public class Usuario extends Pessoa {

    private final String login;
    private final String perfil;

    public Usuario(String nome, String login, String perfil) {
        super(nome);
        if (login == null || login.isBlank()) {
            throw new IllegalArgumentException("Informe o login do usuário");
        }
        this.login = login;
        this.perfil = perfil;
    }

    @Override
    public String getIdentificacao() {
        return perfil + " (" + login + ")";
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
}
