import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAuEb4tza_2MS4144R5TZVK-ilmzNuD3ZU",
    authDomain: "invoice-app-33daa.firebaseapp.com",
    projectId: "invoice-app-33daa",
    storageBucket: "invoice-app-33daa.appspot.com",
    messagingSenderId: "600694323475",
    appId: "1:600694323475:web:b6e996d741f4f8999602e6"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp.firestore();