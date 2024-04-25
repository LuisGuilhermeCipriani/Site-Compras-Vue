<template>
    <div id="header">
        <span>Bem vindo(a) {{ nome }}!</span>
        <div class="right">
            <router-link to="/" :class="{ 'link-ativo': $route.path === '/' }">
                Home
            </router-link>
            <router-link to="/cadastraProduto" :class="{ 'link-ativo': $route.path === '/cadastraProduto' }">
                Cadastrar Produto
            </router-link>
            <router-link to="/comprasRealizadas" :class="{ 'link-ativo': $route.path === '/comprasRealizadas' }">
                Compras Realizadas
            </router-link>
            <text @click="sair">Sair</text>
            <div class="icones">
                <router-link to="/meusProdutos">
                    <article class="contador" v-if="status">{{ tamanho }}</article>
                    <svg-icon type="mdi" :path="mdiCartOutline" class="icone"></svg-icon>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from '../../services/firebaseConnection';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCartOutline } from '@mdi/js';

export default {
    name: 'Header_component',
    components: {
        SvgIcon
    },
    data() {
        return {
            mdiCartOutline,
            status: false,
            usuario: {},
            nome: "",
            contador: [],
            tamanho: 0,
        }
    },
    async created() {
        const user = firebase.auth().currentUser;
        if (user) {
            await firebase.firestore().collection("users").doc(user.uid).get()
                .then(function (item) {
                    this.nome = item.data().nome;
                }.bind(this))
                .catch((error) => {
                    console.error("Erro ao obter dados do usuário:", error);
                });
        } else {
            console.error("Usuário não autenticado.");
        }

        const response = await firebase.firestore().collection("carrinhos").where("usuario", "==", user.uid).get();

        this.contador = [];

        response.forEach((item) => {
            this.contador.push({
                quantidade: item.data().quantidade
            });
        });

        this.contador.forEach((item) => {
            this.tamanho = this.tamanho + item.quantidade;
        });

        this.status = this.tamanho ? true : false;
    },
    methods: {
        async sair() {
            await firebase.auth().signOut()
                .then(() => {
                    this.$router.push('/login');
                })
                .catch(() => {
                    alert("Não foi possível sair");
                })
        }
    }
}
</script>

<style scoped>
#header {
    background: linear-gradient(rgba(5, 4, 78, 0.5), transparent);
    background-color: #5c85d6;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    padding: 20px 0px;
}

#header span {
    margin-left: 20px;
    font-size: 20px;
    font-weight: bold;
    color: #FFF;
}

.right {
    flex-direction: row;
    margin-right: 20px;
    align-items: center;
    justify-content: space-between;
    display: flex;
}

.right a {
    margin-left: 20px;
    color: #FFF;
    text-decoration: none;
}

.right a:hover {
    color: #000;
    transition: all 0.3s;
}

.right a:active {
    color: #d9d9d9;
}

.right text {
    margin-left: 50px;
    margin-right: 30px;
    color: #FFF;
    text-decoration: none;
    font-weight: normal;
    cursor: pointer;
}

.right text:hover {
    color: #000;
    transition: all 0.3s;
}

.right text:active {
    color: #d9d9d9;
}

.icone {
    color: #FFF;
    margin-left: 20px;
    cursor: pointer;
}

.icone:active {
    color: #d9d9d9;
}

.icones {
    flex-direction: row;
    display: flex;
}

.icones svg:hover {
    color: #000;
    transition: all 0.3s;
}

.icones svg:active {
    color: #d9d9d9;
}

.contador {
    margin-right: -25px;
    background-color: red;
    padding: 5px;
    border-radius: 800px;
    position: absolute;
    width: 15px;
    height: 15px;
    text-align: center;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    margin-bottom: 50px;
    font-weight: bold;
}

.link-ativo {
    color: #c2d1f0 !important;
}
</style>