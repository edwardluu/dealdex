import React, { useState, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { Flex, Container, Box, ButtonGroup, Button, HStack, VStack, Tabs, TabList, TabPanels, Tab, TabPanel, Input, FormControl, IconButton } from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

import AccountInvestments from "./investments";
import AccountDeals from "./deals";
import AccountProjects from "./projects"

import DatabaseService from "../../Services/DatabaseService";

import { ConvertAddress } from "../../Utils/ComponentUtils";

function AccountView(props) {
  const { userAddress, loading } = React.useContext(AuthContext);
  const [dealsWhereStartup, setDealsWhereStartup] = useState([]);
  const [dealsWhereInvestor, setDealsWhereInvestor] = useState([]);
  const [pendingDealsWhereStartup, setPendingDealsWhereStartup] = useState([]);
  const [pendingDealsWhereInvestor, setPendingDealsWhereInvestor] = useState([]);
  const [username, setUsername] = useState("");
  const [isEditUsername, setIsEditUsername] = useState(false);
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
              {isEditUsername ? (
                <EditUserInput username={username} setUsername={setUsername} setIsEditUsername={setIsEditUsername} />
              ) : (
                <>
                  <Box textStyle="account">{username}</Box>
                  <Button variant="accountEdit" onClick={() => setIsEditUsername(true)}>
                    Edit
                  </Button>
                </>
              )}
            </HStack>
            <Box textAlign="left" textStyle="addressWallet">
              <ConvertAddress address={userAddress} />
            </Box>
          </Box>

          <Box>
            <Tabs mt={50} variant="dealAccountTab">
              <TabList>
                <Tab>Investments</Tab>
                <Tab ml={20}>Deals</Tab>
                <Tab ml={20}>Projects</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <AccountInvestments userAddress={userAddress} />
                </TabPanel>
                <TabPanel>
                  <AccountDeals />
                </TabPanel>
                <TabPanel>
                  <AccountProjects />
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

const EditUserInput = (props) => {
  const [input, setInput] = useState(props.username);

  const handleInputChange = (e) => setInput(e.target.value);

  const isError = input === "";

  const onSaveUserNanme = () => {
    if (!input) return;
    props.setUsername(input);
    props.setIsEditUsername(false);
  };

  return (
    <FormControl isInvalid={isError}>
      <Flex>
        <Input id="userName" placeholder="Edit User Name" size="md" value={input} onChange={handleInputChange} />
        <ButtonGroup ml={2} alignItems="center" justifyContent="center" size="md">
          <IconButton onClick={onSaveUserNanme} variant="saveUserName" icon={<CheckIcon />} />
          <IconButton
            icon={<CloseIcon />}
            onClick={() => {
              props.setIsEditUsername(false);
            }}
          />
        </ButtonGroup>
      </Flex>
    </FormControl>
  );
};
