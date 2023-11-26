import React from "react";
import ChatIcon from "../../../../images/chat_icon.svg";
import { Tooltip as ReactTooltip } from "react-tooltip";

const ChatToggle = ({ float_chat_toggle }) => {
  return (
    <div
      className="header"
      onClick={() => float_chat_toggle("float_mini_action")}
      data-tip
      data-for="CahtOpenToolTip"
    >
      <div className="right-content tour_chat_link chat_tour_link">
        <div className="avatar-wrap">
          <img src={ChatIcon} alt="" />
        </div>
        <span className="msg-title">Messaging</span>
      </div>
      <div className="left-content">
        <span className="arrow-btn">
          <i className="ri-arrow-down-s-line"></i>
        </span>
      </div>
      <ReactTooltip id="CahtOpenToolTip" place="right" effect="solid">
        Chat
      </ReactTooltip>
    </div>
  );
};

export default ChatToggle;
