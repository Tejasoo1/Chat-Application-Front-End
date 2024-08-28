import { useEffect, useState } from "react";
import styles from "./SideDrawer.module.css";
import { useChatContext } from "../../context/ChatProvider";
import ProfileInfo from "../ProfileInfo";
import ProfileModal from "../ProfileModal";
import ModalDrawer from "../ModalDrawer";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";
import NotificationTab from "../NotificationTab";

import Axios from "axios";

function SideDrawer() {
  const [showProfile, setShowProfile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showNotificationTab, setShowNotificationTab] = useState(false);

  const { user, notification, setNotification, setNotificationFromBackend } =
    useChatContext();
  console.log(user);

  console.log("SideDrawer component");

  const toggleDrawer = () => {
    setShowSidePanel((show) => !show);
  };

  function handleNotificationBell() {
    setShowNotificationTab(!showNotificationTab);
  }

  async function fetchNotifications() {
    if (!user._id) return;

    try {
      const { data } = await Axios.get(
        `https://chat-application-back-end.onrender.com/api/notification/${user._id}`,
        { withCredentials: true }
      );
      console.log({ notifications: data });
      setNotification(data.map((el) => el.currMessage));
      setNotificationFromBackend(data.map((el) => el));
    } catch (err) {
      console.log(err.message);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search User"
            className={styles.searchInput}
            onFocus={toggleDrawer} // Open drawer on focus
          />
          <button className={styles.SearchBtn}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
        <div className={styles.logo}>Talk-A-Tive</div>
        <div className={styles.profileContainer}>
          {/* Notification bell icon */}
          <span onClick={handleNotificationBell} style={{ cursor: "pointer" }}>
            <span className={styles.bellNotify}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
            </span>
            <i className="fas fa-bell"></i>
          </span>
          <div
            className={styles.picContainer}
            onClick={() => setShowProfile((sh) => !sh)}
          >
            <img
              src={user.pic} // Replace with actual profile image URL
              alt="Profile"
              className={styles.profileImage}
            />
            <button>
              <i className={`fas fa-chevron-down ${styles.dropdownIcon}`}></i>
            </button>
          </div>
        </div>
        {showNotificationTab && (
          <NotificationTab onCloseTab={setShowNotificationTab} />
        )}
        {showProfile && (
          <ProfileInfo
            onCloseProfile={setShowProfile}
            onOpenModal={setShowModal}
          />
        )}
        {showModal && <ProfileModal onClose={setShowModal} />}
        {showSidePanel && (
          <ModalDrawer isOpen={showSidePanel} onClose={setShowSidePanel} />
        )}
      </header>
    </>
  );
}

export default SideDrawer;
