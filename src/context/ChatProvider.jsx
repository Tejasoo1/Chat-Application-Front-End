import { createContext, useContext, useEffect, useState } from "react";

/*
  Render Server Backend URL:- https://chat-application-back-end.onrender.com
  Local Server Backend URL:- http://localhost:5000
*/

import io from "socket.io-client";
// const ENDPOINT = "http://localhost:5000";
const ENDPOINT = "https://chat-application-back-end.onrender.com";

const ChatContext = createContext();

function ChatProvider({ children }) {
  const [user, setUser] = useState({});
  const [selectedChat, setSelectedChat] = useState({});
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);
  const [notificationFromBackend, setNotificationFromBackend] = useState([]);
  const [fetchChatsAgain, setFetchChatsAgain] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  console.log("ChatProvider Context");
  console.log({ user });
  console.log({ selectedChat });

  useEffect(() => {
    console.log("useEffect-1,Socket connecting");
    const currSocket = io(ENDPOINT); // Backend URL
    setSocket(currSocket);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
        fetchChatsAgain,
        setFetchChatsAgain,
        onlineUsers,
        setOnlineUsers,
        socket,
        notificationFromBackend,
        setNotificationFromBackend,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const data = useContext(ChatContext);

  if (data === undefined) {
    throw new Error(
      "You are accessing the Context Provider's value object outside its scope !!!"
    );
  }

  return data;
}

export default ChatProvider;
