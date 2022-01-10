import { Select, VStack, HStack, Heading, Container } from '@chakra-ui/react';
import {MakeDealFormNumberItem} from '../index'
import { useEffect, useState } from 'react';
import { useMoralis } from "react-moralis";
import {APP_ID, SERVER_URL} from "../../../App";

function Invest(props) {
    const { Moralis, } = useMoralis();
    const [nfts, setNFTs] = useState([]);
    useEffect(()=>{
        Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });  
        // getUseNFTs().then((nfts) => {  
        //     console.log(nfts.result);          
        //     setNFTs(nfts.result);
        // })
    }, []);
    async function getUseNFTs() {
        //Get metadata for one token
        const options = { q: "Pancake", chain: "bsc", filter: "name", limit: 4 };
        const NFTs = await Moralis.Web3API.token.searchNFTs(options);
        return NFTs;
    }
    async function getNFTMetadata(tokenAddress) {
        //Get metadata for one token
        const options = { chain: "bsc", addresses: tokenAddress };
        const tokenMetadata = await Moralis.Web3API.token.getNFTMetadata(options);
        return tokenMetadata;
    }

    return (
        <Container>
            <VStack py="5" spacing="1">
                <Select placeholder='Select your NFT'>
                    {
                        nfts.map((nft, index)=>{
                            getNFTMetadata(nft.token_address).then((metadata) => {
                                return (
                                    <option value={index}>{metadata[0].symbol}</option>
                                );
                            });
                        })
                    }
                </Select>
            </VStack>
            <VStack>
                <VStack spacing={1} w="full" alignItems="flex-start">
                    <Heading size="sm" py="3px" w="full" textAlign="left">Amount</Heading>
                </VStack>
                <MakeDealFormNumberItem 
                    colSpan={2}
                    onChange = {value => props.setDealData({ ...props.dealData, vestPercent: value})}
                    placeholder = "0.0"
                    value = {props.dealData.vestPercent ? props.dealData.vestPercent : '0.0'}
                    maxvalue={100}
                    parsing = {true}
                    appendChar = {props.dealData.nftunit}
                />
            </VStack>
            <HStack pb={3}>
                <Heading size="sm" py="3px" w="full" textAlign="left">Expected tokens:</Heading>
                <Heading size="sm" py="3px" w="full" textAlign="right">{props.expectedTokens}</Heading>
            </HStack>
        </Container>
    )
}

export default Invest;
