import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { SOCKET_IO } from "../../../interceptor/config";
import socketIOClient from "socket.io-client";
const ENDPOINT = SOCKET_IO
  ? SOCKET_IO
  : "http://127.0.0.1:" + process.env.MIX_SOCKET_PORT;

const ChatSwitchButton = (props) => {
  let user_list = useSelector((state) => state.chatReducers.user_list);
  const [gotMsg, setGotmsg] = useState(false);
  const socket = socketIOClient(ENDPOINT, {
    rejectUnauthorized: false,
    transports: ["websocket"],
  });

  useEffect(() => {
    // User Get A New Message
    socket.on("new-message-received", (sender) => {
      updateUserMessageStatus();
    });

    // User Read Message
    socket.on("pong", (data) => {
      updateUserMessageStatus();
    });
  }, [user_list]);

  const updateUserMessageStatus = () => {
    setGotmsg(false);
    user_list.forEach((user) => {
      if (user.directMsg) {
        setGotmsg(true);
      }
    });
  };

  return (
    <div>
      <ul className="nav nav-tabs chat-switch-button" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <a
            className="nav-link active"
            id="Direct-tab"
            data-toggle="tab"
            href="#Direct"
            role="tab"
            aria-controls="Direct"
            aria-selected="true"
            data-tip
            data-for="DirectTootltip"
          >
            <span>
              Direct
              {gotMsg ? <div className="notification-alert"></div> : ""}
            </span>
            <ReactTooltip id="DirectTootltip" place="top" effect="solid">
              Start chatting here
            </ReactTooltip>
          </a>
        </li>
        <li className="nav-item" role="presentation">
          <a
            className="nav-link"
            id="Booth-tab"
            data-toggle="tab"
            href="#Booth"
            role="tab"
            aria-controls="Booth"
            aria-selected="false"
            data-tip
            data-for="BoothTootltip"
          >
            <span>
              Booth
              {/* <div className="notification-alert"></div> */}
            </span>
            <ReactTooltip id="BoothTootltip" place="top" effect="solid">
              Start chatting with booth representatives
            </ReactTooltip>
          </a>
        </li>
        <li className="nav-item" role="presentation">
          <a
            className="nav-link"
            id="Group-tab"
            data-toggle="tab"
            href="#Group"
            role="tab"
            aria-controls="Group"
            aria-selected="false"
            data-tip
            data-for="Groupootltip"
          >
            <span>
              Group
              <div
                className={`${
                  props.un_read_groups > 0 ? "notification-alert" : ""
                }`}
              ></div>
            </span>
            <ReactTooltip id="Groupootltip" place="top" effect="solid">
              Group chat
            </ReactTooltip>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ChatSwitchButton;
