<template>
  <div id="login">
    <div class="content" v-if="logado">
      <form @submit.prevent="entrar">
        <input placeholder="Digite seu email" type="text" v-model="email" ref="inputField" />
        <input placeholder="Digite sua senha" type="password" v-model="senha" />
        <button type="submit" :style="{ backgroundColor: '#4d4dff' }">ENTRAR</button>
      </form>
      <span>Não possui uma conta? <a @click="mudaLogado">Crie uma aqui!</a></span>
    </div>

    <div class="content" v-else>
      <div v-once>{{ limpaCampos() }}</div>
      <form @submit.prevent="cadastrar">
        <input placeholder="Digite seu nome" type="text" v-model="nome" ref="inputField2" />
        <input placeholder="Digite seu sobrenome" type="text" v-model="sobrenome" />
        <input placeholder="Digite seu email" type="text" v-model="email" />
        <input placeholder="Digite sua senha" type="password" v-model="senha" />
        <button type="submit" :style="{ backgroundColor: '#ff4d4d' }">CADASTRAR</button>
      </form>
      <span>Já possui uma conta? <a @click="mudaLogado">Clique aqui!</a></span>
    </div>
  </div>
</template>

<script>
import firebase from '../../services/firebaseConnection';

export default {
  name: 'Login_page',
  data() {
    return {
      nome: '',
      sobrenome: '',
      email: '',
      senha: '',
      logado: true
    }
  },
  mounted() {
    setTimeout(() => {
      this.$refs.inputField.focus();
    }, 100);
  },
  watch: {
    logado() {
      if (this.logado) {
        setTimeout(() => {
          this.$refs.inputField.focus();
        }, 100);
      } else {
        setTimeout(() => {
          this.$refs.inputField2.focus();
        }, 100);
      }
    }
  },
  methods: {
    limpaCampos() {
      this.nome = '';
      this.sobrenome = '';
      this.email = '';
      this.senha = '';
    },
    mudaLogado() {
      this.logado = !this.logado;
    },
    async cadastrar() {
      try {
        const { user } = await firebase.auth().createUserWithEmailAndPassword(this.email, this.senha);
        const usuario = {
          id: user.uid,
          nome: this.nome,
          sobrenome: this.sobrenome,
          email: user.email,
          senha: user.senha
        };

        await firebase.firestore().collection('users').doc(user.uid).set({
          nome: this.nome,
          sobrenome: this.sobrenome
        })
          .then(() => {
            localStorage.setItem("usuario", JSON.stringify(usuario));
            this.$router.push('/');
          })
          .catch(() => {
            alert('Não foi possível cadastrar o usuário');
          })
      }
      catch (error) {
        alert("Por favor, preencha todos os campos corretamente");
      }
    },
    async entrar() {
      try {
        const { user } = await firebase.auth().signInWithEmailAndPassword(this.email, this.senha);
        await firebase.firestore().collection('users').doc(user.uid).get()
          .then(() => {
            this.$router.push('/');
          })
      }
      catch {
        if ((this.nome || this.senha) === '') {
          alert('Por favor, preencha todos os campos');
          return;
        }
        alert("Não foi possível realizar login. Verifique os dados informados");
      }
    }
  }
}
</script>

<style scoped>
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
  margin-top: 100px;
}

.content input {
  width: 25%;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  background-color: gray;
  color: #FFF;
  font-size: 20px;
  border-color: transparent;
}

.content input::placeholder {
  color: #cccccc !important;
}

.content button {
  width: 26.5%;
  padding: 10px;
  border-radius: 5px;
  color: #FFF;
  font-weight: bold;
  font-size: 15px;
  margin-top: 30px;
  cursor: pointer;
  border-color: transparent;
}

.content button:hover {
  opacity: 0.8;
  transition: all 0.3s;
  background-color: #000;
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
</style>