import React, { useEffect, useMemo } from "react";

import { Flex, Box, VStack, Wrap, WrapItem, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

import { RoundNumbers, Symbols } from "../../Utils/ComponentUtils";

import { APP_ID, SERVER_URL } from "../../App";
import { useMoralis } from "react-moralis";

const DummyData = [
  {
    projectName: "Coders Arena",
    syndicateAddress: "Layer 1 Master",
    projectNFT: "Meetbits",
    fundsRaised: 12000000,
    address: "0xce769237a33ec9bc2d26b2ca18904aaae29a9569",
    status: "Minimum Not Met",
  },
  {
    projectName: "Global Transfers",
    syndicateAddress: "Talent 01x",
    projectNFT: "n Project",
    fundsRaised: 300,
    address: "0xbdbea2c43adaf5ec1f4afce4c6cbe59ab29ff7bb",
    status: "Closed",
  },
  {
    projectName: "Art Gallery Miami",
    syndicateAddress: "Talent 01x",
    projectNFT: "Satoshi",
    fundsRaised: 2500000,
    address: "0x4ea4e3621adb7051666958c6afe54f6db1a37d83",
    status: "Ongoing",
  },
];

const AccountDeals = () => {
  const dataProjects = useMemo(() => DummyData, []);
  const { Moralis } = useMoralis();

  useEffect(() => {
    Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });
  }, []);

  return (
    <VStack w="full" h="full" p={0} alignItems="flex-start">
      <Flex>
        <Box textStyle="investmentMessages" mb={3} mr={2}>
          Your wallet has been the recipient of the following deals
        </Box>
      </Flex>
      <ListDeals data={dataProjects} />
    </VStack>
  );
};

export default AccountDeals;

const ListDeals = ({ data = [] }) => {
  if (!data.length) return <Box textStyle="titleDeal">No projects available in your wallet</Box>;

  return (
    <Wrap spacing="45px">
      {data.map((item, index) => (
        <WrapItem key={index}>
          <Box layerStyle="dealTableWrap">
            <Box textStyle="titleDeal">{item.projectName}</Box>
            <Flex>
              <Box textStyle="subTitleDeal">{item.syndicateAddress}</Box>
            </Flex>

            <Box mt={25}>
              <Table variant="dealTable">
                <Thead>
                  <Tr>
                    <Th>NFT</Th>
                    <Th>Funds Raised</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{item.projectNFT}</Td>
                    <Td>
                      <RoundNumbers num={item.fundsRaised} /> <Symbols address={item.address} />
                    </Td>
                    <Td>
                      <StatusProject status={item.status} />
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

const StatusProject = ({ status }) => {
  if (status === "Minimum Not Met") {
    return <Box textStyle="statusProjectMin">{status}</Box>;
  }
  if (status === "Ongoing") {
    return <Box textStyle="statusProjectOngoing">{status}</Box>;
  }
  return <Box>{status}</Box>;
};
