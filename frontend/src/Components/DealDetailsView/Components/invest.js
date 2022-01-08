import { Select, VStack, HStack, Heading, Container } from '@chakra-ui/react';
import {MakeDealFormNumberItem} from '../index'

function Invest(props) {
    return (
        <Container>
            <VStack py="5" spacing="1">
                <Select placeholder='Select your NFT'>
                    {
                        props.dealData ? props.dealData.nftTokenArray.map((nft, index)=>{
                            return (
                                <option value={index}>{nft}</option>
                            );
                        }) : null
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
