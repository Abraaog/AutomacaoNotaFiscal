package emiteja.observer;

import emiteja.modelo.DocumentoFiscal;

/**
 * Observer: quem quer saber quando um documento fiscal muda de estado
 * se cadastra na Loja e recebe o aviso.
 */
public interface ObservadorDocumento {

    void documentoAtualizado(DocumentoFiscal documento);
}
