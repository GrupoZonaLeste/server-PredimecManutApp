class RelatorioController {
    constructor(dados) {
        this.dados = dados
    }

    gerarRelatorio() {
        return `
            <div id="content">
                ${this.gerarCapa()}
                ${this.gerarIndice()}
                ${this.dados.equipamentos.forEach(element => this.gerarEquipamento(element))}
                ${this.gerarConclusao()}
            </div>
        `
    }
    gerarCapa() {
        return `
            <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; height: 900px;">
            <img src="https://www.predimec.com.br/imagens/logo.png" style="width: 40%;" />
            <h1 style="text-align: center; background-color: orange; border: 1px solid; font-size: 40px; width: 100%; color: white;">
                Relatório de manutenção <br>${this.dados.cliente}</h1>
            <h1 style="text-align: center; background-color: orange; border: 1px solid; width: max-content; color: white; padding: 5px;">
                ${this.dados.data}</h1>
                <span class="html2pdf__page-break"></span>
            </div>
        `
    }
    gerarIndice() { 
        gerarCabecalho()
    }
    gerarConclusao() {
        return `
            ${gerarCabecalho()}
            <div>
            <h1>Conclusão</h1>
            <p>${this.dados.conclusao}</p>
            </div>
            `
        }
        gerarEquipamento(dadosEquipamento) {
            return `
                ${gerarCabecalho()}
                <div>
                    <h1>${dadosEquipamento.nome}</h1>
                    <p>${dadosEquipamento.descricao}</p>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                        <div style="display: flex; justify-content: center;">
                            <img src="${dadosEquipamento.foto[0]}" style="width: 50%; border: 2px solid rgb(233, 124, 22);" />
                        </div>
                        <p style="margin: 0px; font-style: italic;">${dadosEquipamento.foto[1]}</p>
                    </div>
                    <div>
                    ${dadosEquipamento.trocas.length > 0 ? 
                        `<p>Trocas efetuadas nesse equipamento:</p>
                            <ul>
                                ${dadosEquipamento.trocas.forEach(element => {
                                    `<li>${element}</li>`    
                                })}
                            </ul>
                        ` 
                    : ""}
                    </div>
                    <span class="html2pdf__page-break"></span>
                </div>
            `
    }

    gerarCabecalho(){
        return `
            <header id="headerContent">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                     <img src="https://www.predimec.com.br/imagens/logo.png" style="width: 10%;" />
                    <h1 style="text-align: right;">Relatório de manutenção <br>${this.cliente}</h1>
                </div>
                <hr>
            </header>
        `
    }
}

export default RelatorioController