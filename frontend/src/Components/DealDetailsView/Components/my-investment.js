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

function MyInvestment(props) {
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
                                return (
                                    <Tr>
                                    <Td px={2}>{nft}</Td>
                                    <Td px={2}>{props.dealData.unit} {1000}</Td>
                                    <Td px={1} py={0} bg="white">{props.dealData.deadlineOver ? <Button variant="dealDetailTable">Claim tokens</Button> : <Button variant="dealDetailTable">Refund</Button>}</Td>
                                    </Tr>
                                )
                            })
                        }
                    </Tbody>
                </Table>
            </HStack>}
        </VStack>
    )
}

export default MyInvestment;
