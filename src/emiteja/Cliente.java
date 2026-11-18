package emiteja;

public class Cliente {

    private String nome;
    private final String documento;
    private String endereco;
    private String email;

    public Cliente(String nome, String documento, String endereco, String email) {
        String digitos = somenteDigitos(documento);
        if (!documentoValido(digitos)) {
            throw new IllegalArgumentException("CPF ou CNPJ inválido: " + documento);
        }
        this.documento = digitos;
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

    public boolean ehPessoaJuridica() {
        return documento.length() == 14;
    }

    private static String somenteDigitos(String texto) {
        if (texto == null) {
            return "";
        }
        return texto.replaceAll("\\D", "");
    }

    private static boolean documentoValido(String digitos) {
        if (digitos.length() == 11) {
            return cpfValido(digitos);
        }
        if (digitos.length() == 14) {
            return cnpjValido(digitos);
        }
        return false;
    }

    private static boolean todosIguais(String digitos) {
        return digitos.chars().distinct().count() == 1;
    }

    private static int digitoVerificador(String base, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) {
            soma += (base.charAt(i) - '0') * pesos[i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static boolean cpfValido(String cpf) {
        if (todosIguais(cpf)) {
            return false;
        }
        int d1 = digitoVerificador(cpf, new int[]{10, 9, 8, 7, 6, 5, 4, 3, 2});
        int d2 = digitoVerificador(cpf, new int[]{11, 10, 9, 8, 7, 6, 5, 4, 3, 2});
        return cpf.charAt(9) - '0' == d1 && cpf.charAt(10) - '0' == d2;
    }

    private static boolean cnpjValido(String cnpj) {
        if (todosIguais(cnpj)) {
            return false;
        }
        int d1 = digitoVerificador(cnpj, new int[]{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        int d2 = digitoVerificador(cnpj, new int[]{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        return cnpj.charAt(12) - '0' == d1 && cnpj.charAt(13) - '0' == d2;
    }

    @Override
    public String toString() {
        return nome + (ehPessoaJuridica() ? " - CNPJ " : " - CPF ") + documento;
    }
}
