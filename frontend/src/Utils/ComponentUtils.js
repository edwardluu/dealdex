import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";

import { APP_ID, SERVER_URL } from "../App";
import { useMoralis } from "react-moralis";

export const RoundNumbers = ({ num = 0 }) => {
  num = num.toString().replace(/[^0-9.]/g, "");
  if (num < 1000) {
    return num;
  }
  let si = [
    { v: 1e3, s: "K" },
    { v: 1e6, s: "M" },
    { v: 1e9, s: "B" },
    { v: 1e12, s: "T" },
    { v: 1e15, s: "P" },
    { v: 1e18, s: "E" },
  ];
  let index;
  for (index = si.length - 1; index > 0; index--) {
    if (num >= si[index].v) {
      break;
    }
  }
  return (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s;
};

export const ConvertAddress = ({ address = "" }) => {
  const firtString = address.slice(0, 7);
  const secondString = address.slice(-5);
  return firtString + "..." + secondString;
};

export const TimeDeadline = ({ deadline = 0 }) => {
  const dateDeadline = new Date(deadline * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor(dateDeadline - now) / 1000;
  const days = Math.floor(diffInSeconds / 60 / 60 / 24);
  const hours = Math.floor((diffInSeconds / 60 / 60) % 24);
  const minutes = Math.floor((diffInSeconds / 60) % 60);
  const seconds = Math.floor(diffInSeconds % 60);
  if (days > 0) {
    return `${days}d left`;
  } else if (days <= 0 && hours > 0) {
    return `${hours}hr left`;
  } else if (days <= 0 && hours <= 0 && minutes > 0) {
    return `${minutes}min left`;
  } else if (days <= 0 && hours <= 0 && minutes <= 0 && seconds > 0) {
    return `${seconds}s left`;
  } else {
    return <Box textStyle="statusDeal">Passed</Box>;
  }
};

export const Symbols = ({ address }) => {
  const [symbol, setSymbol] = useState("");
  const { Moralis } = useMoralis();

  useEffect(() => {
    Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });
  }, []);

  useEffect(() => {
    async function getTokenMetadata() {
      const option = { chain: "testnet", addresses: address };
      const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(option);
      return setSymbol(tokenMetadata[0].symbol);
    }
    getTokenMetadata();
  }, [address]);

  return symbol;
};

export const NFTName = ({ address }) => {
  const [NFTName, setNFTName] = useState("");
  const { Moralis } = useMoralis();

  useEffect(() => {
    Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });
  }, []);

  useEffect(() => {
    async function getNFTMetadata() {
      const option = { chain: "rinkeby", address: address };
      const NFT = await Moralis.Web3API.token.getNFTMetadata(option);
      return setNFTName(NFT.name);
    }
    getNFTMetadata();
  }, [address]);

  return NFTName;
};