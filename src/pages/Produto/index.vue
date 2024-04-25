<template>
  <div id="produto">
    <Header :key="componentKey" class="header"></Header>
    <div class="container">

      <div v-if="!existente" :style="{ marginTop: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
        <svg-icon type="mdi" :path="mdiEmoticonCryOutline" style="width:30px; height:30px"></svg-icon>
        <h2 :style="{marginLeft: '10px'}">Informações do produto não disponíveis.</h2>
      </div>
    
      <div v-else class="infos">
        <table>
          <tbody>
            <div class="scroll-view">
              <tr>
                <td><span>{{ produto.nome }} 1Kg</span></td>
              </tr>
              <tr class="escuro1">
                <td><span>Fabricante: {{ produto.fabricante }}</span></td>
              </tr>
              <tr>
                <td><span>Valor: R$ {{ parseFloat(produto.valor).toFixed(2) }}</span></td>
              </tr>
              <tr class="escuro2">
                <td>
                  <h3>Descrição do produto</h3>
                </td>
              </tr>
              <tr>
                <td><span>{{ produto.descricao }}</span></td>
              </tr>
              <tr class="escuro2">
                <td>
                  <h3>Especificações técnicas</h3>
                </td>
              </tr>
              <tr>
                <td><span>Categoria: {{ produto.tipo }}</span></td>
              </tr>
              <tr class="escuro1">
                <td><span>SAC do fornecedor: {{ produto.sac !== '' ? produto.sac : 'Número não informado' }}</span></td>
              </tr>
              <tr>
                <td><span>Ítens inclusos: {{ produto.incluso }}.</span></td>
              </tr>
              <tr class="escuro1">
                <td><span>Observações: {{ produto.observacoes !== '' ? produto.observacoes :
                  'Nenhuma observação informada' }}</span></td>
              </tr>
            </div>
          </tbody>
        </table>
      </div>

      <span v-if="existente" class="adicionar" @click="adicionar(produto)">
        <svg-icon type="mdi" :path="mdiCartOutline"></svg-icon>
        ADICIONAR
      </span>
    </div>
  </div>
</template>

<script>
import Header from '../../components/Header/index.vue';
import firebase from '../../services/firebaseConnection';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCartOutline, mdiEmoticonCryOutline  } from '@mdi/js';

export default {
  name: 'Produto_page',
  data() {
    return {
      produto: {},
      mdiCartOutline,
      mdiEmoticonCryOutline ,
      componentKey: 0,
      existente: true
    }
  },
  components: {
    Header,
    SvgIcon
  },
  props: ["id"],
  async created() {
    await firebase.firestore().collection("produtos").doc(this.id).get()
      .then((item) => {
        this.produto = {
          id: item.id,
          nome: item.data().nome,
          valor: item.data().valor,
          descricao: item.data().descricao,
          fabricante: item.data().fabricante,
          sac: item.data().sac,
          tipo: item.data().tipo,
          incluso: item.data().incluso,
          observacoes: item.data().observacoes,
          unidades: item.data().unidades,
          uniMedida: item.data().uniMedida
        }
      })
      .catch(() => {
        this.existente = false;
        console.log("Erro ao buscar produto");
      })
  },
  methods: {
    async adicionar(produto) {

      const user = firebase.auth().currentUser;
      const response = await firebase.firestore().collection("carrinhos").where("usuario", "==", user.uid).get();

      this.carrinho = [];

      response.forEach((item) => {
        this.carrinho.push({
          id: item.id,
          nome: item.data().nome,
          valor: item.data().valor,
          descricao: item.data().descricao,
          produto: item.data().produto,
          usuario: item.data().usuario,
          quantidade: item.data().quantidade
        });
      });

      const itemExistente = this.carrinho.find(item => item.produto === produto.id);

      if (itemExistente) {
        firebase.firestore().collection("carrinhos").doc(itemExistente.id).update({
          quantidade: itemExistente.quantidade + 1
        })
          .then(() => {
            this.forceRerender();
          })
          .catch((error) => {
            console.error("Erro ao atualizar o carrinho:", error);
          });
      } else {
        firebase.firestore().collection("carrinhos").add({
          id: produto.id,
          nome: produto.nome,
          valor: produto.valor,
          descricao: produto.descricao,
          produto: produto.id,
          usuario: user.uid,
          quantidade: 1
        })
          .then(() => {
            this.forceRerender();
          })
          .catch((error) => {
            console.error("Erro ao adicionar ao carrinho:", error);
          });
      }
    },

    forceRerender() {
      this.componentKey += 1
    }
  }
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
}

.infos {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 70px;
  width: 100%;
}

.infos strong {
  margin: 10px;
}

.infos span {
  margin: 5px 10px;
}

.infos table {
  border-collapse: collapse;
  width: 80%;
  border: 3px solid #dddddd;
  margin-top: 50px;
}

.infos td,
.infos th {
  padding: 15px;
}

.scroll-view {
  height: 450px;
  max-height: 450px;
  overflow-y: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.adicionar {
  width: 15%;
  padding: 8px 15px;
  border-radius: 5px;
  color: #FFF;
  font-weight: bold;
  margin-top: 20px;
  cursor: pointer;
  background-color: #4d4dff;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  font-size: 13px;
  display: flex;
}

.adicionar:hover {
  opacity: 0.8;
  transition: all 0.3s;
  background-color: #002266;
}

.adicionar:active {
  background-color: #400080 !important;
}

.adicionar svg {
  width: 15px;
  margin: 2px 0px;
  margin-right: 5px;
}

.escuro1 {
  background-color: #f2f2f2;
}

.escuro2 {
  background-color: #e6e6e6;
}

.escuro2 td {
  padding-top: 0px;
  padding-bottom: 0px;
}
</style>
