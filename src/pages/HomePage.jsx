import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "../components/Auth/Login";
import SignUp from "../components/Auth/SignUp";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  console.log("HomePage component");
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || "";

    if (userInfo) {
      navigate("/chats");
    }
  }, []);

  return (
    <div className="App">
      <Container maxW="xl" centerContent>
        <Box
          // d="flex"
          // justifyContent="center"
          textAlign={"center"}
          p={3}
          bg={"#7fffd483"}
          w="100%"
          m="40px 0 15px 0"
          borderRadius="lg"
          borderWidth="1px"
        >
          <Text
            fontSize={"2xl"}
            fontFamily={"Work sans"}
            color={"#fff"}
            fontWeight={"500"}
          >
            FREE-CHAT-APP
          </Text>
        </Box>
        <Box
          bg="#ffffff"
          width="100%"
          padding={4}
          borderRadius="lg"
          borderWidth="1px"
          color="#000"
        >
          <Tabs variant="soft-rounded">
            <TabList mb={"1em"}>
              <Tab width="50%">Login</Tab>
              <Tab width="50%">Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {/* <p>one!</p> */}
                <Login />
              </TabPanel>
              <TabPanel>
                {/* <p>two!</p> */}
                <SignUp />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </div>
  );
}

export default HomePage;
