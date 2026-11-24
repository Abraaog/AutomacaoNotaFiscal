package emiteja.teste;

import java.util.ArrayList;
import java.util.List;

/**
 * Base de todos os testes do EmiteJá, sem biblioteca externa.
 * Cada suíte herda desta classe e implementa executar(), chamando teste(...)
 * para cada caso. A classe conta aprovados e falhas e imprime o resultado.
 */
public abstract class SuiteDeTeste {

    private static final double TOLERANCIA = 0.001;

    private int aprovados;
    private final List<String> falhas = new ArrayList<>();

    public abstract String getNome();

    protected abstract void executar();

    public final void rodar() {
        System.out.println(getNome());
        executar();
    }

    protected void teste(String descricao, Runnable corpo) {
        try {
            corpo.run();
            aprovados++;
            System.out.println("  ok      " + descricao);
        } catch (AssertionError | RuntimeException erro) {
            falhas.add(getNome() + " > " + descricao + ": " + erro.getMessage());
            System.out.println("  FALHOU  " + descricao + " -> " + erro.getMessage());
        }
    }

    protected static void verificarIgual(Object esperado, Object obtido) {
        if (esperado == null ? obtido != null : !esperado.equals(obtido)) {
            throw new AssertionError("esperado <" + esperado + "> mas veio <" + obtido + ">");
        }
    }

    protected static void verificarIgual(double esperado, double obtido) {
        if (Math.abs(esperado - obtido) > TOLERANCIA) {
            throw new AssertionError("esperado <" + esperado + "> mas veio <" + obtido + ">");
        }
    }

    protected static void verificar(boolean condicao, String mensagem) {
        if (!condicao) {
            throw new AssertionError(mensagem);
        }
    }

    protected static void verificarErro(Class<? extends RuntimeException> tipo, Runnable acao) {
        try {
            acao.run();
        } catch (RuntimeException erro) {
            if (tipo.isInstance(erro)) {
                return;
            }
            throw new AssertionError("esperado " + tipo.getSimpleName() + " mas veio "
                    + erro.getClass().getSimpleName() + ": " + erro.getMessage());
        }
        throw new AssertionError("esperado " + tipo.getSimpleName() + ", mas nenhum erro aconteceu");
    }

    public int getAprovados() {
        return aprovados;
    }

    public List<String> getFalhas() {
        return List.copyOf(falhas);
    }
}
