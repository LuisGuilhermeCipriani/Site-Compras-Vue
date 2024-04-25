import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import  'firebase/compat/firestore';

let firebaseConfig = {
    apiKey: "AIzaSyDemQICsQ-Sq3wsE0qm6PQlDTQzXUiy3V8",
    authDomain: "testes-dc53c.firebaseapp.com",
    projectId: "testes-dc53c",
    storageBucket: "testes-dc53c.appspot.com",
    messagingSenderId: "539292700874",
    appId: "1:539292700874:web:67748b8a37eab93d216433",
    measurementId: "G-Q1SS38GGJJ"
  };

  if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
  }

  export default firebase;