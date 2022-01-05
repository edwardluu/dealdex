import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { Flex, Container } from "@chakra-ui/react";
import { Button, VStack, Heading, Text, Box, Wrap, WrapItem, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";
import { ReactComponent as Logo } from "../assets/icon/DealDexLogo.svg";

import DealService from "../Services/DealService";

const DummyData = [
  {
    dealName: "Postered Series A",
    syndicateAddress: "MoonBoots Capital",
    isVerified: true,
    requiredNFT: "BAYC",
    minInvestmentAmount: '10',
    paymentToken: "USDC",
    deadline: 1664879311,
  },
  {
    dealName: "Project Series B",
    syndicateAddress: "Web3 Capital",
    isVerified: false,
    requiredNFT: "BAYC",
    minInvestmentAmount: '10k',
    paymentToken: "USDC",
    deadline: 1641292111,
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
        <VStack w="full" h="full" p={0} spacing={95} alignItems="flex-start">
          <VStack w="full" h="full" alignItems="center">
            <Logo />
            <Heading as="h1" size="4xl">
              DealDex
            </Heading>
            <Text fontSize="3xl" sx={{ padding: "18px 0 37px 0" }}>
              Instantly turn your NFT collection into a syndicate. Our platform lets you create NFT-gated investment deals with the click of a button.
            </Text>
            <Button onClick={onCreateADeal} sx={{ bg: "#7879F1", color: "#fff", padding: "20px 135px" }} size="lg">
              Create a deal
            </Button>
          </VStack>
          <VStack w="full" h="full" alignItems="flex-start">
            <Heading as="h2" size="2xl" padding="0 0 25px 0">
              All Deals
            </Heading>

            <ListDeals data={DummyData} />
          </VStack>
        </VStack>
      </Flex>
    </Container>
  );
};

export default HomeView;

const ListDeals = ({ data = [] }) => {
  if (!data.length) return <Text fontSize="3xl">No deals created so far</Text>;


  const getTimeDeadline = (deadline = 0) => {
    const dateDeadline = new Date(deadline * 1000);
    const now = new Date();
    const diffInSeconds = Math.abs(dateDeadline - now) / 1000;
    const days = Math.floor(diffInSeconds / 60 / 60 / 24);
    if (days > 0) {
      return ( <Text>{days}d left</Text>)
    } else {
      return ( <Text color="#E53E3E">Passed</Text>)
    }
  }
  
  return (
    <Wrap spacing="45px">
      {data.map((item, index) => (
        <WrapItem key={index}>
          <Box width="610px" height="277px" borderRadius="4px" color="gray.500" bg="white" padding="26px 40px 55px" boxShadow="base" border="1px" borderColor="#E2E8F0" textAlign="left">
            <Heading color="black" as="h4" size="xl" isTruncated>
              {item.dealName}
            </Heading>
            <Flex>
              <Text fontSize="2xl" color="gray.500">
                {item.syndicateAddress}
              </Text>
              {item.isVerified && (
                <Box ml={2}>
                  <Badge variant="outline" background="#5D5FEF" color="white">
                    <Text fontSize="xs">VERIFIED</Text>
                  </Badge>
                </Box>
              )}
            </Flex>

            <Box background="#F7FAFC" mt={25}>
              <Table borderRadius="4px" border="1px" borderColor="#E2E8F0">
                <Thead>
                  <Tr>
                    <Th color="gray.700" fontSize="16px" borderColor="#F7FAFC" textAlign="center">
                      Required NFT
                    </Th>
                    <Th color="gray.700" fontSize="16px" borderColor="#F7FAFC" textAlign="center">
                      Min invest
                    </Th>
                    <Th color="gray.700" fontSize="16px" borderColor="#F7FAFC" textAlign="center">
                      Deadline
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td color="gray.700" textAlign="center">
                      {item.requiredNFT}
                    </Td>
                    <Td color="gray.700" textAlign="center">
                    {item.minInvestmentAmount} {item.paymentToken}
                    </Td>
                    <Td color="gray.700" textAlign="center">
                      { getTimeDeadline(item.deadline)}
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
