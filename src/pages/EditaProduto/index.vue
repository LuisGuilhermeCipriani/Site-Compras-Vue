<template>
  <div id="edita_produto">
    <Header :key="componentKey" class="header"></Header>
    <div class="content">
      <form>
        <div class="nomes">
          <input class="input" :style="{ width: '15%', border: 'solid', borderColor: '#1aa3ff', borderWidth: '4px' }"
            placeholder="Nome do produto" type="text" v-model="nome" ref="inputField" name="nome">
          <input class="input" :style="{ width: '8%', border: 'solid', borderColor: '#1aa3ff', borderWidth: '4px' }"
            placeholder="Fabricante" type="text" v-model="fabricante" name="fabricante" />
        </div>
        <div class="valores">
          <div class="unidade">
            <input class="input" :style="{ width: '43%', border: 'solid', borderColor: '#b3b3b3', borderWidth: '4px' }"
              placeholder="Unidades" type="number" pattern="[0-9]+([,\.][0-9]+)?" min="0" step="any" name="unidades"
              v-model="unidades" />
            <select class="input" :style="{ width: '24%', border: 'solid', borderColor: '#b3b3b3', borderWidth: '4px' }"
              v-model="uniMedida" name="uniMedida">
              <option v-for="(opcao, index) in opcoes" :key="index" :value="opcao.value">{{ opcao.text }}</option>
            </select>
          </div>
          <div class="valor">
            <label>R$</label>
            <input class="input" :style="{ width: '46%', border: 'solid', borderColor: '#1aa3ff', borderWidth: '4px' }"
              placeholder="Valor" type="number" pattern="[0-9]+([,\.][0-9]+)?" min="0" step="any" name="valor"
              v-model="valor">
          </div>
        </div>
        <textarea placeholder="Digite a descrição do produto" type="text" v-model="descricao"
          :style="{ border: 'solid', borderColor: '#1aa3ff', borderWidth: '4px' }"></textarea>
        <div class="extras">
          <div class="extras2">
            <input class="input" :style="{ width: '49%', border: 'solid', borderColor: '#b3b3b3', borderWidth: '4px' }"
              placeholder="Telefone (SAC)" type="text" v-model="sac" name="sac" />
            <input class="input" :style="{ width: '49%', border: 'solid', borderColor: '#1aa3ff', borderWidth: '4px' }"
              placeholder="Tipo do produto" type="text" v-model="tipo" name="tipo" />
          </div>
          <textarea :style="{ width: '25%', border: 'solid', borderColor: '#b3b3b3', borderWidth: '4px', }"
            placeholder="Observações..." type="text" v-model="observacoes" name="observacoes"></textarea>
        </div>
        <text :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }">
          <text :style="{ fontSize: '30px', marginRight: '5px', color: '#737373' }">*</text>
          <text :style="{ color: '#595959' }">Campos obrigatórios em</text>
          <strong :style="{ color: '#3973ac', marginLeft: '5px' }">
            azul</strong>
        </text>

        <span class="atualizar" type="button" @click="confirmarAtualizacao">
          <svg-icon type="mdi" :path="mdiUpdate"></svg-icon>
          ATUALIZAR
        </span>

      </form>
    </div>
    
    <div v-if="exibirModal" class="modal">
      <div class="modal-content">
        <p>Deseja realmente atualizar o produto?</p>
        <div class="modal-buttons">
          <span @click="atualizar">Sim</span>
          <span @click="fecharModal">Não</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '../../components/Header/index.vue';
import firebase from '../../services/firebaseConnection';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiUpdate } from '@mdi/js';

export default {
  name: 'Edita_Produto_page',
  data() {
    return {
      nome: "",
      valor: "",
      descricao: "",
      fabricante: "",
      sac: "",
      tipo: "",
      incluso: "",
      observacoes: "",
      unidades: "",
      uniMedida: "",
      opcoes: [
        { value: 'Un', text: 'Unidade' },
        { value: 'Kg', text: 'Quilograma' },
        { value: 'L', text: 'Litro' },
      ],
      focoInicial: true,
      exibirModal: false,
      mdiUpdate,
    }
  },
  components: {
    Header,
    SvgIcon
  },
  props: [
    'id'
  ],
  async created() {
    await firebase.firestore().collection("produtos").doc(this.id).get()
      .then((item) => {
        this.nome = item.data().nome,
          this.valor = item.data().valor,
          this.descricao = item.data().descricao,
          this.fabricante = item.data().fabricante,
          this.sac = item.data().sac,
          this.tipo = item.data().tipo,
          this.incluso = item.data().incluso,
          this.observacoes = item.data().observacoes,
          this.unidades = item.data().unidades,
          this.uniMedida = item.data().uniMedida
      })

    setTimeout(() => {
      this.$refs.inputField.focus();
    }, 100);
  },
  mounted() {
    setTimeout(() => {
      this.$refs.inputField.focus();
    }, 100);
  },
  methods: {
    limpaCampos() {
      this.nome = "";
      this.valor = "";
      this.descricao = "";
      this.fabricante = "";
      this.sac = "";
      this.tipo = "";
      this.incluso = "";
      this.observacoes = "";
      this.unidades = 0;
      this.uniMedida = "";
      setTimeout(() => {
        this.$refs.inputField.focus();
      }, 100);
    },
    confirmarAtualizacao() {
      this.exibirModal = true;
    },
    fecharModal() {
      this.exibirModal = false;
    },
    async atualizar() {
      if (!this.nome || !this.valor || !this.descricao || !this.fabricante || !this.tipo) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      try {
        await firebase.firestore().collection('produtos').doc(this.id).update({
          nome: this.nome,
          valor: this.valor,
          descricao: this.descricao,
          fabricante: this.fabricante,
          sac: this.sac,
          tipo: this.tipo,
          incluso: this.nome + " " + this.fabricante + " " + this.unidades + " " + this.uniMedida,
          observacoes: this.observacoes,
          unidades: this.unidades,
          uniMedida: this.uniMedida
        })

        const carrinhosQuerySnapshot = await firebase.firestore().collection('carrinhos').where("produto", "==", this.id).get();

        carrinhosQuerySnapshot.forEach(async (docSnapshot) => {
          try {
            await docSnapshot.ref.update({
              nome: this.nome,
              valor: this.valor,
              descricao: this.descricao,
              fabricante: this.fabricante,
              sac: this.sac,
              tipo: this.tipo,
              incluso: this.nome + " " + this.fabricante + " " + this.unidades + " " + this.uniMedida,
              observacoes: this.observacoes,
              unidades: this.unidades,
              uniMedida: this.uniMedida
            });
            this.limpaCampos();
          } catch (error) {
            console.error("Erro ao atualizar produto");
            alert("Não foi possível atualizar o produto.");
          }
        });
        alert("Produto atualizado com sucesso!");
        this.limpaCampos();
      } catch (error) {
        console.error("Erro ao atualizar produto:");
        alert("Não foi possível atualizar o produto.");
      }

      this.fecharModal();
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

.content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.content form {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 120px;
}

.content textarea {
  width: 25%;
  border-radius: 5px;
  padding: 11px;
  margin: 10px 0px;
  margin-right: 3px;
  background-color: gray;
  color: #FFF;
  font-size: 18px;
}

.content textarea::placeholder {
  color: #cccccc !important;
}

.content textarea:focus,
input:focus,
select:focus {
  box-shadow: 0 0 0 0;
  border: 0 none;
  outline: 0;
}

.nomes {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex-direction: row;
}

.nomes textarea {
  border-radius: 5px;
  padding: 11px;
  margin: 10px 0px;
  margin-right: 3px;
  background-color: gray;
  color: #FFF;
  font-size: 18px;
}

.extras {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  flex-direction: row;
}

.extras textarea {
  border-radius: 5px;
  padding: 20px 10px;
  background-color: gray;
  color: #FFF;
  font-size: 18px;
  margin-right: 130px;
}

.extras2 {
  display: flex;
  align-items: end;
  justify-content: center;
  flex-direction: column;
  padding: 0px;
  width: 40%;
  margin-right: 10px;
}

.valores {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex-direction: row;
}

.unidade {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 280px;
  width: 20%;
}

.valor {
  display: flex;
  align-items: center;
  justify-content: left;
  width: 10%;
  margin-right: 300px;
}

.valor label {
  margin: 0px 10px;
}

.input {
  border-radius: 5px;
  padding: 10px;
  margin: 6px 0px;
  margin-right: 5px;
  background-color: gray;
  color: #FFF;
  font-size: 18px;
}

.input::placeholder {
  color: #cccccc !important;
}

.content button {
  width: 26.8%;
  padding: 10px;
  border-radius: 5px;
  color: #FFF;
  font-weight: bold;
  font-size: 15px;
  margin-top: 30px;
  margin-right: 3px;
  cursor: pointer;
  background-color: #4d4dff;
}

.content button:hover {
  opacity: 0.8;
  transition: all 0.3s;
  background-color: #002266;
}

.content button:active {
  background-color: #400080 !important;
}

.content a {
  color: #4d4dff;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 50px;
}

.content a:hover {
  color: blue
}

.content span {
  margin-top: 50px;
}

.atualizar {
  width: 25.5%;
  padding: 10px;
  border-radius: 5px;
  color: #FFF;
  font-weight: bold;
  margin-top: 20px;
  margin-right: 3px;
  cursor: pointer;
  background-color: #00b33c;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  font-size: 13px;
  display: flex;
}

.atualizar:hover {
  opacity: 0.8;
  transition: all 0.3s;
  background-color: #006622;
}

.atualizar:active {
  background-color: #400080 !important;
}

.atualizar svg {
  width: 15px;
  margin: 2px 0px;
  margin-right: 5px;
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
