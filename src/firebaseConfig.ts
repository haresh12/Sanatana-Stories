import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC7bNfYHXLYnMK8oMKlsCUrq0nrCpcfzWA",
    authDomain: "sanatan-stories-c19c9.firebaseapp.com",
    projectId: "sanatan-stories-c19c9",
    storageBucket: "sanatan-stories-c19c9.appspot.com",
    messagingSenderId: "677566200219",
    appId: "1:677566200219:web:291928affd457b17ec093e",
    measurementId: "G-YX560DHSGB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
