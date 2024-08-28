import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";

import { useState } from "react";

import { useToast } from "@chakra-ui/react";

import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../../context/ChatProvider";

/*

1] It looks like the issue is that your form doesn't trigger the 'submitHandler' because your "Sign Up" 
   button lacks the 'type="submit"' attribute.

2] In HTML forms, the default type for a button is "button", so it doesn't trigger the onSubmit event 
   of the form. To make the button submit the form, you need to set its type to "submit".

3] Adding type="submit" will ensure the button triggers the form's 'submit' event, which will call
   the 'submitHandler'.   

*/

function SignUp() {
  const [show, setShow] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  console.log("SignUp component");

  const toast = useToast();
  const navigate = useNavigate();

  const { setUser } = useChatContext();

  function handleSignUpWithoutPic(data, e, isPic) {
    isPic ? "" : setUploading(true);
    const uploadData = isPic ? { ...data, pic: isPic } : data;
    console.log({ uploadData });

    //Sending SingUp data without pic, to the backend.
    Axios.post(
      "https://chat-application-back-end.onrender.com/api/user/",
      {
        ...uploadData,
      },
      {
        withCredentials: true, // This option is necessary to include cookies in the request
      }
    )
      .then((res) => {
        console.log(res);
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        setUser(res.data);

        toast({
          title: "Success",
          description: "Your account has been created successfully.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });

        e.target.reset();
        navigate("/chats");
      })
      .catch((err) => {
        throw new Error("Failed to create the Account !!!");
      })
      .finally(() => {
        setUploading(false);
      });

    /*
      The finally block now has a proper function with () => {}, which ensures that it executes whether the 
      promise is resolved or rejected. 
    */
  }

  function handleClick() {
    console.log("handleClick");
    setShow((sh) => !sh);
  }

  async function uploadImageToCloudinary() {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "chat-app"); // Use your Cloudinary upload preset
    formData.append("cloud_name", "dizk5mov0");

    const cloud_name = "dizk5mov0";

    try {
      const response = await Axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, // Your Cloudinary endpoint
        formData
      );

      return response.data.secure_url; // Get the uploaded image URL
    } catch (error) {
      console.error("Error uploading image", error);
      return null;
    }
  }

  async function submitHandler(e) {
    console.log("submitHandler");
    e.preventDefault();

    //Logic for extracting the entered data into form fields
    const formData = new FormData(e.currentTarget);

    //data variable, then will contain an object having the collected input field's data.
    const data = Object.fromEntries(formData); //here

    console.log(data);

    // Check if the pic is a valid File object
    if (!(data.pic instanceof File && data.pic?.name)) {
      console.log("File is not uploaded");
      handleSignUpWithoutPic(data, e, "");
      return;
    }

    setUploading(true);
    const imageUrl = await uploadImageToCloudinary();

    if (!imageUrl) {
      toast({
        title: "Image Upload Failed",
        description: "There was an error uploading your image.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });

      setUploading(false);
      return;
    }

    console.log(data);
    console.log("Form Data with Image URL:", { ...data, pic: imageUrl });

    //Connecting to backend (sending the signup details to backend)
    handleSignUpWithoutPic(data, e, imageUrl);
  }

  return (
    <form onSubmit={submitHandler}>
      <VStack spacing={5} color="#000">
        <FormControl id="first-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input placeholder="Enter Your Name" name="username" />
        </FormControl>

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

        <FormControl id="confirmpassword" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="Confirm Password"
              name="confirmpassword"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "HIDE" : "SHOW"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="pic">
          <FormLabel>Upload Your Picture</FormLabel>
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            name="pic"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          isLoading={uploading} // Shows loading spinner when uploading is true
          disabled={uploading} // Disables the button when uploading is true
          style={{ marginTop: "15px" }}
        >
          Sign Up
        </Button>
      </VStack>
    </form>
  );
}

export default SignUp;

/*
Cloudinary details:-
API SECRET:- uGGbKm0fGypC1uRiVkgEjkAQFI4

API KEY:- 366232297987877

Your cloud name is: dizk5mov0.

CLOUDINARY_URL=cloudinary://<366232297987877>:<uGGbKm0fGypC1uRiVkgEjkAQFI4>@dizk5mov0


"https://api.cloudinary.com/v1_1/your_cloudinary_cloud_name/image/upload"

https://cloudinary-marketing-res.cloudinary.com/image/upload/w_1000/q_auto/f_auto/landmannalaugar_iceland.jpg

npm install @cloudinary/react @cloudinary/url-gen

*/
