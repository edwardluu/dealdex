import React, { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {useLocation, useHistory} from 'react-router-dom'
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
    useBreakpointValue,
    VStack,
  } from '@chakra-ui/react';
  
import {AuthContext} from "../Context/AuthContext"
import DealService from '../Services/DealService';
import AuthService from '../Services/AuthService'
import DatabaseService from '../Services/DatabaseService';
import User from "../DataModels/User"


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

    useEffect(() => { fetchDeal(); }, []);
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
            <VStack spacing={3} alignItems="flex-start">
            <Heading size="2xl">Deal Details</Heading>
            </VStack>
            {!user && !loading && 
                <Button onClick={() => AuthService.fbSignIn(window.ethereum)}>
                    Connect Metamask to Participate
                </Button>
            }
            {dealData &&
                <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
                <GridItem colSpan={1}>
                    <Heading size="l"> Deal name </Heading> {dealData.name}
                </GridItem>

                <GridItem colSpan={colSpan}>
                    <Heading size="l"> Startup name </Heading> {dealData.startup.name}
                </GridItem>
    
                <GridItem colSpan={colSpan}>
                    <Heading size="l"> Deal address </Heading> {dealData.dealAddress}
                </GridItem>
    
                <GridItem colSpan={colSpan}>
                    <Heading size="l"> Startup Address </Heading> {dealData.startup.address}
                </GridItem>

                <GridItem colSpan={2}>
                        <Heading size="l"> 
                            Investment deadline 
                        </Heading>
                        {dealData.investmentDeadline.toLocaleString().split(/\D/).slice(0,3).map(num=>num.padStart(2,"0")).join("/")}
                    </GridItem>

                </SimpleGrid>
            }

            
            <VStack spacing={3} alignItems="flex-start">
            <Heading size="xl">Token details</Heading>
            </VStack>

            {dealData &&
                <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">

                        <GridItem colSpan={1}>
                            <Heading size="l"> Startup token address </Heading>
                                {displayString(dealData.startupTokenAddress, "Not set")}                     
                        </GridItem>
            
                        <GridItem colSpan={1}>
                            <Heading size="l"> Price per token (eth) </Heading>
                                {displayString(dealData.ethPerToken, "Not set") }                    
                        </GridItem>


                        <GridItem colSpan={1}>
                            <Heading size="l"> Tokens in contract </Heading>
                                    <div>{displayString(dealData.tokensInContract, "N/A")}</div>                    
                        </GridItem>

    
                        <GridItem colSpan={1}>
                            <Heading size="l"> Eth in contract </Heading>
                            <div>{dealData.ethInContract}</div>
                            {user && user.isStartup(dealData) && 
                                // <GridItem colSpan={1}>
                                    <Button onClick={claimFunds}>Claim Funds</Button>
                                // </GridItem>
                            }
                        </GridItem>

                        

                        {user && user.isStartup(dealData) && 
                            <GridItem colSpan={1}>
                                <FormControl>
                                    <Heading size="l"> Number of tokens to send</Heading>
                                    
                                        <Input 
                                            onChange={e => setTokensToSend(e.target.value.trim())}
                                            placeholder="Tokens to send"
                                            value={tokensToSend}
                                            style={{width: "300px"}}
                                        />
                    
                                </FormControl>
                                <Button onClick={sendTokens}>Send tokens</Button>
                            </GridItem>
                        }

                        {user && user.isStartup(dealData) && 
                            <GridItem colSpan={1}>
                                <FormControl>
                                    <Heading size="l">Update Startup Token</Heading>
                                        <div>Token address</div>
                                        <Input 
                                            onChange={e => setNewStartupTokenAddress(e.target.value.trim())}
                                            placeholder="0x..."
                                            value={newStartupTokenAddress}
                                            style={{width: "300px"}}
                                        />

                                        <div>Token price (in ETH)</div>
                                        <Input 
                                            onChange={e => setNewStartupTokenPrice(e.target.value.trim())}
                                            placeholder="0.5"
                                            value={newStartupTokenPrice}
                                            style={{width: "300px"}}
                                        />
                    
                                </FormControl>
                                <Button onClick={setNewStartupToken}>Update startup token</Button>
                            </GridItem>
                        }
                </SimpleGrid>
    
            }

            <VStack spacing={3} alignItems="flex-start">
            <Heading size="xl">Investment details</Heading>
            </VStack>

            {dealData &&
                <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
                    <GridItem colSpan={colSpan}>
                        <Heading size="l"> 
                            Min investment per investor 
                        </Heading>
                        {dealData.minInvestmentPerInvestor.toString() } 
                    </GridItem>

                    <GridItem colSpan={colSpan}>
                        <Heading size="l"> 
                            Max investment per investor
                        </Heading>
                        {dealData.maxInvestmentPerInvestor.toString() }
                    </GridItem>

                    <GridItem colSpan={colSpan}>
                        <Heading size="l"> 
                            Min total investment 
                        </Heading>
                        {dealData.minTotalInvestment.toString() } 
                    </GridItem>

                    <GridItem colSpan={colSpan}>
                        <Heading size="l"> 
                            Max total investment
                        </Heading>
                        {dealData.maxTotalInvestment.toString() }
                    </GridItem>
        
                    {user && !user.isStartup(dealData) && 
                        <GridItem colSpan={1}>
                            <FormControl>
                                <Heading size="l"> Eth to invest </Heading>
                                <Input 
                                    onChange={e => setEthToInvest(e.target.value.trim())}
                                    placeholder="Eth to invest"
                                    value={ethToInvest}
                                    style={{width: "300px"}}
                                />
                            </FormControl>

                            <Button onClick={invest}>Invest</Button>
                        </GridItem>
                    }

                    {user && !user.isStartup(dealData) && 
                        <GridItem colSpan={1}>
                            <Button onClick={claimRefund}>Claim Refund</Button>
                        </GridItem>
                    }

                    {user && !user.isStartup(dealData) && 
                            <GridItem colSpan={1}>
                                <Button onClick={claimTokens}>Claim Tokens</Button>
                            </GridItem>
                    }

                    <GridItem colSpan={colSpan}>
                        <Heading size="l"> 
                            NFT Token Address 
                        </Heading>
                        {displayString(dealData.gateToken, "Not set")} 
                    </GridItem>
                     
                </SimpleGrid>
            }

            <Heading size="xl">Subscribed investors</Heading>

            {dealData && 
                <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
                    <GridItem colSpan={2}>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                <Th>Investor Name</Th>
                                <Th>Investor Address</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {dealData.investors.map(function(investor, index){
                                    return(
                                        <Tr>
                                            <Td>{investor.name}</Td>
                                            <Td>{investor.address}</Td>
                                        </Tr>
                                    ) 
                                })}
                            </Tbody>
                        </Table>
                    </GridItem>

                </SimpleGrid>
            }

            </VStack>
            </Flex>
        </Container>

        
    )
}

export default DealDetailsView;
