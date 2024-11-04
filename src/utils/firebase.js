// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyA4sO1jtQ2YluKlUj-FpT-bchjdnxaU1Wk",
//   authDomain: "swalook-invoices.firebaseapp.com",
//   projectId: "swalook-invoices",
//   storageBucket: "swalook-invoices.appspot.com",
//   messagingSenderId: "272963161110",
//   appId: "1:272963161110:web:36faf47fc39a8bd63ab937",
//   measurementId: "G-3PB67ZWFHZ"
// };

const firebaseConfig = {
  apiKey: "AIzaSyA4sO1jtQ2YluKlUj-FpT-bchjdnxaU1Wk",
  authDomain: "swalook-invoices.firebaseapp.com",
  projectId: "swalook-invoices",
  storageBucket: "swalook-invoices.appspot.com",
  messagingSenderId: "272963161110",
  appId: "1:272963161110:web:36faf47fc39a8bd63ab937",
  measurementId: "G-3PB67ZWFHZ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { storage };

