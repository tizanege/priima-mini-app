// import React from "react";
import { Box, Text, useTheme } from "@chakra-ui/react";
import CourseHeading from "./components/CourseHeading/CourseHeading";
import UserDetails from "./components/UserDetails";
import { useVerification } from "./hooks/useVerification";
import UserForm from "./components/UserForm";
import Loader from "../src/assets/Loader.gif";
import Navbar from "../src/components/Navbar/Navbar";
import Footer from "../src/components/Footer/Footer";
import { useEffect, useState } from "react";

function App() {
  const theme = useTheme();
  const { data, isLoading } = useVerification();
  const [successMessage, setSuccessMessage] = useState("");

  const password = localStorage.getItem("password");
  if (password && data) {
    if (data.user_details.password) {
      data.user_details.password = JSON.parse(password);
    }
  }
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("password");
    };

    const handleRouteChange = () => {
      localStorage.removeItem("password");
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {});

  return isLoading ? (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        background="transparent"
      >
        <img
          src={Loader}
          style={{
            width: "100px",
          }}
        />
      </Box>
    </>
  ) : !data ? (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Text fontSize="30px" color={theme.colors.primary}>
        Oops, you dont have access please register.....!
      </Text>
    </Box>
  ) : data.status === "error" ? (
    <>
      <Navbar siteLogo={data?.site_logo_link} siteName={data?.site_name} />
      <Box
        height="calc(100vh - (140px + 76px))"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="30px" color={theme.colors.primary}>
          {data?.message}
        </Text>
      </Box>
      <Footer />
    </>
  ) : (
    <>
      <Navbar siteLogo={data?.site_logo_link} siteName={data?.site_name} />
      <Box maxWidth="1000px" margin="0 auto" padding="37px 40px">
        <CourseHeading
          courses={data?.courses}
          notes={data?.notes}
          status={data?.user_status}
          message={successMessage}
          productTitle={data?.product}
        />
        {data?.user_status === "existing_user" ? (
          <UserDetails
            loginUrl={data?.priima_login}
            userDetails={data?.user_details}
            isLoading={isLoading}
            infoText={data?.info_text}
            loginPrima={data?.login_btn_text}
          />
        ) : (
          <UserForm
            userDetails={data?.form_fields}
            notes={data?.notes}
            setSuccessMessage={setSuccessMessage}
            infoText={data?.info_text}
            formSubmitText={data?.form_submit_btn_text}
          />
        )}
      </Box>
      <Footer />
    </>
  );
}

export default App;
