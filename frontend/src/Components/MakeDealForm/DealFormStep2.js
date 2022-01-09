import {
    Text,
    GridItem,
    VStack,
    HStack,
    Button,
    Container,
} from '@chakra-ui/react';
import { CalendarIcon, CheckCircleIcon } from '@chakra-ui/icons';
import "react-datepicker/dist/react-datepicker.css";
import {useEffect, useState} from 'react';

import { useMoralis } from "react-moralis";
import {APP_ID, SERVER_URL} from "../../App";
import {MakeDealFormItem, MakeDealFormNumberItem} from './index';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './date-picker.css';

function DealFormStep2(props) { 
    const format = (val) => val;
    const parse = (val) => val.replace(/^\%/, '')
    const formatCoin = (val) => val;
    const parseCoin = (val) => val.replace(/^\$/, '');
    const [nftTokenPrice, setNFTTokenPrice] = useState([]);
    const [nftTokenMetadata, setNFTTokenMetadata] = useState([]);
    const [tokenPrice, setTokenPrice] = useState([]);
    const [tokenMetadata, setTokenMetadata] = useState([]);
    const [appendUnit, setAppendUnit] = useState('USDC');
    const [enableButton, setEnableButton] = useState(true);
    const [clickedSubmitButton, setClickedSubmitButton] = useState(false);

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
        setClickedSubmitButton(true);
        props.nextStep();
    }

    const handlePrevStep = () => {
        props.prevStep();
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
        if (props.dealData.ethNFTPerToken) {
            getTokenMetadata(props.dealData.ethNFTPerToken).then((metadata => { 
                console.log(metadata)
                setNFTTokenMetadata(metadata[0]);
                if (metadata.length > 0 && metadata[0].symbol) {
                    getTokenPrice(props.dealData.ethNFTPerToken).then((price => {
                        console.log(price)
                        if (price.length > 0 && price[0].exchangeAddress) {
                            setNFTTokenPrice(price[0]);
                        }
                    }))
                } else {            
                    setNFTTokenMetadata([]);
                }
            }));
        } else {
            setNFTTokenMetadata([]);
        }
    }, [props.dealData.ethNFTPerToken]);

    useEffect(()=>{
        // if (!isAuthenticated || isAuthenticating) return;
        if (props.dealData.paymentToken) {
            getTokenMetadata(props.dealData.paymentToken).then((metadata => { 
                console.log(metadata)
                setTokenMetadata(metadata[0]);
                if (metadata.length > 0 && metadata[0].symbol) {
                    getTokenPrice(props.dealData.paymentToken).then((price => {
                        console.log(price)
                        if (price.length > 0 && price[0].exchangeAddress) {
                            setTokenPrice(price[0]);
                            setAppendUnit(price[0].nativePrice.symbol);
                        }
                    }))
                } else {            
                    setTokenMetadata([]);
                }
            }));
        } else {
            setTokenMetadata([]);
        }
    }, [props.dealData.paymentToken]);

    useEffect(()=>{
        if (nftTokenMetadata.validated !== undefined && tokenMetadata.validated !== undefined && props.dealData.investDeadline) {
            setEnableButton(false);
        }
    }, [props.dealData.ethNFTPerToken, props.dealData.paymentToken, props.dealData.investDeadline]);

    return (
        <GridItem colSpan={2} >
            <VStack w="65%" h="full" spacing={10} alignItems="flex-start">
                <VStack spacing={1} alignItems="flex-start">
                    <Text variant="dealStepTitle">Investment Constraints</Text>
                    <Text variant="dealStepDesc">Enter the investment requirements for your deal. This includes the NFT access requirement, the token used for payment, min/max round size, and min/max investment per investor.</Text>
                </VStack>
            </VStack>  

            <HStack w="full" h="full" pt={5} spacing={10} alignItems="flex-start">
                <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                    <MakeDealFormItem 
                        title="Required NFT"
                        colSpan={2}
                        onChange = {e => props.setDealData({ ...props.dealData, ethNFTPerToken: e.target.value})}
                        placeholder = "ERC-721 NFT Contract Address"
                        value = {props.dealData.ethNFTPerToken}
                        onBlur = {e => formatInput(e)}
                        isRequired = {true}
                        verified = {(nftTokenMetadata && nftTokenMetadata.validated !== undefined)}
                        helperText = "Investors will use an NFT of this collection to invest in the deal. They will be able to claim their allotted project tokens with the NFT they used to invest."
                        errorText = "Enter a valid ERC-721 NFT contract address."
                    />
                </HStack>
                <HStack w="30%" h="full" pt={10} spacing={10} alignItems="flex-start">
                    {(nftTokenMetadata && nftTokenMetadata.validated !== undefined) && <Container variant="dealFormAlert">
                        <Text variant="dealFontWeight500">NFT validated <CheckCircleIcon mt="-2px" ml="3px" color="#7879F1"/></Text>
                        <Text>Name: {nftTokenMetadata.name}</Text>
                        <Text>Symbol: {nftTokenMetadata.symbol}</Text>
                        <Text>Balance: {nftTokenMetadata.decimals}</Text>
                    </Container>}
                </HStack>
            </HStack>

            <HStack w="full" h="full" pt={5} spacing={10} alignItems="flex-start">
                <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                    <MakeDealFormItem 
                        title="Payment Token"
                        colSpan={2}
                        onChange = {e => props.setDealData({ ...props.dealData, paymentToken: e.target.value})}
                        placeholder = "ERC-20 Token Contract Address"
                        value = {props.dealData.paymentToken}
                        onBlur = {e => formatInput(e)}
                        isRequired = {true}
                        verified = {(tokenMetadata && tokenMetadata.validated !== undefined)}
                        helperText = "Investors will use this token to invest."
                        errorText = "Enter a valid ERC-20 token contract address."
                    />
                </HStack>
                <HStack w="30%" h="full" pt={10} spacing={10} alignItems="flex-start">
                    {(tokenMetadata && tokenMetadata.validated !== undefined) && <Container variant="dealFormAlert">
                        <Text variant="dealFontWeight500">Payment token validated <CheckCircleIcon mt="-2px" ml="3px" color="#7879F1"/></Text>
                        <Text>Name: {tokenMetadata.name}</Text>
                        <Text>Symbol: {tokenMetadata.symbol}</Text>
                        <Text>Balance: {tokenMetadata.decimals}</Text>
                    </Container>}
                </HStack>
            </HStack>

            <HStack w="full" h="full" pt={5} spacing={10} alignItems="flex-start">
                <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                    <MakeDealFormNumberItem 
                        title="Minimum Round Size"
                        colSpan={2}
                        onChange = {value => props.setDealData({ ...props.dealData, minRoundSize: parse(value)})}
                        placeholder = "0.0"
                        value = {props.dealData.minRoundSize ? props.dealData.minRoundSize : '0.0'}
                        onBlur = {e => formatInput(e)}
                        width="50%"
                        maxvalue={100}
                        parsing = {true}
                        formatFuc = {format}
                        parseFuc = {parse}
                        appendChar = {appendUnit}
                        isRequired = {true}
                        disabled = {!(nftTokenMetadata && nftTokenMetadata.validated !== undefined)}
                        verified = {(props.dealData.minRoundSize !== 0 && !clickedSubmitButton)}
                        errorText = "Specify a payment token before round size."
                        helperText = "The minimum amount of the payment token that needs to be raised. If the minimum round size is not reached, any investor can claim a refund."
                    />
                    <MakeDealFormNumberItem 
                        title="Maximum Round Size"
                        colSpan={2}
                        onChange = {value => props.setDealData({ ...props.dealData, maxRoundSize: parse(value)})}
                        placeholder = "0.0"
                        value = {props.dealData.maxRoundSize ? props.dealData.maxRoundSize : '0.0'}
                        onBlur = {e => formatInput(e)}
                        width="50%"
                        maxvalue={100}
                        parsing = {true}
                        formatFuc = {format}
                        parseFuc = {parse}
                        appendChar = {appendUnit}
                        isRequired = {true}
                        disabled = {!(nftTokenMetadata && nftTokenMetadata.validated !== undefined)}
                        verified = {!clickedSubmitButton}
                        helperText = "The maximum amount of the payment token that can be raised by this deal."
                    />
                </HStack>
            </HStack>

            <HStack w="full" h="full" pt={5} spacing={10} alignItems="flex-start">
                <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                    <MakeDealFormNumberItem 
                        title="Minimum Investment Per Investor"
                        colSpan={2}
                        onChange = {value => props.setDealData({ ...props.dealData, minInvestment: parse(value)})}
                        placeholder = "0.0"
                        value = {props.dealData.minInvestment ? props.dealData.minInvestment : '0.0'}
                        onBlur = {e => formatInput(e)}
                        width="50%"
                        maxvalue={100}
                        parsing = {true}
                        formatFuc = {format}
                        parseFuc = {parse}
                        appendChar = {appendUnit}
                        isRequired = {true}
                        disabled = {!(nftTokenMetadata && nftTokenMetadata.validated !== undefined)}
                        verified = {!clickedSubmitButton}
                        helperText = "The minimum amount of the payment token required by each investor/NFT."
                    />
                    <MakeDealFormNumberItem 
                        title="Maximum Investment Per Investor"
                        colSpan={2}
                        onChange = {value => props.setDealData({ ...props.dealData, maxInvestment: parse(value)})}
                        placeholder = "0.0"
                        value = {props.dealData.maxInvestment ? props.dealData.maxInvestment : '0.0'}
                        onBlur = {e => formatInput(e)}
                        width="50%"
                        maxvalue={100}
                        parsing = {true}
                        isRequired = {true}
                        formatFuc = {format}
                        parseFuc = {parse}
                        appendChar = {appendUnit}
                        disabled = {!(nftTokenMetadata && nftTokenMetadata.validated !== undefined)}
                        verified = {!clickedSubmitButton}
                        helperText = "The maximum amount of the payment token allowed for each investor/NFT."
                    />
                </HStack>
            </HStack>

            <HStack w="full" h="full" pt={5} spacing={10} alignItems="flex-start">
                <HStack w="65%" h="full" pt={5} spacing={10} alignItems="flex-start">
                    <MakeDealFormItem 
                        title="Investment Deadline"
                        colSpan={2}
                        onChange = {v => { console.log(v); props.setDealData({ ...props.dealData, vestDate: v})}}
                        placeholder = "Dec 26, 2021 07:14:31"
                        value = {props.dealData.vestDate}
                        onBlur = {e => formatInput(e)}
                        width="47%"
                        dateformat = {true}
                        DatePicker={DatePicker}
                        isRequired = {true}
                        verified = {props.dealData.vestDate && props.dealData.vestDate.length > 0}
                        helperText = "Deadline to invest by (UTC time)"
                    />
                </HStack>
            </HStack>
            
            <HStack w="full" h="full" pt={40} spacing={10} alignItems="flex-start">
                <Button variant="dealformBack" size='lg' onClick={handlePrevStep}>Back</Button>
                <Button variant="dealform2Details" size='lg' onClick={handleNextStep} disabled = {enableButton}>Continue to project details</Button>
            </HStack>
        </GridItem>
    )
}

export default DealFormStep2;
