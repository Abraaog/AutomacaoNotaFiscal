package emiteja;

public class Moto {

    private final String chassi;
    private final String marca;
    private final String modelo;
    private final int cilindrada;
    private final int ano;
    private String cor;
    private double preco;
    private String situacao;

    public Moto(String chassi, String marca, String modelo, int cilindrada, int ano, String cor, double preco) {
        if (cilindrada <= 0) {
            throw new IllegalArgumentException("A cilindrada deve ser maior que zero");
        }
        this.chassi = chassi;
        this.marca = marca;
        this.modelo = modelo;
        this.cilindrada = cilindrada;
        this.ano = ano;
        this.situacao = "Disponível";

        setCor(cor);
        setPreco(preco);
    }

    public String getChassi() {
        return chassi;
    }

    public String getMarca() {
        return marca;
    }

    public String getModelo() {
        return modelo;
    }

    public int getCilindrada() {
        return cilindrada;
    }

    public int getAno() {
        return ano;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        if (cor == null || cor.isBlank()) {
            throw new IllegalArgumentException("Informe a cor da moto");
        }
        this.cor = cor;
    }

    public double getPreco() {
        return preco;
    }

    public void setPreco(double preco) {
        if (preco <= 0) {
            throw new IllegalArgumentException("O preço deve ser maior que zero");
        }
        this.preco = preco;
    }

    public String getSituacao() {
        return situacao;
    }

    @Override
    public String toString() {
        return marca + " " + modelo + " " + cilindrada + "cc " + ano + " (" + cor + ") - chassi " + chassi
                + String.format(" - R$ %.2f", preco) + " - " + situacao;
    }
}
