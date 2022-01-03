// Import the functions you need from the SDKs you need
const { initializeApp } =  require("firebase/app");
const firebaseConfig = require("./src/firebaseConfig.json");
const { getFirestore, doc, setDoc} = require("firebase/firestore");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Firestore
const db = getFirestore(app);


/* FIRESTORE */


async function writeFirebaseDoc(collection, docName, data) {
    let docRef = doc(db, collection, docName);
    return await setDoc(docRef, data);
}


module.exports = {  writeFirebaseDoc };
