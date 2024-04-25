<template>
  <div id="meus_produtos">
    <Header :key="componentKey" class="header"></Header>
    <div class="container">
      <h2>Meus Produtos</h2>
      <div class="content">
        <div class="scroll-view">
          <h3 v-if="!produtos || produtos.length === 0" :style="{ marginTop: '40px' }">Não há produtos no carrinho.</h3>
          <div v-else class="contentScroll" v-for="produto in produtos" :key="produto.id">
            <span class="limitaCaracteres">{{ produto.incluso }}.</span>
            <div class="qtd">
              <span>Qtd: </span>
              <input v-model="produto.quantidade" disabled />
              <svg-icon v-if="produto.quantidade" type="mdi" :path="mdiMinus" @click="diminui(produto)"
                style="background-color: cornflowerblue"></svg-icon>
              <svg-icon v-else type="mdi" :path="mdiTrashCan" class="icone" @click="exclui(produto)"
                style="background-color: crimson"></svg-icon>
              <svg-icon type="mdi" :path="mdiPlus" @click="aumenta(produto)"
                style="background-color: cornflowerblue"></svg-icon>
            </div>
            <span class="valorProduto">Valor unitário: R$ {{ (produto.valor).toFixed(2) }}</span>
            <div class="infos">
              <svg-icon type="mdi" :path="mdiInformationOutline"></svg-icon>
              <router-link :to="`/produto/${produto.id}`">
                Informações do produto
              </router-link>
            </div>
            <h4>Total do produto: <p>R$ {{ (produto.valor * produto.quantidade).toFixed(2) }}</p>
            </h4>
          </div>
        </div>
        <strong v-if="produtos && produtos.length > 0">Total a pagar:
          <span class="total">R$ {{ total.toFixed(2) }}</span>
        </strong>
        <span v-if="produtos && produtos.length > 0" class="botao" @click="finalizarCompra">FINALIZAR COMPRA</span>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '../../components/Header/index.vue';
import firebase from '../../services/firebaseConnection';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMinus, mdiPlus, mdiTrashCan, mdiInformationOutline } from '@mdi/js';
import { format } from 'date-fns';

export default {
  name: 'Meus_Produtos_page',
  data() {
    return {
      produtos: [],
      carrinho: [],
      user: {},
      mdiMinus,
      mdiPlus,
      mdiTrashCan,
      mdiInformationOutline,
      vazio: true,
      componentKey: 0,
      total: 0,
    }
  },
  components: {
    Header,
    SvgIcon,
  },
  watch: {
    produtos() {
      try {
        let tamanho = this.produtos.length;
        this.vazio = (tamanho === 0 ? true : false);
      }
      catch (error) {
        //
      }
    },
  },
  mounted() {
    this.carregaDados();
  },
  methods: {
    async preencheProdutos() {
      const usuario = firebase.auth().currentUser;

      const response = await firebase.firestore().collection('carrinhos').where('usuario', '==', usuario.uid).get();
      this.produtos = [];

      response.forEach((item) => {
        this.produtos.push({
          id: item.data().produto,
          nome: item.data().nome,
          valor: item.data().valor,
          descricao: item.data().descricao,
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
    },

    async preencheTotal() {
      try {
        const user = firebase.auth().currentUser;
        this.total = 0;

        const response = firebase.firestore().collection("carrinhos").where("usuario", "==", user.uid);
        await response.get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              this.total += (doc.data().valor * doc.data().quantidade);
            });
          })
      }
      catch (error) {
        console.log(error);
      }
    },

    async carregaDados() {
      await this.preencheProdutos();
      await this.preencheTotal();
    },

    async diminui(produto) {
      if (produto.quantidade !== 0) {
        await firebase.firestore().collection("carrinhos").where("produto", "==", produto.id).get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const quantidadeAtual = doc.data().quantidade;
              if (quantidadeAtual > 0) {
                doc.ref.update({
                  quantidade: quantidadeAtual - 1
                }).then(() => {
                  this.preencheProdutos();
                  this.preencheTotal();
                  this.forceRerender();
                }).catch(error => {
                  console.error('Erro ao diminuir quantidade:', error);
                });
              }
            });
          })
          .catch(error => {
            console.error('Erro ao buscar documento:', error);
          });
      }
    },

    async aumenta(produto) {
      await firebase.firestore().collection("carrinhos").where("produto", "==", produto.id).get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const quantidadeAtual = doc.data().quantidade;
            doc.ref.update({
              quantidade: quantidadeAtual + 1
            }).then(() => {
              this.preencheProdutos();
              this.preencheTotal();
              this.forceRerender();
            }).catch(error => {
              console.error('Erro ao diminuir quantidade:', error);
            });
          });
        })
        .catch(error => {
          console.error('Erro ao buscar documento:', error);
        });
    },

    async exclui(produto) {
      try {
        const response = await firebase.firestore().collection('carrinhos').where("produto", "==", produto.id).get();

        response.forEach(async (doc) => {
          try {
            await doc.ref.delete();
          } catch (error) {
            console.error('Erro ao excluir documento:', error);
          }
        });

        const index = this.produtos.findIndex(p => p.id === produto.id);
        if (index !== -1) {
          this.produtos.splice(index, 1);
        }

        this.forceRerender();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    },

    async finalizarCompra() {
      const dataAtual = format(new Date(), 'dd/MM/yyyy');
      const horaAtual = format(new Date(), 'HH:mm:ss');

      const usuario = firebase.auth().currentUser;

      try {
        const user = await firebase.firestore().collection('users').doc(usuario.uid).get();

        if (user.exists) {
          this.user = {
            id: user.id,
            nome: user.data().nome,
            sobrenome: user.data().sobrenome
          };
        } else {
          console.log("Documento não encontrado.");
        }

        await firebase.firestore().collection("compras").add({
          usuario: this.user,
          hora: horaAtual,
          data: dataAtual,
          produtos: this.produtos,
          totalPagar: this.total.toFixed(2)
        });

        const carrinho = await firebase.firestore().collection('carrinhos').where('usuario', '==', usuario.uid).get();

        const promises = carrinho.docs.map(async doc => {
          await doc.ref.delete();
        });

        await Promise.all(promises);
        console.log('Itens do carrinho excluídos com sucesso.');

        this.produtos = [];
        this.forceRerender();

        alert("Compra finalizada com sucesso!");
      } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        alert("Não foi possível finalizar a compra");
      }
    },

    forceRerender() {
      this.componentKey += 1;
    },
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

.container h2 {
  margin-top: 90px;
  margin-bottom: 10px;
}

.scroll-view {
  height: 450px;
  max-height: 450px;
  overflow-y: auto;
  width: 20%;
  align-items: center;
  justify-content: flex-start;
  display: flex;
  flex-direction: column;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.content strong {
  font-size: 18px;
  margin-top: 20px;
  margin-bottom: -15px;
}

.contentScroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-style: solid;
  border-color: #0059b3;
  border-radius: 3px;
  width: 210px;
  padding: 0px 30px;
  padding-top: 20px;
  text-align: center;
  margin: 5px;
}

.contentScroll h4 {
  margin-bottom: 0px;
}

.valorProduto {
  margin: 20px 0px;
}

.qtd {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.qtd input {
  width: 15%;
  height: 25px;
  border-radius: 2px;
  margin: 0px 10px;
  text-align: center;
  font-size: 15px;
}

.qtd svg {
  cursor: pointer;
  margin: 0px 5px;
  padding: 5px;
  border-radius: 5px;
}

.qtd svg:hover {
  transition: all 0.2s;
  opacity: 0.8;
  color: #000;
}

.qtd svg:active {
  background-color: blueviolet !important;
}

.total {
  border-bottom: 2px solid #000066;
  display: inline-block;
  font-size: 20px;
  color: #000066;
}

.botao {
  padding: 10px;
  border-radius: 5px;
  color: #FFF;
  font-weight: bold;
  font-size: 15px;
  margin-top: 30px;
  cursor: pointer;
  background-color: #4d4dff;
}

.botao:hover {
  opacity: 0.8;
  transition: all 0.3s;
  background-color: #002266;
}

.botao:active {
  background-color: #400080 !important;
}

.limitaCaracteres {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
</style>