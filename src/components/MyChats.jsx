import { useEffect, useState } from "react";
import { useChatContext } from "../context/ChatProvider";
import { useToast } from "@chakra-ui/react";
import styles from "./MyChats.module.css";

import Axios from "axios";
import GroupChatModal from "./GroupChatModal";

function MyChats() {
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);

  const {
    user,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    fetchChatsAgain,
    onlineUsers,
    setOnlineUsers,
    socket,
  } = useChatContext();

  const toast = useToast();

  console.log("MyChats component");
  console.log({ chats });
  console.log({ onlineUsers });

  /*
   1] We need to fetch all the chat docs.(objects), that the logged in user is part of.
      This will in-turn give us the information about, the users with whom the logged in
      user chatted with. 
  
  */

  const fetchAllChats = async () => {
    try {
      const { data } = await Axios.get(
        "https://chat-application-back-end.onrender.com/api/chat/",
        {
          withCredentials: true,
        }
      );
      console.log(data);

      setChats(data || []);
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Error Occured!!",
        description: "Failed to Load the chats",
        status: "error",
        duration: "4000",
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    console.log("MyChats UseEffect");
    fetchAllChats();
  }, [fetchChatsAgain]);

  useEffect(() => {
    console.log("useEffect-2-socketUsage");

    socket.on("all users", (usersConnected) => {
      console.log({ usersConnected });
      setOnlineUsers(usersConnected);
    });

    socket.on("user online", (userId) => {
      console.log(`user connected ${userId}`);
      setOnlineUsers((prevUsers) => [...prevUsers, userId]);
    });

    socket.on("user offline", (userId) => {
      console.log(`disconnected user's ${userId}`);
      setOnlineUsers((prevUsers) => prevUsers.filter((id) => id !== userId));
    });
    return () => {
      socket.off("all users");
      socket.off("user online");
      socket.off("user offline");
    };
  }, []);

  const getChatName = (loggedUser, users) => {
    // console.log(loggedUser);
    // console.log(users);
    // console.log(loggedUser._id === users[0]._id);
    // console.log(users[1].name);
    return loggedUser._id === users[0]._id ? users[1].name : users[0].name;
  };

  function handleGroupChat() {
    setShowGroupChatModal(true);
  }

  function isUserOnline(loggedInUser, users) {
    let otherUserId =
      loggedInUser._id === users[0]._id ? users[1]._id : users[0]._id;

    let userOnline = onlineUsers.includes(otherUserId);
    return userOnline;
  }

  async function handleDeleteChat(chatObj) {
    console.log(chatObj);

    try {
      const { data } = await Axios.delete(
        "https://chat-application-back-end.onrender.com/api/chat/deletechat",
        {
          headers: { "Content-Type": "application/json" },
          data: { chatId: chatObj._id },
          withCredentials: true,
        }
      );

      console.log(data.deletedChatDoc);
      setChats(chats.filter((ct) => ct._id !== data.deletedChatDoc._id));

      if (selectedChat._id === data.deletedChatDoc._id) {
        setSelectedChat({});
      }
      toast({
        title: "Chat Successfully Deleted!!",
        description: "Deleted Chat",
        status: "success",
        duration: "4000",
        isClosable: true,
        position: "top-left",
      });
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Error Occured!!",
        description: "Failed to Delete the chat",
        status: "error",
        duration: "4000",
        isClosable: true,
        position: "bottom-left",
      });
    }
  }

  return (
    <>
      <div className={styles.myChatsContainer}>
        <div className={styles.header}>
          <h2>My Chats</h2>
          <button className={styles.newGroupButton} onClick={handleGroupChat}>
            New Group Chat +
          </button>
        </div>
        <div className={styles.chatList}>
          {/*
           <div className={styles.chatItem}>
            <span>Time</span>
            <p>Roadside Coder: yo</p>
          </div> 
          */}
          {chats.length > 0 &&
            chats.map((chat) => {
              return (
                <div
                  key={chat._id}
                  className={`${styles.chatItem} ${
                    selectedChat._id === chat._id ? styles.selecChat : ""
                  }`}
                  onClick={() => {
                    localStorage.removeItem("messages");
                    setSelectedChat(chat);
                  }}
                >
                  <span>
                    {!chat.isGroupChat
                      ? getChatName(user, chat.users)
                      : chat.chatName}
                    {!chat.isGroupChat ? (
                      isUserOnline(user, chat.users) ? (
                        <span className={styles.isOnline}>{"online"}</span>
                      ) : (
                        <span className={styles.isOffline}>{"offline"}</span>
                      )
                    ) : (
                      ""
                    )}
                  </span>
                  {chat?.latestMessage?.sender.email ? (
                    <p>
                      {chat.latestMessage.sender.name}:{" "}
                      {!chat.latestMessage.content
                        ? "image sent"
                        : chat.latestMessage.content}
                    </p>
                  ) : (
                    ""
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              );
            })}
        </div>
      </div>
      {showGroupChatModal && <GroupChatModal onClose={setShowGroupChatModal} />}
    </>
  );
}

export default MyChats;

/*

 <div className={styles.chatItem}>
          <span>Piyush</span>
        </div>
        <div className={styles.chatItem}>
          <span>Guest User</span>
          <p>Guest user: woooo</p>
        </div>
        <div className={styles.chatItem}>
          <span>Time</span>
          <p>Roadside Coder: yo</p>
        </div>
        <div className={styles.chatItem}>
          <span>RoadSide Coder Fam</span>
          <p>Guest User: 👏❤️❤️❤️</p>
        </div>
        <div className={styles.chatItem}>
          <span>Youtube Demo</span>
          <p>Guest User: ssup</p>
        </div>
        <div className={styles.chatItem}>
          <span>Karle Vedant Prasad</span>
          <p>hello there</p>
        </div>

*/
