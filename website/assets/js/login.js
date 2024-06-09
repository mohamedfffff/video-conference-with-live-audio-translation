// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyB1agysKGkD4792SCP7TSXO4rKbCVi2Ads",
authDomain: "login-c6c89.firebaseapp.com",
projectId: "login-c6c89",
storageBucket: "login-c6c89.appspot.com",
messagingSenderId: "742179538648",
appId: "1:742179538648:web:6847defad3b723b71df9ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const loginSubmit = document.getElementById('login-submit');
loginSubmit.addEventListener("click",function(event){
    event.preventDefault()
    const loginEmail = document.getElementById('login-email').value;
    const loginPassword = document.getElementById('login-password').value;

signInWithEmailAndPassword(auth, loginEmail, loginPassword)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    window.location.href = '/';
    alert("login")
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
    // ..
  });
})