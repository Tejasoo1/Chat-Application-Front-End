import { useChatContext } from "../context/ChatProvider";
import styles from "./NotificationTab.module.css";
import Axios from "axios";

function NotificationTab({ onCloseTab }) {
  const {
    notification,
    setNotification,
    user,
    setSelectedChat,
    notificationFromBackend,
    setNotificationFromBackend,
  } = useChatContext();

  const getChatName = (loggedUser, users) => {
    // console.log(loggedUser);
    // console.log(users);
    // console.log(loggedUser._id === users[0]._id);
    // console.log(users[1].name);
    return loggedUser._id === users[0]._id ? users[1].name : users[0].name;
  };

  async function removeNotificationFromBackend(notifyObj) {
    let isPresent = notificationFromBackend.find(
      (el) => el.currMessage._id === notifyObj._id
    );

    if (isPresent !== undefined) {
      console.log("Notification deleted from backend !!! ");

      try {
        //Logic to delete notification Obj./doc. from backend.
        const { data } = await Axios.delete(
          "https://chat-application-back-end.onrender.com/api/notification/notificationdelete",
          {
            headers: { "Content-Type": "application/json" },
            data: { notifyId: isPresent._id }, // Pass chatId here
            withCredentials: true,
          }
        );

        console.log({ deletedNotificationDoc: data });
        setNotificationFromBackend(
          notificationFromBackend.filter(
            (el) => el.currMessage._id !== notifyObj._id
          )
        );
      } catch (err) {
        console.log(err.message);
      }
    }
  }

  return (
    <div className={styles.notificationContainer}>
      {!notification.length && "No New Messages"}
      {notification.length !== 0 &&
        notification.map((notify) => {
          return (
            <li
              key={notify._id}
              className={styles.notifyItem}
              onClick={() => {
                setSelectedChat(notify.chat);
                setNotification((notification) =>
                  notification.filter((el) => el._id !== notify._id)
                );
                removeNotificationFromBackend(notify);
                onCloseTab(false);
              }}
            >
              {notify.chat.isGroupChat
                ? `New Message in ${notify.chat.chatName}`
                : `New Message from ${getChatName(user, notify.chat.users)}`}
            </li>
          );
        })}
    </div>
  );
}

export default NotificationTab;
