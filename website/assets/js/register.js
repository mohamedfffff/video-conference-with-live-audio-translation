// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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


const registerSubmit = document.getElementById('register-submit');
registerSubmit.addEventListener("click",function(event){
    event.preventDefault()
    const registerEmail = document.getElementById('register-email').value;
    const registerPassword = document.getElementById('register-password').value;
    const registerName = document.getElementById('register-name').value;

createUserWithEmailAndPassword(auth, registerEmail, registerPassword)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    window.location.href = '/';
    alert("register")
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
    // ..
  });
})