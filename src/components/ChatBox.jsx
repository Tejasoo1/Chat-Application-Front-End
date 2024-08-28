import { useEffect, useState } from "react";
import { useChatContext } from "../context/ChatProvider";
import styles from "./ChatBox.module.css";
import ChatBoxProfileModal from "./ChatBoxProfileModal";
import { Spinner, useToast } from "@chakra-ui/react";

import Axios from "axios";
import ScrollableChat from "./ScrollableChat";
import TypingIndicator from "./miscellaneous/TypingIndicator";
import UploadBox from "./miscellaneous/UploadBox";

function ChatBox() {
  const {
    user,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    fetchChatsAgain,
    setFetchChatsAgain,
    notification,
    setNotification,
    socket,
    onlineUsers,
  } = useChatContext();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lodingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const toast = useToast();

  //Derived state
  const isChatSelected = Object.keys(selectedChat).length;

  console.log("ChatBox component");
  console.log({ messages });
  console.log({ chats });
  console.log({ socketConnected });
  console.log({ notification });

  //func. to handle offline user's notifications
  async function handleNotificationsForOfflineUsers(
    onlineUsersArr,
    messObj,
    loggedInUser
  ) {
    let otherUserId =
      loggedInUser?._id === messObj.chat.users[0]?._id
        ? messObj.chat.users[1]._id
        : messObj.chat.users[0]._id;

    let userOnline = onlineUsersArr.includes(otherUserId);

    if (!userOnline) {
      //Logic for creating a Notification document.
      try {
        const { data } = Axios.post(
          "https://chat-application-back-end.onrender.com/api/notification/create",
          { messageId: messObj._id, userId: otherUserId },
          { withCredentials: true }
        );

        console.log({ notificationCreated: data });
      } catch (err) {
        console.log(err.message);
      }
    }
  }

  async function fetchMessages() {
    if (!selectedChat?._id) return;

    console.log("fetcheMessages func.");
    try {
      setLoadingMessages(true);
      const { data } = await Axios.get(
        `https://chat-application-back-end.onrender.com/api/message/${selectedChat._id}`,
        { withCredentials: true }
      );
      console.log({ fetchedMessages: data });
      setMessages(data);
      localStorage.setItem("messages", JSON.stringify(data));

      /*
       1] With the 'id' of this chat doc/obj, i am going to create a new room, so that other 'users' can then 
          join this room.
  
      */
      socket.emit("join chat", selectedChat._id);
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Error Occured !!",
        description: `Failed to load the Messages (Server Issue)`,
        status: "error",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    // socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    // selectedChatCompare = selectedChat;

    return () => {
      // Leave the room when the component unmounts
      socket.emit("leaveRoom", selectedChat._id);
    };
  }, [selectedChat?._id]);

  useEffect(() => {
    console.log("message received useEffect");

    socket.on("message received", (newMessageReceived) => {
      console.log("socket: messageReceived event triggered");

      if (
        !Object.keys(selectedChat || {}).length ||
        selectedChat?._id !== newMessageReceived?.chat?._id
      ) {
        /*
        1] Logic to notify the logged in user, that incoming message is from other user(name) & that
           message is belonging to some other chat obj/doc. 
        2] If selectedChat is an empty object, that means non of the chat obj. is selected by the logged
           in user, so push all the incoming messages coming from other users & belonging to
           various diffn. chat objs., into notification. 
        */

        console.log({ newMessageReceived });
        console.log({ selectedChat });
        console.log("Notification section");

        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchChatsAgain(!fetchChatsAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
        setFetchChatsAgain(!fetchChatsAgain);
        localStorage.setItem(
          "messages",
          JSON.stringify([...messages, newMessageReceived])
        );
      }
    });

    return () => {
      // Clean up the socket event listener when the component unmounts or the effect re-runs
      socket.off("message received");
    };
  }, [selectedChat, socket, messages.length]);

  async function sendMessage(e) {
    if (e.key === "Enter" && newMessage.trim()) {
      console.log("Hit Enter");
      socket.emit("stop typing", selectedChat._id);
      setNewMessage("");
      try {
        setIsSendingMessage(true);
        const { data } = await Axios.post(
          "https://chat-application-back-end.onrender.com/api/message/",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          { withCredentials: true }
        );

        console.log({ newMessageDoc: data.message });
        console.log({ updatedChatDoc: data.updatedChat });
        setMessages([...messages, data.message]);
        localStorage.setItem(
          "messages",
          JSON.stringify([...messages, data.message])
        );

        setChats((chats) =>
          chats.map((el) =>
            el._id === data.updatedChat._id ? data.updatedChat : el
          )
        );
        socket.emit("new message", data.message);
        // selectedChatCompare = data.updatedChat;
        handleNotificationsForOfflineUsers(onlineUsers, data.message, user);
        toast({
          title: "Message sent Successfully !!",
          status: "success",
          duration: "4000",
          isClosable: true,
          position: "top",
        });
      } catch (err) {
        console.log(err.message);
        toast({
          title: "Error Occured !!",
          description: `Unable to send the Message (Server Issue)`,
          status: "error",
          duration: "4000",
          isClosable: true,
          position: "top",
        });
      } finally {
        setIsSendingMessage(false);
      }
    }
  }

  function typingHandler(e) {
    setNewMessage(e.target.value);

    //Typing Indicator Logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    // let lastTypingTime = new Date().getTime();
    // let timerLength = 3000;

    // setTimeout(() => {
    // let timeNow = new Date().getTime();
    // let timeDiff = timeNow - lastTypingTime;

    // if (timeDiff >= timerLength && typing) {
    //   socket.emit("stop typing", selectedChat._id);
    //   setTyping(false);
    // }
    // }, timerLength);

    /* Another method */
    let delay = 3000; //3s
    let timeoutId;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, delay);
  }

  const getChatName = (loggedUser, users) => {
    // console.log(loggedUser);
    // console.log(users);
    // console.log(loggedUser._id === users[0]._id);
    // console.log(users[1].name);
    return loggedUser._id === users[0]._id ? users[1].name : users[0].name;
  };

  return (
    <>
      {isChatSelected ? (
        <div className={styles.container}>
          <div className={styles.header}>
            {!selectedChat.isGroupChat
              ? getChatName(user, selectedChat.users)
              : selectedChat.chatName}
            {selectedChat.isGroupChat && (
              <button
                className={styles.iconButton}
                onClick={() => setShowProfileModal(true)}
              >
                <span className={styles.eyeIcon}>
                  <i className={`fas fa-eye ${styles.eyeIcon}`}></i>
                </span>
              </button>
            )}
            <button
              className={styles.iconButton}
              onClick={() => setSelectedChat({})}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
          <div className={styles.chatArea}>
            {/* Chat messages will go here */}
            {lodingMessages ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                // margin="auto"
                ml={405}
              />
            ) : (
              <div className={styles.messagesContainer}>
                {/* Display Messages */}
                <ScrollableChat messages={messages} />
              </div>
            )}
            <div onKeyDown={sendMessage} className={styles.inputContainerF}>
              {isTyping ? <TypingIndicator /> : <></>}
              <input
                type="text"
                placeholder="Enter the Message"
                className={styles.inputField}
                onChange={typingHandler}
                value={newMessage}
              />
              <button
                className={styles.UploadBtn}
                onClick={() => setShowUploadBox(!showUploadBox)}
              >
                <i
                  className="fa-solid fa-paperclip"
                  style={{ color: "#63E6BE" }}
                ></i>
              </button>
              {showUploadBox && (
                <UploadBox
                  onCloseBox={setShowUploadBox}
                  messages={messages}
                  onSetMessages={setMessages}
                />
              )}
              {isSendingMessage ? (
                <Spinner
                  size="xs"
                  width={4}
                  height={4}
                  alignSelf="center"
                  position="absolute" // Sets the spinner's position to absolute
                  top={6} // Positions the spinner at the top
                  right={20} // Positions the spinner at the left
                  ml={4} // Adds a left margin of 4 (equivalent to 1rem or 16px)
                  thickness="2px"
                  speed="0.65s"
                  color="teal.500"
                />
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.BlankContainer}>
          <p>Click on a user to start chatting</p>
        </div>
      )}

      {showProfileModal && (
        <ChatBoxProfileModal onClose={setShowProfileModal} />
      )}
    </>
  );
}

export default ChatBox;
