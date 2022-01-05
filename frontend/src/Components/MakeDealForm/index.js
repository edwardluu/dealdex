import React, {useState, setState} from 'react';
import {ethers} from 'ethers';
import {Deal} from '../../DataModels/DealData';
import DealService from '../../Services/DealService'
import User from '../../DataModels/User'
import { Flex, Container, Box, Center, ChakraProvider } from '@chakra-ui/react';
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Button,
    Checkbox,
    CloseButton,
    FormControl,
    FormHelperText,
    FormLabel,
    GridItem,
    Heading,
    Input,
    Select,
    SimpleGrid,
    Text,
    useBreakpointValue,
    VStack,
  } from '@chakra-ui/react';

import "react-datepicker/dist/react-datepicker.css";
import {AuthContext} from "../../Context/AuthContext"
import {useHistory} from "react-router-dom"

import DealFormStep1 from './DealFormStep1';
import DealFormStep2 from './DealFormStep2';
import StepsComponent from './StepsComponent';

function MakeDealForm(props) {
    // This is doubling as the display variable so 'none' is the only valid default value
    const [dealData, setDealData] = useState(Deal.empty());
    const [activeStep, setActiveStep] = useState(1);

    const logined = true;

    const handleNextStep = () => {
        let val = activeStep === 5 ? 5 : activeStep + 1;        
        setActiveStep(val);
    }

    const handlePrevStep = () => {       
        let val = activeStep === 1 ? 1 : activeStep - 1; 
        setActiveStep(val);
    }

    return (
            <Container maxW="container.xl" p={0}>
                <Flex
                    h={{ base: 'auto' }}
                    pt={[0, 10, 20]}
                    direction={{ base: 'column-reverse', md: 'row' }}
                    >
                    <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start">
                        <VStack spacing={3} alignItems="flex-start">
                            <Heading size="2xl">Create a Deal</Heading>
                            <Text>Create an NFT-gated deal so your DAO, syndicate, or investment group can ape into a project.</Text>
                        </VStack>
                    </VStack>          
                </Flex>
                <Flex
                    h={{ base: 'auto' }}
                    pb={[0, 10, 20]}
                    direction={{ base: 'column-reverse', md: 'cloumn' }}
                    >
                    <StepsComponent activeStep={activeStep}/>
                </Flex>
                {
                    logined ? <Flex
                        h={{ base: 'auto' }}
                        pb={[0, 10, 20]}
                        px={10}
                        direction={{ base: 'column-reverse', md: 'cloumn' }}
                        >
                        <Box p={10} borderRadius={4} borderColor='#E2E8F0' borderWidth={1}>
                            {(activeStep === 1) &&<DealFormStep1 nextStep={handleNextStep}/>}
                            {(activeStep === 2) &&<DealFormStep2 nextStep={handleNextStep}/>}
                        </Box>
                    </Flex> : <Flex
                        h={{ base: 'auto' }}
                        pb={[0, 10, 20]}
                        px={10}
                        direction={{ base: 'column-reverse', md: 'cloumn' }}
                        >
                        <Center p={10} borderRadius={4} borderColor='#E2E8F0' borderWidth={1} h={{ base: 'auto', md: '30vh' }}>
                            <Button colorScheme='blue' w='320px'>Connect Wallet</Button>
                        </Center>
                    </Flex>
                }
            </Container>
    )
}

export default MakeDealForm;
