import { useEffect, useState } from "react";
import { Spinner } from "@chakra-ui/react";
import Axios from "axios";
import { useChatContext } from "../context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useNavigate } from "react-router-dom";

function ChatPage() {
  const { user, setUser } = useChatContext();
  const navigate = useNavigate();

  console.log("ChatPage component");

  useEffect(() => {
    console.log("ChatPage UseEffect");
    // const getUser = JSON.parse(localStorage.getItem("userInfo"));

    if (!user) {
      navigate("/");
    }
  }, []);

  return (
    <>
      {user ? (
        <div style={{ width: "100%" }}>
          <SideDrawer />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
              height: "91.5vh",
              gap: "12px",
              width: "100%",
            }}
          >
            <MyChats />
            <ChatBox />
          </div>
        </div>
      ) : (
        <p>User is Not Logged in Yet !!!</p>
      )}
    </>
  );
}

export default ChatPage;

/*
     {
      isLoading ? (
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
       ) : (
        "chat added"
    )}

*/
