import { Avatar, Tooltip } from "@chakra-ui/react";
import { useChatContext } from "../context/ChatProvider";
import styles from "./ScrollableChat.module.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

function ScrollableChat({ messages }) {
  const { user } = useChatContext();

  const isSameSenderMargin = (messages, m, i, userId) => {
    // console.log(i === messages.length - 1);

    if (
      i < messages.length - 1 &&
      messages[i + 1].sender._id === m.sender._id &&
      messages[i].sender._id !== userId
    )
      return 33;
    else if (
      (i < messages.length - 1 &&
        messages[i + 1].sender._id !== m.sender._id &&
        messages[i].sender._id !== userId) ||
      (i === messages.length - 1 && messages[i].sender._id !== userId)
    )
      return 0;
    else return "auto";
  };

  function isSameSender(messages, m, i, userId) {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== userId
    );
  }

  const isLastMessage = (messages, i, userId) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };

  const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
  };

  function extractAndFormatDate(isoString, i) {
    // Convert the ISO string to a Date object
    const date = new Date(isoString);

    // if (i !== 0) {
    //   // Add one day (24 hours) to the date
    //   date.setDate(date.getDate() + 1);
    // }

    // Extract and format the date (e.g., "25 Aug 2024")
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return formattedDate;
  }

  function extractDateAsNum(isoString) {
    // Convert the ISO string to a Date object
    const date = new Date(isoString);

    // Extract the day as an integer
    const day = date.getDate();

    return day;
  }

  function dateChanged(messages, i, m) {
    if (i === 0) {
      return true;
    }

    return (
      i < messages.length &&
      extractDateAsNum(m.createdAt) !==
        extractDateAsNum(messages[i - 1].createdAt)
    );
  }

  function extractTime(isoString) {
    // Convert the ISO string to a Date object
    const date = new Date(isoString);

    // Extract and format the time (e.g., "6:41 pm" or "1:09 am")
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return formattedTime;
  }

  return (
    <div style={{ overflowX: "hidden", overflowY: "auto" }}>
      {messages.length > 0 &&
        messages.map((m, i) => (
          <>
            {dateChanged(messages, i, m) ? (
              <p className={styles.dateContainer}>
                {extractAndFormatDate(m.createdAt, i)}
              </p>
            ) : (
              ""
            )}
            <div style={{ display: "flex", alignItems: "center" }} key={m._id}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip
                  label={m.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3.5 : 14,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                }}
              >
                {!m.content ? (
                  <PhotoProvider>
                    <PhotoView src={m.imgUrl}>
                      <img
                        style={{
                          height: "80px",
                          width: "80px",
                          cursor: "pointer",
                        }}
                        src={m.imgUrl}
                        alt="Zoomable"
                      />
                    </PhotoView>
                  </PhotoProvider>
                ) : (
                  m.content
                )}
                <span className={styles.timeContainer}>
                  {extractTime(m.createdAt)}
                </span>
              </span>
            </div>
          </>
        ))}
    </div>
  );
}

export default ScrollableChat;

/*
1] npm install react-medium-image-zoom --force
   npm uninstall react-medium-image-zoom --force

2] Description: Another React library that provides a photo viewer with zoom capabilities. It's 
                lightweight and very responsive.

   Installation:
   npm install react-photo-view --force   

*/
