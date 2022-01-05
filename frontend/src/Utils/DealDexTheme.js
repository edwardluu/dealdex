import { extendTheme } from "@chakra-ui/react";

const DealDexTheme = extendTheme({
  layerStyles: {
    dealTableWrap: {
      width: "610px",
      height: "277px",
      borderRadius: "4px",
      padding: "26px 40px 55px",
      border: "1px",
      borderColor: "gray.200",
      boxShadow: "base",
      textAlign: "left",
    },
  },
  textStyles: {
    title: {
      fontSize: "72px",
      fontWeight: "700",
      lineHeight: "100%",
      color: "black",
    },
    titleSection: {
      fontSize: "48px",
      fontWeight: "700",
      lineHeight: "100%",
      color: "black",
    },
    subtitle: {
      fontSize: "24px",
      fontWeight: "400",
      lineHeight: "150%",
      color: "black",
      letterSpacing: "1px",
    },
    titleDeal: {
      fontSize: "36px",
      fontWeight: "700",
      lineHeight: "120%",
      color: "black",
    },
    subTitleDeal: {
      fontSize: "24px",
      fontWeight: "400",
      lineHeight: "150%",
      color: "gray.500",
    },
    statusDeal: {
      color: "red.500"
    }
  },
  components: {
    Button: {
      variants: {
        dealCreate: {
          background: "#7879F1",
          color: "white",
          mt: "0px",
          width: "380px",
          fontWeight: "600",
          fontSize: "18px",
          lineHeight: "129%",
          size:'lg'
        },
      },
    },
    Badge: {
      variants: {
        verified: {
          background: "#5D5FEF",
          color: "white",
        },
      },
    },
    Table: {
      variants: {
        dealTable: {
          table: {
            bg: "#F7FAFC",
            borderRadius: "4px",
            border: "1px",
            borderColor: "gray.200",
            boxShadow: "base",
          },
          th: {
            color: "gray.700",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "20px",
            lineHeight: "100%",
            textTransform: "capitalization",
          },
          td: {
            color: "gray.700",
            textAlign: "center",
            fontWeight: "400",
            fontSize: "20px",
            lineHeight: "100%",
          },
        },
      },
    },
  },
});

export default DealDexTheme;
