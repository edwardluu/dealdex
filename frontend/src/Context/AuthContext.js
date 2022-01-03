import React, { useEffect, useState } from "react";
import {ethers} from "ethers"
import AuthService from "../Services/AuthService";
import DatabaseService from "../Services/DatabaseService";


export const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({userAddress: null, loading: true})

    async function syncFirebaseAndWallet() {
        console.log("syncing wallet with auth")

        if (!window.ethereum) {
            console.log("No Ethereum wallet in browser")
            await AuthService.fbSignOut()
            return
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const accounts = await provider.listAccounts();

        if (accounts.length == 0 && state.userAddress) {
            await AuthService.fbSignOut()
        } else if (accounts.length > 0 && state.userAddress) {
            const address = await signer.getAddress();

            if (address != state.userAddress) {
                await AuthService.fbSignOut()
            }
        } 
    }

    async function handleUpdatedUser(userAddress) {
        setState({userAddress: null, loading: true})
        if (userAddress) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            await DatabaseService.getUser(userAddress)
            let validatedUser = await validateUser(userAddress)

            if (validatedUser === null) {
                setState({userAddress: null, loading: false})
            } else {
                setState({userAddress: validatedUser, loading: false})
            }
        } else {
            setState({userAddress: null, loading: false})
        }
        
    }

    async function validateUser(userAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const accounts = await provider.listAccounts();

        if (accounts.length == 0) {
            await AuthService.fbSignOut()
            return null
        } else if (accounts.length > 0) {
            const address = await signer.getAddress();
            if (address != userAddress) {
                await AuthService.fbSignOut()
                return null
            } else {
                return userAddress
            }
        } 
    }


    useEffect(() => {
        syncFirebaseAndWallet()
        async function listenMMAccount() {
            if (window.ethereum) {
                window.ethereum.on("accountsChanged", syncFirebaseAndWallet)
            }
        }
        listenMMAccount();

        const unsubscribe = AuthService.fbOnAuthStateChanged(handleUpdatedUser)

        return unsubscribe
      }, []);

    return (
      <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    );
  };

