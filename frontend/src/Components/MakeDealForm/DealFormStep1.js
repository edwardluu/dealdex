import {useState} from 'react';
import {Deal} from '../../DataModels/DealData';
import {
    FormControl,
    FormHelperText,
    FormLabel,
    GridItem,
    Input,
    VStack,
    Button,
    Text
  } from '@chakra-ui/react';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function DealFormStep1(props) {
    const [dealData, setDealData] = useState(Deal.empty());

    const formatInput = (event) => {
        const attribute = event.target.getAttribute('name')
        this.setState({ [attribute]: event.target.value.trim() })
    }    

    const handleNextStep = () => {
        console.log(dealData.name)
        if (dealData.name === undefined || dealData.name === '') {
            return;
        }
        props.nextStep();
    }

    return (
        <MakeDealFormItem 
            title="Deal Name"
            colSpan={2}
            onChange = {e => setDealData({ ...dealData, name: e.target.value})}
            placeholder = "Name of investment deal"
            value = {dealData.name}
            onBlur = {e => formatInput(e)}
            isRequired = {true}
            nextStep={handleNextStep}
        />
    )
}


function MakeDealFormItem(props) {
    let title = props.title
    let colSpan = props.colSpan
    let onChange = props.onChange
    let placeholder = props.placeholder
    let value = props.value
    let helperText = props.helperText
    var isRequired 
    if (props.isRequired) {
        isRequired = props.isRequired
    } else {
        isRequired = false
    }

    return (
        <GridItem colSpan={colSpan} >
            <VStack w="full" h="full" spacing={10} alignItems="flex-start">
                <VStack spacing={1} alignItems="flex-start">
                    <Text fontSize="32px" fontWeight="bold">Deal Name</Text>
                    <Text>Enter a name for your deal. This is the name that will be visible on the front page.</Text>
                </VStack>
            </VStack>  
            <FormControl isRequired={isRequired} pt={5}>
                <FormLabel>{title}</FormLabel> 
                <Input 
                        onChange={onChange}
                        placeholder={placeholder}
                        value={value}
                    />
                {helperText &&
                    <FormHelperText textAlign="left">{helperText}</FormHelperText>
                }
            </FormControl>
            <VStack w="full" h="full" pt={20} spacing={10} alignItems="flex-start">
                <Button colorScheme='purple' w='320px' onClick={props.nextStep}>Continue to investment constraints</Button>
            </VStack>
        </GridItem>
    )
}


export default DealFormStep1;
