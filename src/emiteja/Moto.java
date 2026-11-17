package emiteja;

public class Moto {

    String chassi;
    String marca;
    String modelo;
    int cilindrada;
    int ano;
    String cor;
    double preco;
    String situacao;

    public Moto(String chassi, String marca, String modelo, int cilindrada, int ano, String cor, double preco) {
        this.chassi = chassi;
        this.marca = marca;
        this.modelo = modelo;
        this.cilindrada = cilindrada;
        this.ano = ano;
        this.cor = cor;
        this.preco = preco;
        this.situacao = "Disponível";
    }
}
