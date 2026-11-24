package emiteja.teste;

import emiteja.modelo.Cliente;
import emiteja.modelo.Pessoa;
import emiteja.modelo.Usuario;

public class TestePessoas extends SuiteDeTeste {

    @Override
    public String getNome() {
        return "Pessoas (Cliente e Usuario herdam de Pessoa)";
    }

    @Override
    protected void executar() {
        teste("aceita CPF válido com ou sem pontuação e guarda só os dígitos", () -> {
            Cliente cliente = Dados.cliente();
            verificarIgual("52998224725", cliente.getDocumento());
            verificar(!cliente.ehPessoaJuridica(), "CPF não é pessoa jurídica");
        });

        teste("aceita CNPJ válido e identifica pessoa jurídica", () -> {
            Cliente empresa = new Cliente("Moto Peças LTDA", Dados.CNPJ_VALIDO, "Av. Central, 500", "");
            verificar(empresa.ehPessoaJuridica(), "CNPJ deveria ser pessoa jurídica");
            verificarIgual("CNPJ 11222333000181", empresa.getIdentificacao());
        });

        teste("recusa CPF com dígito verificador errado", () ->
                verificarErro(IllegalArgumentException.class,
                        () -> new Cliente("Joana", "529.982.247-26", "", "")));

        teste("recusa CPF com todos os dígitos iguais", () ->
                verificarErro(IllegalArgumentException.class,
                        () -> new Cliente("Joana", "111.111.111-11", "", "")));

        teste("recusa nome em branco (validação na classe mãe Pessoa)", () ->
                verificarErro(IllegalArgumentException.class,
                        () -> new Usuario("  ", "marcos", "Vendedor")));

        teste("cada subclasse sobrescreve getIdentificacao (polimorfismo)", () -> {
            Pessoa[] pessoas = {Dados.cliente(), Dados.vendedor()};
            verificarIgual("CPF 52998224725", pessoas[0].getIdentificacao());
            verificarIgual("Vendedor (marcos)", pessoas[1].getIdentificacao());
        });

        teste("só o perfil Gerente pode cancelar", () -> {
            verificar(Dados.gerente().podeCancelar(), "gerente deveria poder cancelar");
            verificar(!Dados.vendedor().podeCancelar(), "vendedor não deveria poder cancelar");
        });
    }
}
