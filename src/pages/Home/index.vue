<template>
  <div id="home">
    <Header :key="componentKey" class="header"></Header>
    <div class="content">
      <h2 v-if="$data.produtos && $data.produtos.length === 0" :style="{ marginTop: '40px' }">
        Não há produtos cadastrados
      </h2>
      <table v-else class="tabela">
        <tr v-for="produto in produtos" :key="produto.id">
          <td>
            <strong class="limitaCaracteres">{{ produto.nome }} {{ produto.unidades }}{{ produto.uniMedida }}.</strong>
            <p class="limitaCaracteres">Fabricante: {{ produto.fabricante }}</p>
            <h2 class="limitaCaracteres">R$: {{ (produto.valor).toFixed(2) }}</h2>
            <div class="infos">
              <svg-icon type="mdi" :path="mdiInformationOutline"></svg-icon>
              <router-link :to="`/produto/${produto.id}`">
                Informações do produto
              </router-link>
            </div>

            <span class="adicionar" @click="adicionar(produto)">
              <svg-icon type="mdi" :path="mdiCartOutline"></svg-icon>
              ADICIONAR
            </span>
            <div class="botoes">
              <span class="editar" @click="editar(produto)">
                <svg-icon type="mdi" :path="mdiPencil"></svg-icon>
                EDITAR
              </span>

              <span class="excluir" @click="confirmarExclusao(produto)">
                <svg-icon type="mdi" :path="mdiDelete"></svg-icon>
                EXCLUIR
              </span>
            </div>
          </td>
          <div v-if="exibirModal" class="modal">
            <div class="modal-content">
              <p>Deseja realmente excluir o produto?</p>
              <div class="modal-buttons">
                <span @click="excluir(item)">Sim</span>
                <span @click="fecharModal">Não</span>
              </div>
            </div>
          </div>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Header from '../../components/Header/index.vue';
import firebase from '../../services/firebaseConnection';

import SvgIcon from '@jamescoyle/vue-icon';
import { mdiInformationOutline, mdiCartOutline, mdiPencil, mdiDelete } from '@mdi/js';

export default {
  name: 'Home_page',
  data() {
    return {
      produtos: [],
      item: {},
      carrinho: [],
      mdiInformationOutline,
      mdiCartOutline,
      mdiPencil,
      mdiDelete,
      componentKey: 0,
      exibirModal: false,
    }
  },
  components: {
    Header,
    SvgIcon
  },
  created() {

    const response = firebase.firestore().collection('produtos')
      .onSnapshot((doc) => {
        this.produtos = [];

        doc.forEach((item) => {
          this.produtos.push({
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
          })
        })
      })
    this.produtos = response.data;
  },
  methods: {
    confirmarExclusao(produto) {
      this.exibirModal = true;
      this.item = produto;
    },
    fecharModal() {
      this.exibirModal = false;
    },
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
          quantidade: item.data().quantidade,
          fabricante: item.data().fabricante,
          sac: item.data().sac,
          tipo: item.data().tipo,
          incluso: item.data().incluso,
          observacoes: item.data().observacoes,
          unidades: item.data().unidades,
          uniMedida: item.data().uniMedida
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
          quantidade: 1,
          fabricante: produto.fabricante,
          sac: produto.sac,
          tipo: produto.tipo,
          incluso: produto.incluso,
          observacoes: produto.observacoes,
          unidades: produto.unidades,
          uniMedida: produto.uniMedida
        })
          .then(() => {
            this.forceRerender();
          })
          .catch((error) => {
            console.error("Erro ao adicionar ao carrinho:", error);
          });
      }
    },

    async editar(produto) {
      this.$router.push(`/editaProduto/${produto.id}`);
    },

    async excluir(produto) {
      const carrinho = await firebase.firestore().collection("carrinhos").where("produto", "==", produto.id).get();
      await firebase.firestore().collection("produtos").doc(produto.id).delete()
        .then(() => {
          if (!carrinho.empty) {
            carrinho.forEach((doc) => {
              const id = doc.id;

              firebase.firestore().collection("carrinhos").doc(id).delete()
                .then(() => {
                  console.log("Item excluído com sucesso!");
                  this.forceRerender();
                })
                .catch((error) => {
                  console.error("Erro ao excluir item:", error);
                });
            });
          }
        })
        .catch(() => {
          console.log("Não foi possível excluir o produto");
        })

      this.fecharModal();
    },

    forceRerender() {
      this.componentKey += 1
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

.content {
  display: flex;
  align-items: center;
  padding: 0px 100px;
}

.tabela {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  border-radius: 5px;
  margin-top: 70px;
  align-items: center;
}

.tabela tr {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tabela td {
  width: 200px;
  text-align: center;
  margin: 10px;
  padding: 0px 20px;
  padding-top: 30px;
  border-width: 1px;
  border-style: solid;
  border-color: #0059b3;
  border-radius: 3px;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.tabela svg {
  width: 15px;
  margin: 2px 0px;
  margin-right: 5px;
}

.limitaCaracteres {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.adicionar {
  width: 50%;
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

.botoes {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  width: 100%;
  font-size: 13px;
  padding: 1px 10px;
}

.editar {
  width: 50%;
  padding: 10px 23.88px;
  border-bottom-left-radius: 2px;
  color: #FFF;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: -1px;
  margin-left: -1px;
  cursor: pointer;
  background-color: #339966;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  display: flex;
}

.editar:hover {
  opacity: 0.8;
  transition: all 0.3s;
  background-color: #004d00;
}

.editar:active {
  background-color: #400080 !important;
}

.excluir {
  width: 50%;
  padding: 10px 23.88px;
  border-bottom-right-radius: 2px;
  color: #FFF;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: -1px;
  margin-right: -1px;
  cursor: pointer;
  background-color: #bf4040;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  display: flex;
}

.excluir:hover {
  opacity: 0.8;
  transition: all 0.3s;
  background-color: #800000;
}

.excluir:active {
  background-color: #400080 !important;
}

.infos {
  flex-direction: row;
  display: flex;
  align-items: center;
  justify-content: center;
}

.infos svg {
  width: 20px;
  color: #00264d;
  margin-right: -2px;
  cursor: auto;
}

.infos a {
  font-size: 15px;
  margin: 0px 5px;
  color: #00264d;
  cursor: pointer;
}

.infos a:hover {
  color: #0059b3;
  transition: all 0.5s;
}

.infos a:active {
  color: blueviolet !important;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
}

.modal-content {
  background-color: #FFF;
  padding: 30px;
  border-radius: 5px;
}

.modal p {
  margin: 0;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-buttons span {
  padding: 8px 20px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #535260;
  color: #FFF;
  margin-top: 10px;
}

.modal-buttons span:hover {
  opacity: 0.8;
}
</style>