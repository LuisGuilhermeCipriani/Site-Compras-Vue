import { createApp } from 'vue'
import App from './App.vue'
import router from './rotas';

import firebase from './services/firebaseConnection';

let app
firebase.auth().onAuthStateChanged(() => {
    if(!app){
        app = createApp(App).use(router).mount('#app');
    }
})
