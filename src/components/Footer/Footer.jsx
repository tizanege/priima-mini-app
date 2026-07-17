// import React from "react";
import { Box } from "@chakra-ui/react";
import thumbnail from "../../assets/thumbnail.png";

const Footer = () => {
  return (
    <Box backgroundColor=" #fff" padding="20px">
      <Box
        display="flex"
        alignItems="center"
        maxWidth="827.723px"
        margin="auto"
      >
        <img src={thumbnail} alt="footer" />
      </Box>
    </Box>
  );
};

export default Footer;
