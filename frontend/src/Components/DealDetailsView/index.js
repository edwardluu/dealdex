import React, { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {useLocation, useHistory} from 'react-router-dom'
import {Deal} from '../../DataModels/DealData';
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Button,
    ChakraProvider,
    Checkbox,
    CloseButton,
    Container,
    Flex,
    FormControl,
    FormLabel,
    GridItem,
    Heading,
    Input,
    Select,
    SimpleGrid,
    Table, 
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    TableCaption,
    Tfoot,
    useBreakpointValue,
    VStack,
    Box,
    HStack,
    Badge,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    InputGroup,
    InputRightElement,
    InputLeftElement,
    FormHelperText,
    Center
  } from '@chakra-ui/react';
  
import {AuthContext} from "../../Context/AuthContext"
import DealService from '../../Services/DealService';
import AuthService from '../../Services/AuthService'
import DatabaseService from '../../Services/DatabaseService';
import User from "../../DataModels/User"
import StepPercent from './Components/step-percent';
import ProgressPercent from './Components/progress-percent';
import Invest from './Components/invest';
import MyInvestment from './Components/my-investment';

function DealDetailsView(props) {
    const {userAddress, loading} = React.useContext(AuthContext)
    var user = undefined
    if (userAddress) {
        user = User.empty(userAddress)
    } 
    let history = useHistory()
    const search = useLocation().search
    const dealAddress  = new URLSearchParams(search).get('address')
    console.log("[DealDetailsView]: dealAddress =", dealAddress)

    const [dealData, setDealData] = useState(null)
    const [tokensToSend, setTokensToSend] = useState(0)
    const [ethToInvest, setEthToInvest] = useState(0)
    const [newStartupTokenAddress, setNewStartupTokenAddress] = useState('')
    const [newStartupTokenPrice, setNewStartupTokenPrice] = useState('')
    // This is doubling as the display variable so 'none' is the only valid default value
    const [alertTitle, setAlertTitle] = useState('none')
    const [alertDescription, setAlertDescription] = useState('<Alert Description>')
    const [alertStatus, setAlertStatus] = useState('info')
    const colSpan = useBreakpointValue({ base: 2, md: 1 });
    const [expectedTokens, setExpectedTokens] = useState(0)
    const [tabInvest, setTabInvest] = useState(false)

    async function fetchDeal() {
        if (typeof window.ethereum == 'undefined') {
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const deal = await DealService.fetchDeal(provider, dealAddress)
        setDealData(deal)
        console.log(deal)
    }

    function setAlert(status, title, description) {
        setAlertStatus(status)
        setAlertTitle(title)
        setAlertDescription(description)
    }

    async function invest() {
        if (typeof window.ethereum == 'undefined') {
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        let ret = await DealService.invest(signer, dealData, ethToInvest)
        if (ret.error == null) {
            // We should ensure that the smart contract's behavior always is to invest ethToInvest
            // (as opposed to, for example, investing some proportion of that). Otherwise this can
            // really confuse the user
            setAlert("success", `Successfully invested ${ethToInvest} ETH`, "Txn hash: " + ret.hash)
        } else {
            setAlert("error", "Failed to invest", ret.error)
        }
    }

    async function claimRefund() {
        if (typeof window.ethereum == 'undefined') {
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        let ret = await DealService.claimRefund(signer, dealData)
        if (ret.error == null) {
            setAlert("success", "Successfully claimed refund!", "Txn hash: " + ret.hash)
        } else {
            setAlert("error", "Failed to claim refund", ret.error)
        }
    }

    async function sendTokens() {
        if (typeof window.ethereum == 'undefined') {
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(tokensToSend)
        let ret = await DealService.sendTokens(signer, dealData, tokensToSend)
        if (ret.error == null) {
            setAlert("success", `Successfully sent ${tokensToSend} tokens!`, "Txn hash: " + ret.hash)
        } else {
            setAlert("error", "Failed to send tokens", ret.error)
        }
    }

    async function setNewStartupToken() {
        let ret = await DealService.updateStartupToken(user, dealData, newStartupTokenAddress, newStartupTokenPrice)
        if (ret.error == null) {
            setAlert("success", "Successfully set startup token!", "Txn hash: " + ret.hash)
        } else {
            setAlert("error", "Failed to set startup token", ret.error)
        }
    }

    async function claimFunds() {
        if (typeof window.ethereum == 'undefined') {
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        let ret = await DealService.claimFunds(signer, dealData)
        if (ret.error == null) {
            setAlert("success", "Successfully claimed funds!", "Txn hash: " + ret.hash)
        } else {
            setAlert("error", "Failed to claim funds", ret.error)
        }
    }

    async function claimTokens() {
        if (typeof window.ethereum == 'undefined') {
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        let ret = await DealService.claimTokens(signer, dealData)
        if (ret.error == null) {
            setAlert("success", "Successfully claimed tokens!", "Txn hash: " + ret.hash)
        } else {
            setAlert("error", "Failed to claim tokens", ret.error)
        }
    }

    function displayString(value, defaultString) {
        if (value === undefined) {
            return defaultString
        } else {
            return value.toString()
        }
    }

    const login = false;
    function getDealState(date) {
        return true;
    }

    function handleInvest() {
        setExpectedTokens(expectedTokens + 1);
    }

    useEffect(() => { 
        //fetchDeal(); 
        const fakeDeal = Deal.empty();
        fakeDeal.name = "AAAA";
        fakeDeal.dealAddress = "dealAddress"
        fakeDeal.investorAmounts = "investorAmounts"
        fakeDeal.ethPerToken = "Postered Coin (PSTRD)"
        fakeDeal.startupTokenAddress = "startupTokenAddress"
        fakeDeal.minInvestmentPerInvestor = "minInvestmentPerInvestor"
        fakeDeal.maxInvestmentPerInvestor = "maxInvestmentPerInvestor"
        fakeDeal.minTotalInvestment = "minTotalInvestment"
        fakeDeal.maxTotalInvestment = "maxTotalInvestment"
        fakeDeal.investmentDeadline = "investmentDeadline"
        fakeDeal.tokensInContract = "tokensInContract"
        fakeDeal.ethInContract = "ethInContract"
        fakeDeal.gateToken = "gateToken"
        fakeDeal.tokenPrice = "5200.50"
        fakeDeal.vestPercent = 0
        fakeDeal.nftunit = "USDC"
        fakeDeal.unit = "USDC"
        fakeDeal.deadline = "Dec 26, 2021 07:14:31"
        fakeDeal.deadlineOver = false
        fakeDeal.minInvest = "100"
        fakeDeal.maxInvest = "850.50"
        fakeDeal.minRound = "1500"
        fakeDeal.maxRound = "12K"
        fakeDeal.amtRasied = "10K"
        fakeDeal.totalRasied = "1,200,000"
        fakeDeal.nftName = "BAYC"
        fakeDeal.verified = true;
        fakeDeal.nftTokenArray = ['BAYC #8282', 'BAYC #7667', 'BAYC #7447', 'BAYC #3327'];
        setDealData(fakeDeal);
    }, []);

    const dealState = getDealState(dealData);

    console.log(userAddress, loading)
    return(
        <Container maxW="container.xl" p={0}>
            <Flex position="fixed" top='0px' backgroundColor="white" w="container.xl" >
                <Alert status={alertStatus} display={alertTitle}>
                    <AlertIcon />
                    <AlertTitle>{alertTitle}</AlertTitle>
                    <AlertDescription>{alertDescription}</AlertDescription>
                    <CloseButton position='absolute' right='8px' top='8px' onClick={() => setAlertTitle('none')} />
                </Alert>
            </Flex>
            <Flex
                h={{ base: 'auto', md: '100vh' }}
                py={[0, 10, 20]}
                direction={{ base: 'column-reverse', md: 'row' }}
                >
                <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start">
                    <VStack w="full" spacing={3} alignItems="center">
                        <Heading size="2xl">Postered Series A</Heading>
                        <HStack>
                            <Text fontSize="2xl" color="gray.500">MoonBoots Capital</Text>
                            {(dealData && dealData.verified) && (
                                <Box ml={2}>
                                    <Badge variant="verified2">VERIFIED</Badge>
                                </Box>
                            )}
                        </HStack>
                    </VStack>
                    <VStack w="full" spacing={3} alignItems="flex-start">
                        <Heading size="xl">Summary</Heading>
                        {dealData && <HStack w="full" py="20px" spacing={5}>
                            <Box layerStyle="detailSummaryWrap" w="15%">
                                <Text fontSize="sm" color="gray.500" fontWeight="500">Status</Text>
                                <Heading size="md" py="3px" color={dealState ? "green.500":"blue.300"}>{ dealState ? "Open" : "Invested"}</Heading>
                                <Text fontSize="sm" color="gray.500">{dealState ? "Open to investments" : "You already invested"}</Text>
                            </Box>
                            <Box layerStyle="detailSummaryWrap" w="26%">
                                <Text fontSize="sm" color="gray.500" fontWeight="500">DEADLINE</Text>
                                <Heading size="md" py="3px">{dealData.deadline}</Heading>
                                <Text fontSize="sm" color="gray.500">UTC time</Text>
                            </Box>
                            <Box layerStyle="detailSummaryWrap" w="20%">
                                <Text fontSize="sm" color="gray.500" fontWeight="500">INVESTMENT PER NFT</Text>
                                <Heading size="md" py="3px">{dealData.minInvest}-{dealData.maxInvest}</Heading>
                                <Text fontSize="sm" color="gray.500">{dealData.nftunit}</Text>
                            </Box>
                            <Box layerStyle="detailSummaryWrap" w="20%">
                                <Text fontSize="sm" color="gray.500" fontWeight="500">REQUIRED NFT</Text>
                                <Heading size="md" py="3px">{dealData.nftName}</Heading>
                                <Text fontSize="sm" color="gray.500">Bored Ape Yacht Club</Text>
                            </Box>
                            <Box layerStyle="detailSummaryWrap" w="14%">
                                <Text fontSize="sm" color="gray.500" fontWeight="500">TOKEN PRICE</Text>
                                <Heading size="md" py="3px">{dealData.tokenPrice}</Heading>
                                <Text fontSize="sm" color="gray.500">{dealData.unit}</Text>
                            </Box>
                        </HStack>}
                    </VStack>
                    <VStack w="full" spacing={3} alignItems="flex-start">
                        {dealData && <HStack w="full" py="10px" spacing={5}>
                            <Box layerStyle="detailSummaryWrap" w="60%" h="340px" px="40px">
                                <Heading size="md" py="3px">The Project</Heading>
                                <Box layerStyle="detailSummaryWrap" w="100%" my="20px">
                                    <Table variant='dealDetailProjectTable' size='md'>
                                        <Thead>
                                            <Tr>
                                            <Th>Name</Th>
                                            <Th textAlign={"right"}>Postered Eyewear</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            <Tr>
                                            <Td>Token</Td>
                                            <Td textAlign={"right"}>{dealData.ethPerToken}</Td>
                                            </Tr>
                                            <Tr>
                                            <Td>Token Price</Td>
                                            <Td textAlign={"right"}>{dealData.tokenPrice} {dealData.unit}</Td>
                                            </Tr>
                                            {!dealState && <Tr>
                                            <Td>Total Raised</Td>
                                            <Td textAlign={"right"}>{dealData.totalRasied} {dealData.unit}</Td>
                                            </Tr>}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>
                            <Box layerStyle="detailSummaryWrap" w="40%" h="340px" px="20px">
                                {dealState ? <Heading size="md" py="2px">Invest</Heading> : <HStack py="2px">
                                    {tabInvest ? <Button variant="dealDetailTabInvest" onClick={()=>setTabInvest(false)}>Invest</Button>
                                    : <Button variant="dealDetailTabInvestSel" onClick={()=>setTabInvest(false)}>Invest</Button>}
                                    {tabInvest ? <Button variant="dealDetailTabMyInvestmentSel" onClick={()=>setTabInvest(true)}>My Investments</Button>
                                    : <Button variant="dealDetailTabMyInvestment" onClick={()=>setTabInvest(true)}>My Investments</Button>}
                                </HStack>}
                                {!tabInvest ? <>
                                    <Invest dealData={dealData} setDealData={setDealData} expectedTokens={expectedTokens}/>
                                    <Center>
                                        {/* {!user && !loading && 
                                            <Button colorScheme='blue' onClick={() => AuthService.fbSignIn(window.ethereum)}>
                                                Connect Metamask
                                            </Button>
                                        } */}
                                        {!login ? 
                                            <Button variant="dealDetailTable" onClick={() => AuthService.fbSignIn(window.ethereum)}>
                                                Connect Metamask
                                            </Button> :
                                            <Button variant="dealDetailTable" onClick={() => handleInvest()}>
                                                Invest
                                            </Button>
                                        }
                                    </Center>
                                </> : <>
                                    <MyInvestment dealData={dealData} setDealData={setDealData}/>
                                </>}
                            </Box>
                        </HStack>}
                    </VStack>
                    <VStack w="full" spacing={3} alignItems="flex-start" pb="100px">
                        <Heading size="xl">Progress</Heading>
                        {dealData && <HStack w="full" py="10px" spacing={5}>
                            <Box layerStyle="detailSummaryWrap" w="54%" h="250px" px="40px">
                                <Heading size="md" py="3px">Vesting</Heading>
                                <StepPercent percent={dealState ? 20 : 40}/>
                            </Box>
                            <Box layerStyle="detailSummaryWrap" w="46%" h="250px" px="40px">
                                <Heading size="md" py="3px">Funding Amount</Heading>
                                {dealData && <HStack w="full" py="20px" spacing={5}>
                                    <Box layerStyle="detailSummaryWrap" w="50%">
                                        <Text fontSize="sm" color="gray.500" fontWeight="500">ROUND SIZE</Text>
                                        <Heading size="md" py="3px">{dealData.minRound}-{dealData.maxRound}</Heading>
                                        <Text fontSize="sm" color="gray.500">{dealData.nftunit}</Text>
                                    </Box>
                                    <Box layerStyle="detailSummaryWrap" w="50%">
                                        <Text fontSize="sm" color="gray.500" fontWeight="500">AMT RAISED</Text>
                                        <Heading size="md" py="3px">{dealData.amtRasied}</Heading>
                                        <Text fontSize="sm" color="gray.500">{dealData.unit}</Text>
                                    </Box>
                                </HStack>}
                                <ProgressPercent percent={80}/>
                            </Box>
                        </HStack>}
                    </VStack>
                </VStack>
            </Flex>
        </Container>

        
    )
}

export function MakeDealFormNumberItem(props) {
    let title = props.title
    let colSpan = props.colSpan
    let onChange = props.onChange
    let placeholder = props.placeholder
    let helperText = props.helperText
    let value = props.value
    var isRequired 
    if (props.isRequired) {
        isRequired = props.isRequired
    } else {
        isRequired = false
    }

    return (
        <>
            <FormControl isRequired={isRequired} pb={1} mt="0px" width={props.width}>
                <FormLabel>{title}</FormLabel> 
                <NumberInput 
                    value={value} 
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
                {helperText &&
                    <FormHelperText textAlign="left" fontSize="16px" >{helperText}</FormHelperText>
                }
            </FormControl>
        </>
    )
}

export default DealDetailsView;
