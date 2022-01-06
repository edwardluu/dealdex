import React, { useState, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { Flex, Container, Box, Button, HStack, VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

import InvestmentsTab from "./investments";

import DatabaseService from "../../Services/DatabaseService";

function AccountView(props) {
  const { userAddress, loading } = React.useContext(AuthContext);
  const [dealsWhereStartup, setDealsWhereStartup] = useState([]);
  const [dealsWhereInvestor, setDealsWhereInvestor] = useState([]);
  const [pendingDealsWhereStartup, setPendingDealsWhereStartup] = useState([]);
  const [pendingDealsWhereInvestor, setPendingDealsWhereInvestor] = useState([]);
  const [username, setUsername] = useState("");

  // https://stackoverflow.com/questions/10970078/modifying-a-query-string-without-reloading-the-page
  // Use this to update the url
  
  useEffect(() => {
    async function fetchDeals() {
      try {
        let user = await DatabaseService.getUser(userAddress);
        let deals = await user.getDealsWhereStartup();

        let startupPendingDeals = await user.getPendingDealsWhereStartup();
        let investorPendingDeals = await user.getPendingDealsWhereInvestor();
        let investments = await user.getDealsWhereInvestor();
        let name = user.name;

        setDealsWhereStartup(deals);
        setPendingDealsWhereInvestor(investorPendingDeals);
        setPendingDealsWhereStartup(startupPendingDeals);
        setDealsWhereInvestor(investments);
        setUsername(name);
      } catch (err) {
        console.log(err);
      }
    }
    fetchDeals();
  }, []);

  return (
    <Container maxW="container.xl" p={0}>
      <Flex h={{ base: "auto", md: "100%" }} py={[0, 10, 20]} direction={{ base: "column-reverse", md: "row" }}>
        <VStack w="full" h="full" p={0} alignItems="flex-start">
          <Box>
            <HStack spacing="10px" alignItems="center">
              <Box textStyle="account">BarryClams</Box>
              <Button variant="accountEdit">Edit</Button>
            </HStack>
            <Box textAlign="left" textStyle="addressWallet">0xa1cg1...f5113</Box>
          </Box>

          <Box>
            <Tabs mt={50} variant="dealAccountTab" >
              <TabList>
                <Tab>Investments</Tab>
                <Tab ml={20}>Deals</Tab>
                <Tab ml={20}>Projects</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <InvestmentsTab/>
                </TabPanel>
                <TabPanel>
                  <p>Deals!</p>
                </TabPanel>
                <TabPanel>
                  <p>Projects!</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Flex>
    </Container>
  );
}

export default AccountView;
