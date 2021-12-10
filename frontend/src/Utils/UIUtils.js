import React from "react"
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import {AuthContext} from "../Context/AuthContext"
import Loader from "react-loader-spinner"
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

const DealDexColor = {
    backgroundPrimary: "#13111a",   // overall background
    backgroundSecondary: "#1d1a27", // card background color
    backgroundTertiary: "#302c3f",  // button background color
    foregroundPrimary: "#ffffff",   // Heading text
    foregroundSecondary: "#b7b4c7", // Regular text
    gradientLavender: "#4f56ff",    // DealDex gradient
    gradientPink: "#ff4980"
}

export default DealDexColor