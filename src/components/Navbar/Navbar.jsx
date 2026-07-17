// import React from "react";
import { Box, Text } from "@chakra-ui/react";
import PropTypes from "prop-types"; // Import PropTypes

const Navbar = ({ siteLogo, siteName }) => {
  return (
    <Box backgroundColor=" #fff" padding="20px">
      <Box display="flex" alignItems="center" maxWidth="1000px" margin="auto">
        {siteLogo ? ( // If siteLogo is provided, render it
          <img
            src={siteLogo}
            alt="Logo"
            style={{
              maxWidth: "168px",
            }}
          />
        ) : (
          <Text
            color="#303030"
            fontSize="24px"
            fontWeight="700"
            textTransform="uppercase"
          >
            {siteName || "Logo"}
          </Text>
        )}{" "}
      </Box>
    </Box>
  );
};

Navbar.propTypes = {
  siteLogo: PropTypes.string,
  siteName: PropTypes.string,
};

export default Navbar;
