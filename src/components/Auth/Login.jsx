import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../../context/ChatProvider";

function Login() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  console.log("Login Component");

  const { setUser } = useChatContext();

  const navigate = useNavigate();

  function handleClick() {
    console.log("handleClick");
    setShow((sh) => !sh);
  }

  function submitHandler(e) {
    console.log("submitHandler");
    e.preventDefault();

    //Logic for extracting the entered data into form fields
    const formData = new FormData(e.currentTarget);

    //data variable, then will contain an object having the collected input field's data.
    const data = Object.fromEntries(formData); //here

    console.log(data);

    //Logic to send Login Details to the backend .
    setLoading(true);
    Axios.post(
      "https://chat-application-back-end.onrender.com/api/user/login",
      data,
      {
        withCredentials: true, // This option is necessary to include cookies in the request
      }
    )
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("userInfo", JSON.stringify(res.data));

        toast({
          title: "Success",
          description: "Login Successfull",
          status: "success",
          duration: 9000,
          isClosable: true,
        });

        e.target.reset();
        setUser(res.data);
        setLoading(false);
        navigate("/chats");
      })
      .catch((err) => {
        console.log(err);

        toast({
          title: "Login Unsuccessfull",
          description: "Login Details are Wrong",
          status: "error",
          duration: 9000,
          isClosable: true,
        });

        setLoading(false);
      });
  }

  function handleGuest(e) {
    e.preventDefault;
    const email = "guest123@gmail.com";
    const password = "123456";

    const guestDetails = {
      email,
      password,
    };

    console.log(guestDetails);

    //Logic to send Login Details to the backend .
    setLoading(true);
    Axios.post(
      "https://chat-application-back-end.onrender.com/api/user/login/guest",
      { ...guestDetails },
      {
        withCredentials: true, // This option is necessary to include cookies in the request
      }
    )
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("userInfo", JSON.stringify(res.data));

        toast({
          title: "Success",
          description: "Login Successfull",
          status: "success",
          duration: 9000,
          isClosable: true,
        });

        setUser(res.data);
        setLoading(false);
        navigate("/chats");
      })
      .catch((err) => {
        console.log(err);

        toast({
          title: "Login Unsuccessfull",
          description: "Login Details are Wrong",
          status: "error",
          duration: 9000,
          isClosable: true,
        });

        setLoading(false);
      });
  }

  return (
    <form onSubmit={submitHandler}>
      <VStack spacing={5} color="#000">
        <FormControl id="email" isRequired>
          <FormLabel>Enter your Email</FormLabel>
          <Input type="email" placeholder="Enter Your Email" name="email" />
        </FormControl>

        <FormControl id="password" isRequired>
          <FormLabel>Enter your Password</FormLabel>
          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter Your Password"
              name="password"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "HIDE" : "SHOW"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          isLoading={loading} // Shows loading spinner when uploading is true
          disabled={loading} // Disables the button when uploading is true
          style={{ marginTop: "15px" }}
        >
          Login In
        </Button>

        <Button
          variant="solid"
          colorScheme="red"
          width="100%"
          isLoading={loading} // Shows loading spinner when uploading is true
          disabled={loading} // Disables the button when uploading is true
          onClick={handleGuest}
        >
          Get Guest User Credentials
        </Button>
      </VStack>
    </form>
  );
}

export default Login;
