import React, {useState, setState} from 'react';
import {ethers} from 'ethers';
import DealData from '../DataModels/DealData';
import DealService from '../Services/DealService'
import User from '../DataModels/User'
import { Flex, Container, ChakraProvider } from '@chakra-ui/react';
import {
    FormControl,
    FormHelperText,
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

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {AuthContext} from "../Context/AuthContext"
import {useHistory} from "react-router-dom"

function MakeDealForm(props) {
    const {user, loading} = React.useContext(AuthContext)
    const [startDate, setStartDate] = useState(new Date());

    const [dealData, setDealData] = useState(DealData.empty());
    dealData.investmentDeadline = startDate

    let history = useHistory()

    async function createDeal() {
        await DealService.publishDeal(dealData, user)
        history.push("/account")
    }
    const colSpan = useBreakpointValue({ base: 2, md: 1 });

    return (
            <Container maxW="container.xl" p={0}>
                <Flex
                    h={{ base: 'auto', md: '100vh' }}
                    py={[0, 10, 20]}
                    direction={{ base: 'column-reverse', md: 'row' }}
                    >
                <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start">
                <VStack spacing={3} alignItems="flex-start">
                <Heading size="2xl">Create a Deal</Heading>
                <Text>Fill out this form to create a deal using dealdex.</Text>
                </VStack>
                    <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
                    <MakeDealFormItem 
                            title="Deal Name"
                            colSpan={2}
                            onChange = {e => setDealData({ ...dealData, name: e.target.value.trim()})}
                            placeholder = "Deal Name"
                            value = {dealData.name}
                            isRequired = {true}
                        />
                    <MakeDealFormItem 
                            title="Startup Wallet Address"
                            colSpan={colSpan}
                            onChange = {e => setDealData({ ...dealData, startup: new User(e.target.value.trim())})}
                            placeholder = "0x..."
                            value = {dealData.startup.address}
                            helperText = "Address of the wallet that will withdraw the funds once the min round size is reached. Must be checksummed."
                            isRequired = {true}
                       />

                    <MakeDealFormItem 
                            title="Startup Token Address"
                            colSpan={colSpan}
                            onChange = {e => setDealData({...dealData, startupTokenAddress: e.target.value.trim()})}
                            placeholder = "0x..."
                            value = {dealData.startupTokenAddress}
                            helperText = "Contract address of the startup's token, which will be distributed to investors. Must be checksummed."
                        />
                    
                    <MakeDealFormItem 
                            title="Token Price"
                            colSpan={colSpan}
                            onChange = {e => setDealData({...dealData, ethPerToken: e.target.value.trim()})}
                            placeholder = "0.5"
                            value = {dealData.ethPerToken}
                            helperText = "The price of one startup token (in ETH)"
                        />

                    <MakeDealFormItem 
                            title="Minimum Investment Per Investor"
                            colSpan={colSpan}
                            onChange = {e => setDealData({...dealData, minInvestmentPerInvestor: e.target.value.trim()})}
                            placeholder = "0.5"
                            value = {dealData.minInvestmentPerInvestor}
                            helperText = "The minimum investment required by an individual wallet (in ETH)"
                            isRequired = {true}
                        />

                    <MakeDealFormItem 
                            title="Maximum Investment Per Investor"
                            colSpan={colSpan}
                            onChange = {e => setDealData({...dealData, maxInvestmentPerInvestor: e.target.value.trim()})}
                            placeholder = "0.5"
                            value = {dealData.maxInvestmentPerInvestor}
                            helperText = "The maximum investment required by an individual wallet (in ETH)"
                            isRequired = {true}
                        />

                    <MakeDealFormItem 
                            title="Minimum Round Size"
                            colSpan={colSpan}
                            onChange = {e => setDealData({...dealData, minTotalInvestment: e.target.value.trim()})}
                            placeholder = "0.5"
                            value = {dealData.minTotalInvestment}
                            helperText = "The minimum amount of ETH that needs to be raised. If the minimum round size is not reached, any investor can claim a refund."
                            isRequired = {true}
                        />

                    <MakeDealFormItem 
                            title="Maximum Round Size"
                            colSpan={colSpan}
                            onChange = {e => setDealData({...dealData, maxTotalInvestment: e.target.value.trim()})}
                            placeholder = "0.5"
                            value = {dealData.maxTotalInvestment}
                            helperText = "The maximum amount of ETH that can be raised by this deal."
                            isRequired = {true}
                        />

                    <MakeDealFormItem 
                            title="NFT Address"
                            colSpan={colSpan}
                            onChange = {e => setDealData({...dealData, gateToken: e.target.value.trim()})}
                            placeholder = "0x..."
                            value = {dealData.gateToken}
                            helperText = "The Contract address of the NFT which may be required to participate in the deal."
                            isRequired = {false}
                        />

                    <InvestmentDeadlineItem
                            title="Investment Deadline"
                            colSpan={colSpan}
                            onChange = {date => {
                                setStartDate(date)
                                setDealData({...dealData, investmentDeadline: date})
                            }}
                            selected = {startDate}
                            value = {dealData.investmentDeadline}
                            helperText = "Date at which the deal is closed and no longer open to receive funds (UTC)"
                        />
                    <GridItem colSpan={2}>
                        <Button size="lg" w="full" onClick={createDeal}>
                        Create Deal
                        </Button>
                    </GridItem>
                    </SimpleGrid>
                </VStack>
                </Flex>
            </Container>
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
            <FormControl isRequired={isRequired}>
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
        </GridItem>
    )
}

function InvestmentDeadlineItem(props) {
    let title = props.title
    let colSpan = props.colSpan
    let onChange = props.onChange
    let selected = props.selected
    let value = props.value
    let helperText = props.helperText
    return (
        <GridItem colSpan={colSpan} >
            <FormControl isRequired={true}>
                <FormLabel>{title}</FormLabel> 
                <DatePicker onChange={onChange}
                            value={value}
                            selected={selected}
                    />
                {helperText &&
                    <FormHelperText textAlign="left">{helperText}</FormHelperText>
                }
            </FormControl>
        </GridItem>
    )
}

export default MakeDealForm;
