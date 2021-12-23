import React, { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import { Link, useHistory, Route } from 'react-router-dom'
import {AuthContext} from "../Context/AuthContext"
import MakeDealForm from '../Components/MakeDealForm'

import { Flex, Container, ChakraProvider } from '@chakra-ui/react';
import {
    Button,
    VStack,
    Heading,
    Text,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
  } from '@chakra-ui/react';
import DealService from '../Services/DealService';

function HomeView(props) {

  const [deals, setDeals] = useState([])
  const history = useHistory();
  
  async function fetchDeals() {
      let allDeals = await DealService.fetchAllDeals()
      setDeals(allDeals)
  }

  function createDeal() {
    history.push('/createDeal');
  }

  useEffect(fetchDeals, [])

  return(
    <Container maxW="container.xl" p={0}>
      <Flex
          h={{ base: 'auto', md: '100vh' }}
          py={[0, 10, 20]}
          direction={{ base: 'column-reverse', md: 'row' }}
          >
      <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start">
      <VStack spacing={3} alignItems="flex-start">
      <Heading size="2xl">Crypto investing.</Heading>
      <Heading size="2xl">Simplified.</Heading>

      <Route path="/createDeal" >
            <MakeDealForm />
      </Route>

      // add the button here
      <Button size="lg" w="full" onClick={createDeal}>
        Create a Deal
      </Button>

      // add the view deals here
      <VStack spacing={3} alignItems="flex-start">
            <Heading size="xl">All Deals</Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Deal Name</Th>
                  <Th>Deal Address</Th>
                </Tr>
              </Thead>
              <Tbody>
                
                {deals.map(function(deal, index){
                  const path = "/dealDetails?address=" + deal.dealAddress
                  return(
                    <Tr>
                      <Td>{deal.name}</Td>
                      <Td><Link to={path}>{deal.dealAddress}</Link></Td>
                    </Tr>
                  ) 
                })}
              </Tbody>
            </Table>
          </VStack>

      </VStack>
      </VStack>
      </Flex> 

    </Container>

  )
}

export default HomeView;
