import { Input, Spinner, useToast } from "@chakra-ui/react";
import { useState } from "react";
import styles from "./UploadBox.module.css";
import Axios from "axios";
import { useChatContext } from "../../context/ChatProvider";

function UploadBox({ onCloseBox, messages, onSetMessages }) {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log("UploadBox Component");
  console.log({ image });

  const {
    selectedChat,
    fetchChatsAgain,
    setFetchChatsAgain,
    socket,
    onlineUsers,
    user,
  } = useChatContext();

  const toast = useToast();

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

  async function sendImageMessage(e) {
    e.preventDefault();

    if (image === null) {
      toast({
        title: "Please Select an Image File  !!!",
        description: `Unable to send the Message `,
        status: "warning",
        duration: "4000",
        isClosable: true,
        position: "top",
      });
      return;
    }

    //Extract data from the form fields.
    const formdata = new FormData(e.currentTarget);

    //Converting the form data into actual JS object.
    const data = Object.fromEntries(formdata);

    console.log({ imageData: data });

    // Check if the 'pic' is a valid File object or not.
    if (data.pic instanceof File && data.pic?.name) {
      let imageUrl = await uploadImageToCloudinary();

      console.log({ imageUrl });

      if (!imageUrl) {
        toast({
          title: "Image File is corrupted  !!!",
          description: `Invalid Image File Uploaded`,
          status: "warning",
          duration: "4000",
          isClosable: true,
          position: "top",
        });
        return;
      }

      //Logic to create a 'message' doc. containing 'imageUrl' & hence updating the coressp. 'chat' doc.
      try {
        setIsLoading(true);
        const { data } = await Axios.post(
          "https://chat-application-back-end.onrender.com/api/message/imgmessage",
          { content: "", chatId: selectedChat._id, imageURL: imageUrl },
          { withCredentials: true }
        );

        console.log({ messageImage: data });
        localStorage.setItem("messages", JSON.stringify([...messages, data]));
        onSetMessages([...messages, data]);
        setFetchChatsAgain(!fetchChatsAgain);
        socket.emit("new message", data);
        handleNotificationsForOfflineUsers(onlineUsers, data, user);
        toast({
          title: "Message with Image sent Successfully !!",
          status: "success",
          duration: "4000",
          isClosable: true,
          position: "top",
        });
        onCloseBox(false);
        e.target.reset();
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
        setIsLoading(false);
      }
    }
  }

  return (
    <div className={styles.UploadContainer}>
      <div className={styles.innerModal}>
        <form onSubmit={sendImageMessage} className={styles.imageBOX}>
          <label>📷 Upload Image</label>
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            name="pic"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button className={styles.imageBtn}>
            {isLoading ? (
              <Spinner
                size="xs"
                width={4}
                height={4}
                alignSelf="center"
                ml={4} // Adds a left margin of 4 (equivalent to 1rem or 16px)
                thickness="2px"
                speed="0.65s"
                color="teal.500"
              />
            ) : (
              "Send Image ▶ "
            )}
          </button>
        </form>
        <button className={styles.closeBtn} onClick={() => onCloseBox(false)}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}

export default UploadBox;
