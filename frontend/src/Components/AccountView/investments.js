import React, { useMemo, useState } from "react";

import { Flex, Box, VStack, Wrap, WrapItem, Table, Thead, Tbody, Tr, Th, Td, Checkbox , Center} from "@chakra-ui/react";

const DummyData = [
  {
    deal: "CryptoPunk #1191",
    dealStartup: "CryptoPunk",

    investments: [
      {
        dealName: "CardStellar Series A",
        dealCreator: {
          name: "Alpha Capital",
          isVerified: true,
        },
        myInvestmentAmount: "1,500 USDC",
        status: "Claimed",
      },
      {
        dealName: "CardStellar Series A",
        dealCreator: {
          name: "Alpha Capital",
          isVerified: true,
        },
        myInvestmentAmount: "20k USDC",
        status: "Claimed",
      },
    ],
  },
  {
    deal: "CryptoPunk #1192",
    dealStartup: "CryptoPunk",
    investments: [
      {
        dealName: "PogCoin Seed Round",
        dealCreator: {
          name: "VC Fund",
          isVerified: false,
        },
        myInvestmentAmount: "100k USDC",
        status: "Claimable",
      },
      {
        dealName: "CardStellar Series B",
        dealCreator: {
          name: "Alpha Capital",
          isVerified: true,
        },
        myInvestmentAmount: "20k USDC",
        status: "Claimed",
      },
    ],
  },
];

const Investments = () => {
  const dataInvestment = useMemo(() => DummyData, []);

  return (
    <VStack w="full" h="full" p={0} alignItems="flex-start">
      <Box textStyle="investmentMessages" mb={3}>
        Your wallet holds the following NFTs
      </Box>
      <Wrap spacing="45px">
        {dataInvestment.map((item, index) => (
          <WrapItem key={index}>
            <Box layerStyle="dealTableWrap" pb="12px" pt="40px">
              <Box textStyle="titleInvestment">{item.deal}</Box>
              <Flex>
                <Box textStyle="subTitleInvestment">{item.dealStartup}</Box>
              </Flex>
              <InvestmentsItems data={item.investments} />
            </Box>
          </WrapItem>
        ))}
      </Wrap>
    </VStack>
  );
};

export default Investments;

const InvestmentsItems = ({ data = [] }) => {
  const [checkedItem, setCheckedItem] = useState(true);

  return (
    <>
      {data.map((item, index) => (
        <Box my={18}>
          <Box key={index} my={1} textStyle="titleInvestmentDeal">
              {item.dealName}
          </Box>
          <Table variant="dealTable">
            <Thead>
              <Tr>
                <Th>Created By</Th>
                <Th>My investment </Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <Flex pos="relative">
                    <Center>
                      {item.dealCreator.name}
                    </Center>
                    {item.dealCreator.isVerified &&<Box pos="absolute" layerStyle="checkboxVerifyWrap"><Checkbox ml={1} isChecked={checkedItem} onChange={(e) => setCheckedItem(true)} /></Box> }
                  </Flex>
                </Td>
                <Td>{item.myInvestmentAmount}</Td>
                <Td>
                  <Box color={item.status === "Claimable" ? "green.500" : "gray.700"}>{item.status}</Box>
                </Td>
              </Tr>
            </Tbody>
          </Table>
          </Box>
      ))}
    </>
  );
};
