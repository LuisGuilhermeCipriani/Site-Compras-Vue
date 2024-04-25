import { createRouter, createWebHistory } from "vue-router";

import Login from './pages/Login/index.vue';
import Home from './pages/Home/index.vue';
import CadastraProduto from './pages/CadastraProduto/index.vue';
import ComprasRealizadas from './pages/ComprasRealizadas/index.vue';
import EditaProduto from './pages/EditaProduto/index.vue';
import MeusProdutos from './pages/MeusProdutos/index.vue';
import Produto from './pages/Produto/index.vue';
import Erro from './pages/Erro/index.vue';

import firebase from './services/firebaseConnection';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            component: Login
        },
        {
            path: '/',
            component: Home,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/cadastraProduto',
            component: CadastraProduto,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/comprasRealizadas',
            component: ComprasRealizadas,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/editaProduto/:id',
            component: EditaProduto,
            props: true,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/meusProdutos',
            component: MeusProdutos,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/produto/:id',
            component: Produto,
            props: true,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/:catchAll(.*)',
            component: Erro
        }
    ]
})

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth);

    if(requiresAuth && !firebase.auth().currentUser){
        next('/login');
    }else{
        next();
    }
})

export default router;