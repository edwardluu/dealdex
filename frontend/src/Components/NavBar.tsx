import React, { ReactNode } from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Image,
  AspectRatio,
  Heading
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import {AuthContext} from "../Context/AuthContext"
import {useLocation, useHistory} from 'react-router-dom'
import DealDexColor from "../Utils/UIUtils"



function Logo() {
  let history = useHistory()
  return (
    <Flex w="100%">
      <Link href={"/"}>
      
      
      <Heading ml="8"  size="md" fontWeight="semibold" textColor={DealDexColor.foregroundPrimary} >DealDex</Heading> 
      </Link>
    </Flex>
  )
}

function CreateDealButton() {
  return (
      <Link 
        //style={} 
        textColor={DealDexColor.foregroundPrimary}
        flexWrap={"nowrap"}
        href="/createDeal"
        px = {5}
        py = {1}
        rounded={'md'}
        _hover={{
          textDecoration: 'none',
          textColor: DealDexColor.gradientPink,
        }}>
            Create a Deal
      </Link>
  )
}

function ProfileButton() {
  let history = useHistory()
  const {userAddress, loading} = React.useContext(AuthContext)
  return (
    <IconButton
      aria-label = "Profile"
      isRound = {true}
      onClick = {() => {
        if (userAddress) {
          history.push("/account")
        } else {
          history.push("/login")
        }
      }}
    >
      <Avatar size={'sm'} />
    </IconButton>
  )
}

export default function NavBar() {
  

  return (
    <>
      <Box bg={DealDexColor.backgroundPrimary} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <HStack spacing={8} alignItems={'center'}>
            <Logo />
          </HStack>
          <Flex alignItems={'center'}>
            <CreateDealButton />
            <ProfileButton />
          </Flex>
        </Flex>
      </Box>

    </>
  );
}