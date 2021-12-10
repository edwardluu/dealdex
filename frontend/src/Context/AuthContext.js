import React, { useEffect, useState } from "react";
import User from "../DataModels/User"
import {ethers} from "ethers"
import { fbSignInHelper, fbSignOut, fbOnAuthStateChanged } from "../firebaseUtils";


export const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({user: null, loading: true})

    async function syncFirebaseAndWallet() {
        console.log("syncing wallet with auth")

        if (!window.ethereum) {
            console.log("No Ethereum wallet in browser")
            await fbSignOut()
            return
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const accounts = await provider.listAccounts();
        // accounts = await web3.eth.getAccounts();

        if (accounts.length == 0 && state.user) {
            await fbSignOut()
        } else if (accounts.length > 0 && state.user) {
            const address = await signer.getAddress();
            // console.log(address)
            // console.log(state.user.address)
            if (address != state.user.address) {
                // console.log(address)
                // console.log(state.user.address)
                // console.log("signing out")
                await fbSignOut()
            }
        } 
    }

    async function handleUpdatedUser(user) {
        console.log("updating user")
        setState({user: null, loading: true})
        if (user) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            user.signer = signer
            await user.createIfNecessary()
            await validateUser(user)
        } else {
            setState({user: null, loading: false})
        }
        
    }

    async function validateUser(user) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const accounts = await provider.listAccounts();
        // accounts = await web3.eth.getAccounts();

        if (accounts.length == 0) {
            await fbSignOut()
        } else if (accounts.length > 0) {
            const address = await signer.getAddress();
            if (address != user.address) {
                await fbSignOut()
            } else {
                setState({user: user, loading: false})
            }
        } 
    }

    // async function updateState() {
    //     setState({user: null, loading: true})
    //     const provider = new ethers.providers.Web3Provider(window.ethereum)
    //     const signer = provider.getSigner()

    //     const accounts = await provider.listAccounts();
    //         // accounts = await web3.eth.getAccounts();
    //         if (accounts.length > 0) {
    //             const address = await signer.getAddress();
    //             const newUser = new User(address, signer)
    //             await newUser.createIfNecessary()                
    //             setState({user: newUser, loading: false})
    //         } else {
    //             setState({user: null, loading: false})
    //         }
    // }

    useEffect(() => {
        syncFirebaseAndWallet()
        async function listenMMAccount() {
            if (window.ethereum) {
                window.ethereum.on("accountsChanged", syncFirebaseAndWallet)
            }
        }
        listenMMAccount();

        const unsubscribe = fbOnAuthStateChanged(handleUpdatedUser)

        return unsubscribe
      }, []);

    return (
      <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    );
  };

