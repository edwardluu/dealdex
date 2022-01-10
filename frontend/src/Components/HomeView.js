import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { Flex, Container } from "@chakra-ui/react";
import { Button, VStack, Box, Wrap, WrapItem, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";
import { ReactComponent as Logo } from "../assets/icon/DealDexLogo.svg";
import { TimeDeadline, RoundNumbers , Symbols} from '../Utils/ComponentUtils'
import DealService from "../Services/DealService";

const DummyData = [
  {
    dealName: "Postered Series A",
    syndicateAddress: "MoonBoots Capital",
    isVerified: true,
    requiredNFT: "BAYC",
    minInvestmentAmount: 10,
    address: "0x4ea4e3621adb7051666958c6afe54f6db1a37d83",
    deadline: 1664879311,
  },
  {
    dealName: "Project Series B",
    syndicateAddress: "Web3 Capital",
    isVerified: false,
    requiredNFT: "BAYC",
    minInvestmentAmount: 10000,
    address: "0x4ea4e3621adb7051666958c6afe54f6db1a37d83",
    deadline: 1641228522,
  },
];

const HomeView = () => {
  const [deals, setDeals] = useState([]);
  const history = useHistory();

  useEffect(() => {
    async function fetchDealsData() {
      const allDeals = await DealService.fetchAllDeals();
      setDeals(allDeals);
    }
    fetchDealsData();
  }, []);

  const onCreateADeal = () => {
    history.push("/createDeal");
  };

  return (
    <Container maxW="container.xl" p={0}>
      <Flex h={{ base: "auto", md: "100%" }} py={[0, 10, 20]} direction={{ base: "column-reverse", md: "row" }}>
        <VStack w="full" h="full" p={0} spacing={95} alignItems="center">
          <VStack w="800px" h="full" alignItems="center">
            <Logo />
            <Box textStyle="title" pb={18}>
              DealDex
            </Box>
            <Box textStyle="subtitle" pb={29}>
              Instantly turn your NFT collection into a syndicate. Our platform lets you create NFT-gated investment deals with the click of a button.
            </Box>
            <Button variant="dealCreate" size='lg' onClick={onCreateADeal}>
              Create a deal
            </Button>
          </VStack>
          <VStack w="full" h="full" alignItems="flex-start">
            <Box textStyle="titleSection" pb={25}>
              All Deals
            </Box>
            <ListDeals data={DummyData} />
          </VStack>
        </VStack>
      </Flex>
    </Container>
  );
};

export default HomeView;

const ListDeals = ({ data = [] }) => {
  if (!data.length) return <Box textStyle="titleDeal">No deals created so far</Box>;

  return (
    <Wrap spacing="45px">
      {data.map((item, index) => (
        <WrapItem key={index}>
          <Box layerStyle="dealTableWrap">
            <Box textStyle="titleDeal">{item.dealName}</Box>
            <Flex>
              <Box textStyle="subTitleDeal">{item.syndicateAddress}</Box>
              {item.isVerified && (
                <Box ml={2}>
                  <Badge variant="verified">VERIFIED</Badge>
                </Box>
              )}
            </Flex>

            <Box mt={25}>
              <Table variant="dealTable">
                <Thead>
                  <Tr>
                    <Th>Required NFT</Th>
                    <Th>Min invest</Th>
                    <Th>Deadline</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{item.requiredNFT}</Td>
                    <Td>
                      <RoundNumbers num={item.minInvestmentAmount} /> <Symbols  address={item.address}/>
                    </Td>
                    <Td>
                      <TimeDeadline deadline={item.deadline} />
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          </Box>
        </WrapItem>
      ))}
    </Wrap>
  );
};
