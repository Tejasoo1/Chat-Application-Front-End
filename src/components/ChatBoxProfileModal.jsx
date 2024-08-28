import { useEffect, useState } from "react";
import styles from "./ChatBoxProfileModal.module.css";
import { useChatContext } from "../context/ChatProvider";
import { Spinner, useToast } from "@chakra-ui/react";
import Axios from "axios";

function ChatBoxProfileModal({ onClose }) {
  const [updateGroupChatName, setUpdateGroupChatName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();
  console.log("ChatBoxProfileModal Comp.");
  console.log({ searchResults });

  const { selectedChat, user, setSelectedChat, setChats, chats } =
    useChatContext();
  console.log({ selectedChat });

  async function handleRemoveGroup() {
    if (user._id !== selectedChat.groupAdmin._id) {
      console.log("Not a Admin");
      toast({
        title: "You are Not a Admin of this Group !!!",
        description: "You can not modify this Group",
        status: "warning",
        duration: "4000",
        isClosable: true,
        position: "top",
      });

      return;
    }

    try {
      setRenameLoading(true);
      const { data } = await Axios.delete(
        "https://chat-application-back-end.onrender.com/api/chat/groupdelete",
        {
          headers: { "Content-Type": "application/json" },
          data: { chatId: selectedChat._id }, // Pass chatId here
          withCredentials: true,
        }
      );
      console.log(data);
      setSelectedChat({});
      setChats((chats) => chats.filter((el) => el._id !== data._id));
      toast({
        title: "Group Successfully Deleted !!",
        status: "success",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Error Occured !!",
        description: `Unable to Delete the Group (Server Issue)`,
        status: "error",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
    } finally {
      setRenameLoading(false);
    }
  }

  async function handleRemoveUser(userToRemove) {
    if (user._id !== selectedChat.groupAdmin._id) {
      console.log("Not a Admin");
      toast({
        title: "You are Not a Admin of this Group !!!",
        description: "You can not modify this Group",
        status: "warning",
        duration: "4000",
        isClosable: true,
        position: "top",
      });

      return;
    }

    if (selectedChat.groupAdmin._id === userToRemove._id) {
      toast({
        title: "Admin can not be Removed !!!",
        description: "Delete The Group Instead !!",
        status: "warning",
        duration: "4000",
        isClosable: true,
        position: "top",
      });

      return;
    }

    try {
      setRenameLoading(true);
      const { data } = await Axios.put(
        "https://chat-application-back-end.onrender.com/api/chat/groupremove",
        { chatId: selectedChat._id, userId: userToRemove._id },
        { withCredentials: true }
      );
      console.log(data);
      setSelectedChat(data);
      setChats((chats) => chats.map((el) => (el._id === data._id ? data : el)));
      toast({
        title: "User successfully Removed from the Group Chat !!",
        status: "success",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Error Occured !!",
        description: `Unable to Remove the User (Server Issue)`,
        status: "error",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
    } finally {
      setRenameLoading(false);
    }
  }

  async function handleRename() {
    if (user._id !== selectedChat.groupAdmin._id) {
      console.log("Not a Admin");
      toast({
        title: "You are Not a Admin of this Group !!!",
        description: "You can not modify this Group",
        status: "warning",
        duration: "4000",
        isClosable: true,
        position: "top",
      });

      return;
    }

    if (!updateGroupChatName.trim()) {
      toast({
        title: "Please fill the Group Name field !!",
        status: "warning",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setRenameLoading(true);
      const { data } = await Axios.put(
        "https://chat-application-back-end.onrender.com/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: updateGroupChatName,
        },
        { withCredentials: true }
      );
      console.log(data);
      setSelectedChat(data);
      setUpdateGroupChatName("");
      setChats((chats) => chats.map((el) => (el._id === data._id ? data : el)));
      toast({
        title: "Group Chat Name Successfully Updated !!",
        status: "success",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
      onClose(false);
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Error Occured !!",
        description: `Group Chat Name could not be updated`,
        status: "error",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
    } finally {
      setRenameLoading(false);
    }
  }

  //Add the users to the Group Chat.
  async function handleAddUser(userToAdd) {
    console.log(userToAdd);

    if (user._id !== selectedChat.groupAdmin._id) {
      console.log("Not a Admin");
      toast({
        title: "You are Not a Admin of this Group !!!",
        description: "You can not modify this Group",
        status: "warning",
        duration: "4000",
        isClosable: true,
        position: "top",
      });

      return;
    }

    if (
      selectedChat.users.find((el) => el._id === userToAdd._id) !== undefined
    ) {
      toast({
        title: "User already added !!",
        status: "warning",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
      return;
    }

    //Logic to add a user to the selected Group Chat through backend.
    try {
      setRenameLoading(true);
      const { data } = await Axios.put(
        "https://chat-application-back-end.onrender.com/api/chat/groupadd",
        { chatId: selectedChat._id, userId: userToAdd._id },
        { withCredentials: true }
      );
      console.log(data);
      setSelectedChat(data);
      setSearchQuery("");
      setChats((chats) => chats.map((el) => (el._id === data._id ? data : el)));
      toast({
        title: "User successfully Added to the Group Chat !!",
        status: "success",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Error Occured !!",
        description: `Unable to Add the User (Server Issue)`,
        status: "error",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
    } finally {
      setRenameLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await Axios.get(
        `https://chat-application-back-end.onrender.com/api/user/?search=${searchQuery}`,
        { withCredentials: true }
      );

      console.log({ data });
      setSearchResults(data);
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Error Occured !!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: "4000",
        isClosable: true,
        position: "top-left",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("UseEffect handleSearch");
    handleSearch();
  }, [searchQuery.length]);

  const isSelectedChat = Object.keys(selectedChat).length;

  return (
    <>
      {isSelectedChat && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => onClose(false)}
            >
              &times;
            </button>
            <h1 className={styles.profileName}>{selectedChat.chatName}</h1>
            {/* render selected users */}
            {selectedChat.users.length > 0 && (
              <div className={styles.userItemContainer}>
                {selectedChat.users.map((selectUser) => {
                  return (
                    <div
                      key={selectUser._id}
                      className={`${styles.userSelectItem} ${
                        user._id === selectUser._id ? styles.AdminUser : ""
                      }`}
                    >
                      {user._id === selectUser._id ? (
                        <span className={styles.AdminContainer}>
                          <span className={styles.AdminName}>(ADMIN)</span>
                          {selectUser.name}
                        </span>
                      ) : (
                        <span>{selectUser.name}</span>
                      )}
                      <button
                        className={styles.userBtn}
                        onClick={() => handleRemoveUser(selectUser)}
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className={styles.modalBody}>
              <div className={styles.updateGroupName}>
                <input
                  type="text"
                  placeholder="Group Name"
                  className={styles.inputField}
                  value={updateGroupChatName}
                  onChange={(e) => setUpdateGroupChatName(e.target.value)}
                />
                <button className={styles.updateBtn} onClick={handleRename}>
                  Update
                </button>
              </div>
              <input
                type="text"
                placeholder="Add Users eg. John, Jenny, etc..."
                className={styles.inputField}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Render searched users */}
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            ) : (
              searchResults.length > 0 && (
                <ul className={styles.userList}>
                  {searchResults.map((user) => (
                    <li
                      key={user._id}
                      className={styles.userItem}
                      onClick={() => handleAddUser(user)}
                    >
                      <img
                        src={user.pic}
                        alt={user.name}
                        className={styles.avatar}
                      />
                      <div>
                        <p className={styles.userName}>{user.name}</p>
                        <p className={styles.userEmail}>Email: {user.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
            <button className={styles.BtnProfile} onClick={handleRemoveGroup}>
              Delete Group
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBoxProfileModal;
