// import React from "react";
import { Box, Button, Grid, Link, Text, useTheme } from "@chakra-ui/react";
import PropTypes from "prop-types"; // Import PropTypes

const UserDetails = ({
  userDetails,
  loginUrl,
  isLoading,
  infoText,
  loginPrima,
}) => {
  const theme = useTheme();

  return (
    <>
      <Box
        mt="59px"
        borderRadius="10px"
        // height="598px"
        background="#E6F2F3"
        boxShadow="0px 2px 5px 0px rgba(33, 91, 124, 0.15)"
        padding="50px 130px"
      >
        <Box>
          <Text fontSize="20px" sx={theme.fonts.primary}>
            {infoText}
          </Text>
        </Box>

        {isLoading ? (
          <Text>Loading User Details</Text>
        ) : (
          <Box mt="64px">
            <Grid templateColumns="repeat(2, 1fr)" gap="10px">
              <Box>
                {userDetails.username?.map((item, index) => (
                  <Box key={`${item.label}-${index}`}>
                    <Text fontWeight="500" color={theme.colors.primary}>
                      {item.label}
                    </Text>
                    <Text fontWeight="400" color={theme.colors.primary}>
                      {item.value}
                    </Text>
                  </Box>
                ))}
                <Box mt="34px">
                  {userDetails.password?.map((item, index) => (
                    <Box key={`${item.label}-${index}`}>
                      <Text color={theme.colors.primary} fontWeight="500">
                        {item.label}
                      </Text>
                      <Text color={theme.colors.primary} fontWeight="400">
                        {item.value}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box>
                {userDetails.basic?.map((item, index) => (
                  <Box key={`${item.label}-${index}`}>
                    <Text color={theme.colors.primary} fontWeight="500">
                      {item.label}
                    </Text>
                    <Text color={theme.colors.primary} fontWeight="500">
                      {item.value}
                    </Text>
                  </Box>
                ))}
                <Box mt="14px">
                  {userDetails.additional?.map((item, index) => (
                    <Box key={`${item.label}-${index}`}>
                      <Text color={theme.colors.primary} fontWeight="500">
                        {item.label}
                      </Text>
                      <Text color={theme.colors.primary} fontWeight="500">
                        {item.value}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Box>
        )}

        <Button
          mt="86px"
          display="flex"
          width="200px"
          color="#FFF"
          background={theme.colors.primary}
          sx={{
            "&:hover": {
              background: theme.colors.primary,
            },
          }}
        >
          <Link target="_blank" href={loginUrl}>
            {loginPrima}
          </Link>
        </Button>
      </Box>
    </>
  );
};

UserDetails.propTypes = {
  userDetails: PropTypes.object, // You can define a more specific PropTypes shape here if needed
  loginUrl: PropTypes.string,
  isLoading: PropTypes.bool,
  infoText: PropTypes.string,
  loginPrima: PropTypes.string,
};

export default UserDetails;
