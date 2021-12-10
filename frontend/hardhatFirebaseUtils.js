// Import the functions you need from the SDKs you need
const { initializeApp } =  require("firebase/app");
const firebaseConfig = require("./src/firebaseConfig.json");
const { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs } = require("firebase/firestore");
const { getFunctions, httpsCallable } = require("firebase/functions");
const { getAuth, signInWithCustomToken } = require("firebase/auth");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Firestore
const db = getFirestore(app);
// Cloud Functions
const functions = getFunctions();
const auth = getAuth(app);


/* FIRESTORE */

async function getFirebaseDoc(collection, docName) {
    let docRef = doc(db, collection, docName);
    let docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

async function writeFirebaseDoc(collection, docName, data) {
    let docRef = doc(db, collection, docName);
    return await setDoc(docRef, data);
}

async function getUserDocRef(collection, userAddr) {
    let userDocName = "user_" + userAddr.toString(16);
    // Make sure that the doc has been created and initialized
    return doc(db, collection, userDocName);
}

async function getUserDoc(collection, userAddr) {
    let userDocName = "user_" + userAddr.toString(16);
    let res = await getFirebaseDoc(collection, userDocName);
    if (res === null) {
        await writeFirebaseDoc(collection, userDocName, 
            { name: "anonymous", dealsWhereStartup: [], dealsWhereInvestor: [] }
        );
        return await getFirebaseDoc(collection, userDocName)
    }
    return res;
}

async function getDealDoc(collection, dealAddr) {
    let dealDocName = "deal_" + dealAddr.toString(16);
    let dealDoc = await getFirebaseDoc(collection, dealDocName);
    return dealDoc
}

async function getAllDealDocs(collectionPath) {
    console.log(collectionPath)
    console.log(typeof(collectionPath))
    const snapshot = await getDocs(collection(db,collectionPath))
    return snapshot.docs.filter( doc => {
        if (doc.id.substring(0,5) == "deal_") {
            return true
        } else {
            return false
        }
    })
}

async function fbCreateDeal(collection, startupAddr, dealAddr, dealData) {
    // dealData is an arbitrary json object
    let dealDocName = "deal_" + dealAddr.toString(16);
    let existingDeal = await getFirebaseDoc(collection, dealDocName)
    if (existingDeal !== null) {
        console.log("Deal document ", dealDocName, " already exists in Firebase and updates are not permitted, so we use the existing document");
    }
    else {
        // This returns void
        await writeFirebaseDoc(collection, dealDocName, dealData);
    }

    let docRef = await getUserDocRef(collection, startupAddr);
    return await updateDoc(docRef, { dealsWhereStartup: arrayUnion(dealAddr.toString(16)) });
}

async function fbInvest(collection, investorAddr, dealAddr) {
    let dealDocName = "deal_" + dealAddr.toString(16);
    let dealDoc= await getFirebaseDoc(collection, dealDocName);
    if (dealDoc === null) {
        console.log("Failed to find the deal document ", dealDocName);
        return;
    }
    
    let docRef = await getUserDocRef(collection, investorAddr);
    return await updateDoc(docRef, { dealsWhereInvestor: arrayUnion(dealAddr.toString(16)) });
}

/* CLOUD FUNCTIONS */
async function fbSignInHelper(rawMessage, signature, address, time) {
    let authCloudFunc = httpsCallable(functions, "getAuthToken");
    authCloudFunc({ rawMessage : rawMessage, signature : signature, address : address, time : time})
        .then((result) => {
            let token = result.data.token;
            if (token == null) {
                console.log("Failed to authenticate as address", address);
                return;
            }
            signInWithCustomToken(auth, token)
               	.then((userCredential) => {
                    // Signed in
                    let user = userCredential.user;
                    console.log("Signed in as", user);
                })
                .catch((error) => {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    console.log("Failed to sign in with error", errorCode, "->", errorMessage);
                });
        });
}

module.exports = { app, db, getFirebaseDoc, writeFirebaseDoc, fbCreateDeal, fbInvest, getUserDoc, getDealDoc, getAllDealDocs, fbSignInHelper };
