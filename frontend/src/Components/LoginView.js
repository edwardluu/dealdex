import React, { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {AuthContext} from "../Context/AuthContext"
import {useHistory, Redirect} from "react-router-dom"
import {
    Flex,
    Container,
    ChakraProvider,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    SimpleGrid,
    GridItem,
    Select,
    Checkbox,
    Button,
    useBreakpointValue,
  } from '@chakra-ui/react';
import {fbSignInHelper} from "../firebaseUtils"
import Loader from "react-loader-spinner"

function LoginView() {
    const {user, loading} = React.useContext(AuthContext)
    let history = useHistory()

    async function requestAccount() {
        const ethereum = window.ethereum
        await ethereum.request({ method: 'eth_requestAccounts' });
    }

    async function signIn() {
        if (!window.ethereum) {
            console.log("No ethereum wallet in browser")
            return
        }
        await requestAccount()
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const utcMillisSinceEpoch = new Date().getTime();
        let rawMessage = `Please verify you own address ${address} [epoch time = ${utcMillisSinceEpoch}]`;
        let signature = await signer.signMessage(rawMessage);
        
        await fbSignInHelper(rawMessage, signature, address, utcMillisSinceEpoch);
    }

    return(
        <Container maxW="container.xl" p={0}>
            {loading ? <Loader /> :
                <Flex
                    h={{ base: 'auto', md: '100vh' }}
                    py={[20, 10, 20]}
                    direction={{ base: 'column-reverse', md: 'row' }}
                    >
                    {user 
                        ? <Redirect to = "/" />
                        : <Button onClick={signIn}>
                            Connect Metamask
                        </Button>
                    }
                </Flex>
            }
            
        </Container>
        
        
    )
}

export default LoginView