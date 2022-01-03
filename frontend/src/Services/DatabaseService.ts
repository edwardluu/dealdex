// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig.json";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs, deleteField, DocumentData } from "firebase/firestore";
import User from "../DataModels/User"
import DealMetadata from "../DataModels/DealMetadata"


import DeploymentState from "../artifacts/deployment-info/DeploymentState.json"
import { DealConfig, DealParticipantAddresses } from "../DataModels/DealConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Firestore
const db = getFirestore(app);


export default class DatabaseService {

    static async getDealFactoryAddress(): Promise<string | undefined> {
        const metadata = await getFirebaseDoc("metadata")
        return metadata?.dealFactory_addr
    }

    static async getUser(userAddr: string): Promise<User | undefined> {
        let res = await getUserDoc(userAddr);
    
        if (res === undefined) {
            console.log("Unable to create user")
            return undefined
        } else {
            return new User(
                userAddr, 
                res.name, 
                res.dealsWhereStartup, 
                res.dealsWhereInvestor,
                res.pendingDealsWhereStartup,
                res.pendingDealsWhereInvestor
            );
        }
    }

    static async getDealMetadata(dealAddr: string): Promise<DealMetadata | undefined> {
        let dealDocName = "deal_" + dealAddr
        let dealDoc = await getFirebaseDoc(dealDocName)

        if (dealDoc === undefined) {
            return undefined
        } else {
            return new DealMetadata(dealDoc.name, dealAddr)
        }
    }

    static async getAllDealsMetadata(): Promise<DealMetadata[]> {
        const snapshot = await getDocs(collection(db, DeploymentState.firebaseCollection))

        let filtered_snapshot = snapshot.docs.filter( doc => {
            return (doc.id.substring(0,5) == "deal_" && doc.exists())
        })

        return filtered_snapshot.map( doc => {
            return new DealMetadata(doc.data().name, doc.id.substring(5))
        })
    }

    static async recordPendingDeal(dealConfig: DealConfig, dealMetadata: DealMetadata, transactionHash: string) {

        let dealCreator = dealConfig.participantAddresses.dealCreatorAddress
        let project = dealConfig.participantAddresses.projectAddress
        let dealName = dealMetadata.name

        let docRef = await getUserDocRef(dealConfig.participantAddresses.dealCreatorAddress);

        if (dealCreator == project) {
            return await updateDoc(
                docRef, 
                { [`pendingDealsWhereStartup.${transactionHash}`]: {'name': dealName, 'startupAddress': project}}
            );
        } else {
            return await updateDoc(
                docRef, 
                { [`pendingDealsWhereInvestor.${transactionHash}`]: {'name': dealName, 'startupAddress': project}} 
            );
        }
    }

    static async removePendingDealRecord(dealParticipants: DealParticipantAddresses, transactionHash: string) {
        let dealCreator = dealParticipants.dealCreatorAddress
        let project = dealParticipants.projectAddress

        let docRef = await getUserDocRef(dealCreator);

        if (dealCreator == project) {
            return await updateDoc(docRef, { [`pendingDealsWhereStartup.${transactionHash}`]: deleteField()} );
        } else {
            return await updateDoc(docRef, { [`pendingDealsWhereInvestor.${transactionHash}`]: deleteField()} );
        }
    }

    static async recordDeal(dealParticipants: DealParticipantAddresses, dealMetadata: DealMetadata) {
        let dealDocName = "deal_" + dealMetadata.dealAddress!

        let existingDeal = await getFirebaseDoc(dealDocName)

        console.log(dealDocName)
        if (existingDeal !== undefined) {
            console.log("Deal document ", dealDocName, " already exists and updates are not permitted, so we use the existing document");
        }
        else {
            // This returns void
            await writeFirebaseDoc(dealDocName, {"name": dealMetadata.name});
        }

        let dealCreator = dealParticipants.dealCreatorAddress
        let project = dealParticipants.projectAddress

        let creatorDocRef = await getUserDocRef(dealCreator);
        if (dealCreator == project) {
            return await updateDoc(creatorDocRef, { dealsWhereStartup: arrayUnion(dealMetadata.dealAddress!) });
        } else {
            await updateDoc(creatorDocRef, { dealsWhereInvestor: arrayUnion(dealMetadata.dealAddress!) });

            // The project document may not exist yet
            await DatabaseService.getUser(project)
            let startupDocRef = await getUserDocRef(project);
            return await updateDoc(startupDocRef, { dealsWhereStartup: arrayUnion(dealMetadata.dealAddress!) });
        }

    }

    static async recordInvestment(investorAddr: string, dealAddr: string) {
        let dealDocName = "deal_" + dealAddr
        let dealDoc= await getFirebaseDoc(dealAddr);
        if (dealDoc === undefined) {
            console.log("Failed to find the deal document ", dealDocName);
            return;
        }
        
        let docRef = await getUserDocRef(investorAddr);
        return await updateDoc(docRef, { dealsWhereInvestor: arrayUnion(dealAddr) });
    }
}

/* Helpers */

async function getFirebaseDoc(docName: string): Promise<DocumentData | undefined> {
    let docRef = doc(db, DeploymentState.firebaseCollection, docName);
    let docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : undefined;
}

async function writeFirebaseDoc(docName: string, data: any) {
    let docRef = doc(db, DeploymentState.firebaseCollection, docName);
    return await setDoc(docRef, data);
}

async function getUserDocRef(userAddr: string) {
    let userDocName = "user_" + userAddr
    // Make sure that the doc has been created and initialized
    return doc(db, DeploymentState.firebaseCollection, userDocName);
}

async function getUserDoc(userAddr: string) {
    let userDocName = "user_" + userAddr
    let res = await getFirebaseDoc(userDocName);
    if (res === undefined) {
        await writeFirebaseDoc(userDocName, 
            { 
                name: "anonymous", 
                dealsWhereStartup: [], 
                dealsWhereInvestor: [], 
                pendingDealsWhereStartup: [], 
                pendingDealsWhereInvestor: [] 
            }
        );
        return await getFirebaseDoc(userDocName)
    }
    return res;
}