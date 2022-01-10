import { 
    Box, 
    VStack, 
    HStack,
    Heading,
    Table, 
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Button
} from '@chakra-ui/react';
import {useEffect} from 'react';
import { useMoralis } from "react-moralis";
import {APP_ID, SERVER_URL} from "../../../App";

function MyInvestment(props) {
    const { Moralis, } = useMoralis();
    async function getNFTMetadata(tokenAddress) {
        //Get metadata for one token
        const options = { chain: "bsc", addresses: tokenAddress };
        const tokenMetadata = await Moralis.Web3API.token.getNFTMetadata(options);
        return tokenMetadata;
    }
    useEffect(()=>{
        Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });  
    }, []);
    return (
        <VStack w="full" spacing={3} alignItems="flex-start">
            {props.dealData && <HStack w="full" py="10px" spacing={5}>
                <Table variant='dealDetailProjectTable' size='md'>
                    <Thead>
                        <Tr>
                        <Th>NFT</Th>
                        <Th>Amount Invested</Th>
                        <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            props.dealData.nftTokenArray.map((nft) => {
                                getNFTMetadata(nft).then((metaData) => {
                                    console.log(metaData)
                                    return (
                                        <Tr>
                                        <Td px={2}>{metaData[0].symbol} #{metaData[0].id}</Td>
                                        <Td px={2}>{props.dealData.unit} {1000}</Td>
                                        <Td px={1} py={0} bg="white">{props.dealData.deadlineOver ? <Button variant="dealDetailTable">Claim tokens</Button> : <Button variant="dealDetailTable">Refund</Button>}</Td>
                                        </Tr>
                                    )
                                });                                
                            })
                        }
                    </Tbody>
                </Table>
            </HStack>}
        </VStack>
    )
}

export default MyInvestment;
