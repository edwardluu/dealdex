import React, {useState, setState} from 'react';
import {ethers} from 'ethers';
import {Deal} from '../../DataModels/DealData';
import DealService from '../../Services/DealService'
import User from '../../DataModels/User'
import { Flex, Container, Box, Center, ChakraProvider } from '@chakra-ui/react';
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    Input,
    Text,
    VStack,
    InputGroup,
    InputRightElement,
    InputLeftElement,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    FormErrorMessage,
} from '@chakra-ui/react';
import { CalendarIcon, CheckCircleIcon } from '@chakra-ui/icons';

import "react-datepicker/dist/react-datepicker.css";
import {AuthContext} from "../../Context/AuthContext"
import {useHistory} from "react-router-dom"

import DealFormStep1 from './DealFormStep1';
import DealFormStep2 from './DealFormStep2';
import DealFormStep3 from './DealFormStep3';
import StepsComponent from './StepsComponent';

function MakeDealForm(props) {
    // This is doubling as the display variable so 'none' is the only valid default value
    const [dealData, setDealData] = useState(Deal.empty());
    const [activeStep, setActiveStep] = useState(2);

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
                            {(activeStep === 1) &&<DealFormStep1 dealData={dealData} setDealData={setDealData} nextStep={handleNextStep}/>}
                            {(activeStep === 2) &&<DealFormStep2 dealData={dealData} setDealData={setDealData} nextStep={handleNextStep} prevStep={handlePrevStep}/>}
                            {(activeStep === 3) &&<DealFormStep3 dealData={dealData} setDealData={setDealData} nextStep={handleNextStep} prevStep={handlePrevStep}/>}
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

export function MakeDealFormItem(props) {
    let title = props.title
    let colSpan = props.colSpan
    let onChange = props.onChange
    let placeholder = props.placeholder
    let value = props.value
    let helperText = props.helperText
    let errorText = props.errorText
    var isRequired 
    if (props.isRequired) {
        isRequired = props.isRequired
    } else {
        isRequired = false
    }

    return (
        <>
            <FormControl isRequired={isRequired} isInvalid={!props.verified && isRequired && value} pt={5} width={props.width}>
                <FormLabel>{title}</FormLabel> 
                <InputGroup>
                <Input 
                    onChange={onChange}
                    placeholder={placeholder}
                    //value={value}
                />
                {(isRequired && props.verified) && <InputRightElement children={<CheckCircleIcon color="#7879F1"/>} />}
                {/* {props.dateformat && <InputRightElement children={<IconButton aria-label='Search database' icon={<CalendarIcon />} />} />} */}
                {props.dateformat && <InputRightElement children={<CalendarIcon color="#2D3748"/>} />}
                </InputGroup>
                <FormErrorMessage textAlign="left" fontSize="16px">{errorText}</FormErrorMessage>
                {helperText &&
                    <FormHelperText textAlign="left" fontSize="16px" >{helperText}</FormHelperText>
                }
            </FormControl>
        </>
    )
}

export function MakeDealFormNumberItem(props) {
    let title = props.title
    let colSpan = props.colSpan
    let onChange = props.onChange
    let placeholder = props.placeholder
    let helperText = props.helperText
    let errorText = props.errorText
    let value = props.value
    var isRequired 
    if (props.isRequired) {
        isRequired = props.isRequired
    } else {
        isRequired = false
    }

    return (
        <>
            <FormControl isRequired={isRequired} isInvalid={!props.verified && isRequired && value} pt={5} width={props.width}>
                <FormLabel>{title}</FormLabel> 
                <NumberInput 
                    value={props.parsing ? props.formatFuc(value) : value} 
                    precision={1} 
                    step={0.1} 
                    min={0}
                    max={props.maxvalue}
                    onChange={onChange}
                    placeholder={placeholder}
                >
                    <NumberInputField />
                    {!(props.appendChar !== "%" && (value === "0.0" || value === ".0" || value === "0" || value === "0.")) && 
                        <InputLeftElement ml={((value.length - 1) * 8.6 + 25) + "px"} width="fit-content" children={<Text variant="dealInputAppendix">{props.appendChar}</Text>} />}
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage textAlign="left" fontSize="16px">{errorText}</FormErrorMessage>
                {helperText &&
                    <FormHelperText textAlign="left" fontSize="16px" >{helperText}</FormHelperText>
                }
            </FormControl>
        </>
    )
}

export default MakeDealForm;
