<template>
    <div id="compras_realizadas">
        <Header class="header"></Header>
        <div class="container">
            <h2 v-if="!compras || compras.length === 0" :style="{ marginTop: '150px' }">{{ mensagem }}</h2>
            <div v-else class="infos">

                <div class="botoesRadio">
                    <input type="radio" id="exibirTodas" value="todas" v-model="opcaoSelecionada" name="opcao">
                    <label for="exibirTodas">Exibir todas as compras</label>

                    <input type="radio" id="exibirMinhas" value="minhas" v-model="opcaoSelecionada" name="opcao">
                    <label for="exibirMinhas">Exibir minhas compras</label>
                </div>
                <table v-for="compra in compras" :key="compra.id">
                    <tbody>
                        <div class="scroll-view">
                            <tr class="escuro2">
                                <td>
                                    <h3>Informações da compra</h3>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span>
                                        Nome do comprador: {{ compra.usuario.nome }} {{ compra.usuario.sobrenome }}
                                    </span>
                                    <span>
                                        Data da compra: {{ compra.data }}, {{ compra.hora }}H.
                                    </span>
                                    <span>
                                        Valor total: R$ {{ compra.totalPagar }}
                                    </span>
                                </td>
                            </tr>
                            <tr class="escuro1">
                                <td><span>Itens adquiridos:</span></td>
                            </tr>
                            <tr class="item" v-for="produto in compra.produtos" :key="produto.id">
                                <td>
                                    <span :style="{ marginLeft: '20px' }">
                                        {{ produto.incluso }}. <span v-if=" produto.quantidade > 1 ">({{ produto.quantidade }} itens)</span>
                                    </span>
                                    <router-link :to="`/produto/${produto.id}`">
                                        <text>Informações do produto</text>
                                    </router-link>
                                </td>
                            </tr>
                        </div>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '../../components/Header/index.vue';
import firebase from '../../services/firebaseConnection';

export default {
    name: "Compras_realizadas",
    data() {
        return {
            compras: [],
            opcaoSelecionada: 'todas',
            mensagem: '',
        }
    },
    components: {
        Header,
    },
    created() {
        this.preencherCompras();
    },
    watch: {
        opcaoSelecionada: function () {
            this.preencherCompras();
        }
    },
    methods: {
        async preencherCompras() {
            try {
                if (this.opcaoSelecionada === 'minhas') {
                    this.mensagem = 'Você não realizou nenhuma compra';
                    await this.preencheComprasUsuario();
                } else {
                    this.mensagem = 'Não há compras realizadas';
                    await this.preencheComprasTotal();
                }
            } catch (error) {
                console.error("Erro ao preencher compras: ", error);
            }
        },
        async preencheComprasUsuario() {
            try {
                const usuario = firebase.auth().currentUser;
                const response = await firebase.firestore().collection('compras').where('usuario.id', '==', usuario.uid).get();
                this.compras = [];

                response.forEach((item) => {
                    this.compras.push({
                        id: item.id,
                        data: item.data().data,
                        hora: item.data().hora,
                        totalPagar: item.data().totalPagar,
                        usuario: item.data().usuario,
                        produtos: item.data().produtos,
                    });
                });
            } catch (error) {
                console.error("Erro ao preencher compras: ", error);
            }
        },
        async preencheComprasTotal() {
            try {

                const response = await firebase.firestore().collection('compras').get();
                this.compras = [];

                response.forEach((item) => {
                    this.compras.push({
                        id: item.id,
                        data: item.data().data,
                        hora: item.data().hora,
                        totalPagar: item.data().totalPagar,
                        usuario: item.data().usuario,
                        produtos: item.data().produtos,
                    });
                });
            } catch (error) {
                console.error("Erro ao preencher compras: ", error);
            }
        }
    },
}
</script>

<style scoped>
.header {
    position: fixed;
    width: 100%;
    z-index: 999;
}

.container {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 20px 0px;
}

.infos {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-top: 50px;
    width: 100%;
}

.infos strong {
    margin: 5px;
}

.infos span {
    margin: 5px 10px;
}

.infos table {
    border-collapse: collapse;
    width: 80%;
    border: 3px solid #dddddd;
    margin-top: 20px;
}

.infos td,
.infos th {
    padding: 10px;
}

.botoesRadio {
    display: flex;
    align-items: center;
    justify-content: right;
    width: 80%;
    margin-top: 20px;
}

.botoesRadio input {
    margin-bottom: 3px;
}

.botoesRadio label {
    margin-right: 10px;
}

.scroll-view {
    height: 260px;
    max-height: 450px;
    overflow-y: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-bottom: 5px;
}

.scroll-view td {
    display: flex;
    flex-direction: column;
}

.item td {
    flex-direction: row;
    display: flex;
    align-items: center;
}

.item a {
    font-size: 15px;
    margin: 0px 5px;
    color: #00264d;
    cursor: pointer;
}

.item a:hover {
    color: #0059b3;
    transition: all 0.5s;
}

.item a:active {
    color: blueviolet !important;
}

.item span {
    margin: -5px 0px;
}

.item text {
    margin-left: 10px;
}

.escuro1 {
    background-color: #f2f2f2;
    margin-bottom: 10px;
}

.escuro2 {
    background-color: #e6e6e6;
}

.escuro2 td {
    padding-top: 0px;
    padding-bottom: 0px;
}
</style>