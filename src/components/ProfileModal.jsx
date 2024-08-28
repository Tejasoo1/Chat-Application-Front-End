import { useChatContext } from "../context/ChatProvider";
import styles from "./ProfileModal.module.css";

function ProfileModal({ onClose }) {
  const { user } = useChatContext();

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => onClose(false)}>
          &times;
        </button>
        <h1 className={styles.profileName}>{user.name}</h1>
        <div className={styles.modalBody}>
          <img
            src={user.pic}
            alt={`${user.name}'s profile`}
            className={styles.profilePic}
          />
          <h2 className={styles.Emailheader}>Email:</h2>
          <h2 className={styles.userEmail}>{user.email}</h2>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
