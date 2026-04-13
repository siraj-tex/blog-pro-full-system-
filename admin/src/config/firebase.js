import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCul-xD8g_GuJWJpboby5b7mmBQTfjJnVo",
  authDomain: "blog-pro-bbcad.firebaseapp.com",
  projectId: "blog-pro-bbcad",
  storageBucket: "blog-pro-bbcad.firebasestorage.app",
  messagingSenderId: "385570296445",
  appId: "1:385570296445:web:a240e2c130f53020721714",
  measurementId: "G-B5V9FZ7CJS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
