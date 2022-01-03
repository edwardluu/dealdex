// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig.json";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import {ethers} from 'ethers';


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Firestore
const db = getFirestore(app);
// Cloud Functions
const functions = getFunctions();
const auth = getAuth(app);


export default class AuthService {
    

    static async fbSignOut() {
        await getAuth().signOut()
    }
    
    static async fbOnAuthStateChanged(handleUser: any) {
        return getAuth().onAuthStateChanged((fbUser) => {
            if (fbUser) {
                handleUser(fbUser.uid)
            } else {
                handleUser(null)
            }
        })
    }
    
    static async fbSignIn(ethereum: any) {
        if (!ethereum) {
            console.log("No ethereum wallet in browser");
            return;
        }   
        await ethereum.request({ method: 'eth_requestAccounts' }); 
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const utcMillisSinceEpoch = new Date().getTime();
        let rawMessage = `Please verify you own address ${address} [epoch time = ${utcMillisSinceEpoch}]`;
        let signature = await signer.signMessage(rawMessage);
        
        await fbSignInHelper(rawMessage, signature, address, utcMillisSinceEpoch);
    }

}


/* CLOUD FUNCTIONS */
async function fbSignInHelper(rawMessage: any, signature: any, address: any, time: any) {
    let authCloudFunc = httpsCallable(functions, "getAuthToken");
    authCloudFunc({ rawMessage : rawMessage, signature : signature, address : address, time : time})
        .then((result: any) => {
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