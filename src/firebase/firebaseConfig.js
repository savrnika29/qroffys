
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCxfFs9DU2pFMWSh8VftZkeGHFltd5BDqI",
  authDomain: "qroffy-77b23.firebaseapp.com",
  projectId: "qroffy-77b23",
  storageBucket: "qroffy-77b23.firebasestorage.app",
  messagingSenderId: "902415119788",
  appId: "1:902415119788:web:4be147d95f48a0234b7609",
  measurementId: "G-4H0NMH8692",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
