import React, { useEffect, useMemo, useState } from "react";

import { Flex, Box, VStack, Wrap, WrapItem, Table, Thead, Tbody, Tr, Th, Td, Checkbox, Center } from "@chakra-ui/react";

import { RoundNumbers, Symbols } from "../../Utils/ComponentUtils";

import { APP_ID, SERVER_URL } from "../../App";
import { useMoralis } from "react-moralis";

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
        myInvestmentAmount: 1500,
        status: "Claimed",
        address: "0x4ea4e3621adb7051666958c6afe54f6db1a37d83",
      },
      {
        dealName: "CardStellar Series A",
        dealCreator: {
          name: "Alpha Capital",
          isVerified: true,
        },
        myInvestmentAmount: 20000,
        status: "Claimed",
        address: "0x4ea4e3621adb7051666958c6afe54f6db1a37d83",
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
        myInvestmentAmount: 100000,
        status: "Claimable",
        address: "0x4ea4e3621adb7051666958c6afe54f6db1a37d83",
      },
      {
        dealName: "CardStellar Series B",
        dealCreator: {
          name: "Alpha Capital",
          isVerified: true,
        },
        myInvestmentAmount: 20000,
        status: "Claimed",
        address: "0x4ea4e3621adb7051666958c6afe54f6db1a37d83",
      },
    ],
  },
];

const AccountInvestments = ({ userAddress = "" }) => {
  const [NFTs, setNFTs] = useState([]);

  const dataInvestment = useMemo(() => DummyData, []);

  const { Moralis } = useMoralis();

  useEffect(() => {
    Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });
  }, []);

  useEffect(() => {
    async function testnetNFTs() {
      try {
        const options = { chain: "testnet", address: userAddress };
        const { result = [] } = await Moralis.Web3API.account.getNFTs(options);
        setNFTs(result);
      } catch (err) {
        console.log(err);
      }
    }
    testnetNFTs();
  }, [userAddress]);

  return (
    <VStack w="full" h="full" p={0} alignItems="flex-start">
      <Flex>
        <Box textStyle="investmentMessages" mb={3} mr={2}>
          Your wallet holds the following NFTs:
        </Box>
        {NFTs.map((nft, nftIndex) => (
          <Box key={nftIndex} textStyle="investmentMessages">
            {nft.symbol}
            {nftIndex !== NFTs.length - 1 && ","}
          </Box>
        ))}
      </Flex>
      <Wrap spacing="45px">
        {dataInvestment.map((item, index) => (
          <WrapItem key={index}>
            <Box layerStyle="dealTableWrap" pb="12px" pt="40px">
              <Box textStyle="titleInvestment">{item.deal}</Box>
              <Flex wrap>
                <Box textStyle="subTitleInvestment">{item.dealStartup}</Box>
              </Flex>
              <InvestmentsItems key={index} data={item.investments} />
            </Box>
          </WrapItem>
        ))}
      </Wrap>
    </VStack>
  );
};

export default AccountInvestments;

const InvestmentsItems = ({ data = [] }) => {
  const [checkedItem, setCheckedItem] = useState(true);

  return (
    <>
      {data.map((item, index) => (
        <Box my={18} key={index}>
          <Box my={1} textStyle="titleInvestmentDeal">
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
                    <Center>{item.dealCreator.name}</Center>
                    {item.dealCreator.isVerified && (
                      <Box pos="absolute" layerStyle="checkboxVerifyWrap">
                        <Checkbox ml={1} isChecked={checkedItem} onChange={(e) => setCheckedItem(true)} />
                      </Box>
                    )}
                  </Flex>
                </Td>
                <Td>
                  <RoundNumbers num={item.myInvestmentAmount} /> <Symbols address={item.address} />
                </Td>
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
