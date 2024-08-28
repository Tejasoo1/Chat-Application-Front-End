import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import js-cookie
import styles from "./ProfileInfo.module.css";
import { useChatContext } from "../context/ChatProvider";

function ProfileInfo({ onCloseProfile, onOpenModal }) {
  console.log("ProfileInfo component");
  const navigate = useNavigate();

  const { setChats, setSelectedChat, socket, setOnlineUsers } =
    useChatContext();

  function handleModal() {
    onCloseProfile(false);
    onOpenModal(true);
  }

  /*
    1] npm install js-cookie
       If you prefer a more convenient approach, you can use a library like 'js-cookie', which simplifies 
       cookie handling.

    2] This library provides a cleaner API for working with cookies in JavaScript.   
  */

  function handleLogout() {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("messages");
    setChats([]);
    setSelectedChat({});
    setOnlineUsers([]);
    socket.disconnect();

    // Remove the token from cookies
    Cookies.remove("token");
    navigate("/");
  }

  return (
    <div className={styles.ProfileCont}>
      <button className={styles.BtnProfile} onClick={handleModal}>
        My Profile
      </button>
      <button className={styles.BtnProfile} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default ProfileInfo;
