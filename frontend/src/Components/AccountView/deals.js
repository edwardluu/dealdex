import React, { useEffect, useMemo } from "react";

import { Flex, Box, VStack, Wrap, WrapItem, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";

import { TimeDeadline, RoundNumbers, Symbols, NFTName } from "../../Utils/ComponentUtils";

import { APP_ID, SERVER_URL } from "../../App";
import { useMoralis } from "react-moralis";

const DummyData = [
  {
    dealName: "Bright Windows",
    syndicateAddress: "Aristotle Capital",
    isVerified: false,
    contractNFT: "0x16baF0dE678E52367adC69fD067E5eDd1D33e3bF",
    minInvestmentAmount: 10,
    address: "0xbdbea2c43adaf5ec1f4afce4c6cbe59ab29ff7bb",
    deadline: 1664879311,
  },
  {
    dealName: "MOXY 2",
    syndicateAddress: "Aristotle Capital",
    isVerified: false,
    contractNFT: "0x83539759905d088905D63bcd8828B9f6b7e928f1",
    minInvestmentAmount: 10000000,
    address: "0x4ea4e3621adb7051666958c6afe54f6db1a37d83",
    deadline: 1641228522,
  },
];

const AccountDeals = () => {
  const dataDeals = useMemo(() => DummyData, []);
  const { Moralis } = useMoralis();

  useEffect(() => {
    Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });
  }, []);

  return (
    <VStack w="full" h="full" p={0} alignItems="flex-start">
      <Flex>
        <Box textStyle="investmentMessages" mb={3} mr={2}>
          Your wallet has created the following deals
        </Box>
      </Flex>
      <ListDeals data={dataDeals} />
    </VStack>
  );
};

export default AccountDeals;

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
                    <Td>
                      <NFTName address={item.contractNFT} />
                    </Td>
                    <Td>
                      <RoundNumbers num={item.minInvestmentAmount} /> <Symbols address={item.address} />
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
