import {
    GridItem,
    HStack,
    VStack,
    Button,
    Text,
    Container,
    Grid,
} from '@chakra-ui/react';
import { CalendarIcon, CheckCircleIcon, CloseIcon } from '@chakra-ui/icons';
import {useEffect, useState} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import {MakeDealFormItem, MakeDealFormNumberItem} from './index';

import { useMoralis } from "react-moralis";
//import Moralis from "moralis/types";
import {APP_ID, SERVER_URL} from "../../App";

function DealFormStep3(props) {
    //const format = (val) => val + `%`;
    const format = (val) => val;
    const parse = (val) => val.replace(/^\%/, '')
    //const formatCoin = (val) => (val === '0.0' || val === '0.' || val === '0') ? '0.0' : val + ` USDC`;
    const formatCoin = (val) => val;
    const parseCoin = (val) => val.replace(/^\$/, '');
    const [vestShow, setVestShow] = useState(false);
    const [tokenPrice, setTokenPrice] = useState(0);
    const [tokenPriceUnit, setTokenPriceUnit] = useState('USDC');
    const [tokenMetadata, setTokenMetadata] = useState('');
    const [enableButton, setEnableButton] = useState(true);
    const [vestList, setVestList] = useState([]);    
    const [vestCurCount, setVestCurCount] = useState(0);

    const {
        authenticate,
        authError,
        isAuthenticating,
        isAuthenticated,
        logout,
        Moralis,
    } = useMoralis();

    const formatInput = (event) => {
        const attribute = event.target.getAttribute('name')
        this.setState({ [attribute]: event.target.value.trim() })
    }    

    const handleNextStep = () => {
        if (props.dealData.dealAddress && props.dealData.tokenPrice)
            props.nextStep();
    }

    const handlePrevStep = () => {
        props.prevStep();
    }

    const addVestList = () => {
        const date = props.dealData.investmentDeadline ? props.dealData.investmentDeadline : "Dec 26, 2021 07:14:31" 
        const percent = props.dealData.vestPercent;
        const index = vestList.length + 1
        vestList.push({date, percent, index});
        setVestList(vestList);
        setVestCurCount(vestCurCount + 1);
    }

    const removeVestList = (index) => {
        const list = vestList.filter((vest, inx) => inx !== index)
        setVestList(list);
        setVestCurCount(vestCurCount - 1);
    }

    function validateWalletAddress(value) {
        let error = ""
        if (!value) {
          error = 'Wallet is required'
        } 
        return error
    }

    function validateTokenPrice(value) {
        let error = ""
        if (!value) {
          error = 'Token price is required'
        } 
        return error
    }

    async function getTokenPrice(tokenAddress) {
        //Get token price on PancakeSwap v2 BSC
        const options = {
            address: tokenAddress,
            chain: "bsc",
            exchange: "PancakeSwapv2"
        };
        const price = await Moralis.Web3API.token.getTokenPrice(options);
        return price;
    }

    async function getTokenMetadata(tokenAddress) {
        //Get metadata for one token
        const options = { chain: "bsc", addresses: tokenAddress };
        const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);
        return tokenMetadata;
    }

    useEffect(()=>{
        // if (!isAuthenticated) {
        //     authenticate();
        // }
        Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });  
    }, []);

    useEffect(()=>{
        // if (!isAuthenticated || isAuthenticating) return;
        if (props.dealData.ethPerToken) {
            getTokenMetadata(props.dealData.ethPerToken).then((metadata => { 
                console.log(metadata)
                if (metadata.length > 0 && metadata[0].symbol) {
                    setTokenMetadata(metadata[0].address);
                    getTokenPrice(props.dealData.ethPerToken).then((price => {
                        console.log(price)
                        if (price.length > 0 && price[0].exchangeAddress) {
                            setTokenPrice(price[0].nativePrice.decimals);
                            setTokenPriceUnit(price[0].nativePrice.symbol);
                        }
                    }))
                } else {            
                    setTokenMetadata('');
                }
            }));
        }
    }, [props.dealData.ethPerToken]);

    useEffect(()=>{
        if (props.dealData.dealAddress && tokenPrice) {
            setEnableButton(false);
        }
    }, [props.dealData.dealAddress, tokenPrice, vestCurCount]);

    return (
        <GridItem colSpan={2} >
            <VStack w="65%" h="full" spacing={10} alignItems="flex-start">
                <VStack spacing={1} alignItems="flex-start">
                    <Text variant="dealStepTitle">Project Details</Text>
                    <Text variant="dealStepDesc">Enter information about the project you will be funding with this deal: the project’s wallet address, the project’s token price, and (if applicable) the token’s contract address.</Text>
                </VStack>
            </VStack>  
            
            <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                <MakeDealFormItem 
                    title="Project’s wallet"
                    colSpan={2}
                    onChange = {e => props.setDealData({ ...props.dealData, dealAddress: e.target.value})}
                    placeholder = "Project’s Wallet Address"
                    value = {props.dealData.dealAddress}
                    onBlur = {e => formatInput(e)}
                    isRequired = {true}
                    verified = {props.dealData.dealAddress && props.dealData.dealAddress.length > 0}
                    helperText = "This wallet will be able to withdraw all funds from the deal once the minimum round size has been reached."
                />
            </HStack>

            <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                <MakeDealFormNumberItem 
                    title="Project Token Price"
                    colSpan={2}
                    onChange = {(value) => {props.setDealData({ ...props.dealData, tokenPrice: parseCoin(value)}); setTokenPrice(value)}}
                    placeholder = "0.0"
                    value = {tokenPrice ? tokenPrice : '0.0'}
                    onBlur = {e => formatInput(e)}
                    width="48%"
                    isRequired = {true}
                    parsing = {true}
                    formatFuc = {formatCoin}
                    parseFuc = {parseCoin}
                    appendChar = {tokenPriceUnit}
                    verified={true}
                    helperText = "The price of the project’s token. This can be updated by the project in the future."
                />
            </HStack>

            <HStack w="full" h="full" pt={5} spacing={10} alignItems="flex-start">
                <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                    <MakeDealFormItem 
                        title="Project Token"
                        colSpan={2}
                        onChange = {e => props.setDealData({ ...props.dealData, ethPerToken: e.target.value})}
                        placeholder = "ERC-20 Token Contract Address"
                        value = {props.dealData.ethPerToken}
                        onBlur = {e => formatInput(e)}
                        isRequired = {false}
                        helperText = "(Optional) The project’s token which will be distributed to investors. This can be specified at a later time as well."
                    />
                </HStack>
                <HStack w="30%" h="full" pt={10} spacing={10} alignItems="flex-start">
                    {tokenMetadata && <Container variant="dealFormAlert">
                        <Text variant="dealFontWeight500">Project token validated <CheckCircleIcon mt="-2px" ml="3px" color="#7879F1"/></Text>
                        <Text>Name: Postered Coin</Text>
                        <Text>Symbol: PSTRD</Text>
                        <Text>Balance: 420.0</Text>
                    </Container>}
                </HStack>
            </HStack>

            <HStack w="full" h="full" pt={5} spacing={10} alignItems="flex-start">
                <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                    <MakeDealFormItem 
                        title="Vest Date"
                        colSpan={2}
                        onChange = {e => props.setDealData({ ...props.dealData, investmentDeadline: e.target.value})}
                        placeholder = "Dec 26, 2021 07:14:31"
                        value = {props.dealData.investmentDeadline}
                        onBlur = {e => formatInput(e)}
                        width="50%"
                        dateformat = {true}
                        helperText = "Date and time that the tokens will vest"
                    />
                    <MakeDealFormNumberItem 
                        title="Vest Percentage"
                        colSpan={2}
                        onChange = {value => props.setDealData({ ...props.dealData, vestPercent: parse(value)})}
                        placeholder = "0.0"
                        value = {props.dealData.vestPercent ? props.dealData.vestPercent : '0.0'}
                        onBlur = {e => formatInput(e)}
                        width="50%"
                        maxvalue={100}
                        parsing = {true}
                        formatFuc = {format}
                        parseFuc = {parse}
                        appendChar = {"%"}
                        helperText = "Percentage of tokens that will vest on the selected date"
                    />
                </HStack>
                <HStack w="30%" h="full" pt={10} spacing={10} alignItems="flex-start" display="block">   
                    <VStack w="full" spacing={1} alignItems="flex-start">  
                    {vestList.map((vest, index) => (
                        <Grid templateColumns='repeat(1, 1fr)' w='100%'>
                            <GridItem colStart={1} rowStart={1} w='100%' h='100%'>
                                <Container variant="dealFormAlert">
                                    <Text variant="dealFontWeight500">Vesting Step {vest.index}</Text>
                                    <Text>{vest.date}</Text>
                                    <Text>Percentage: {vest.percent}%</Text>  
                                </Container>
                            </GridItem>
                            <GridItem colStart={1} rowStart={1} w='100%' h='100%' textAlign="right" px="15px" py="10px">
                                <CloseIcon onClick={()=>removeVestList(index)} width="10px" height="10px" cursor="Pointer"/>
                            </GridItem>
                        </Grid>
                    ))}
                    </VStack>
                </HStack>
            </HStack>
            <HStack w="full" h="full" pt={0} spacing={10} alignItems="flex-start">
                <Button variant="dealformAdd" size='lg' onClick={()=>addVestList()}>Add to vesting schedule</Button>
            </HStack>            
            
            <HStack w="full" h="full" pt={40} spacing={10} alignItems="flex-start">
                <Button variant="dealformBack" size='lg' onClick={handlePrevStep}>Back</Button>
                <Button variant="dealform3Fee" size='lg' onClick={handleNextStep} disabled = {enableButton}>Continue to fees</Button>
            </HStack>
        </GridItem>
    )
}

export default DealFormStep3;
