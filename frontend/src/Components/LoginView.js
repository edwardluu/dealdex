import React, { useState, useEffect } from 'react';

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
import AuthService from "../Services/AuthService"
import Loader from "react-loader-spinner"

function LoginView() {
    const {userAddress, loading} = React.useContext(AuthContext)
    let history = useHistory()

    return(
        <Container maxW="container.xl" p={0}>
            {loading ? <Loader /> :
                <Flex
                    h={{ base: 'auto', md: '100vh' }}
                    py={[20, 10, 20]}
                    direction={{ base: 'column-reverse', md: 'row' }}
                    >
                    {userAddress 
                        ? <Redirect to = "/" />
                        : <Button onClick={() => AuthService.fbSignIn(window.ethereum)}>
                            Connect Metamask
                        </Button>
                    }
                </Flex>
            }
            
        </Container>
        
        
    )
}

export default LoginView
