import React, { Component } from "react";
import { config, loggedInUser } from "../../../utils/utils";
import { css } from "@emotion/react";
import { RequestMethods } from "../../../interceptor/RequestMethods";
import { connect } from "react-redux";
import moment from "moment";
import $ from "jquery";
import { quoteDirectMsg } from "../../../actions/chatToggleActions";
import {
  people,
  nature,
  food,
  activity,
  travel,
  objects,
  symbols,
  flags,
} from "../../../utils/Emojis";

let show_time = "";
let current_date = "";
let reactions = people.concat(
  nature,
  food,
  activity,
  travel,
  objects,
  symbols,
  flags
);

class popupMsgList extends Component {
  state = {
    enable_avatar: false,
    config: config(),
    direct_messages: this.props,
    current_user: loggedInUser(),
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = (event) => {
    let scrollTop = event.srcElement.body.scrollTop;
  };

  join_meeting = (meeting_url) => {
    let cr_user = loggedInUser();
    meeting_url =
      meeting_url +
      '#userInfo.displayName="' +
      cr_user.fname +
      " " +
      cr_user.lname +
      '"';
    window.open(meeting_url);
  };

  delete_message = (msgId, roomId) => {
    RequestMethods.postChatRequestWithToken(`chat/delete_message`, {
      msgId: msgId,
      roomId: roomId,
    })
      .then((response) => {
        // console.log("del: ", response);
      })
      .catch(function (error) {
        // console.log(error);
      });
  };

  quote_message = (msg) => {
    this.props.dispatch(quoteDirectMsg(msg));
  };

  react_message = (messageId, emoji) => {
    RequestMethods.postChatRequestWithToken(`chat/chat_reaction`, {
      messageId: messageId,
      emoji: emoji,
      shouldReact: true,
    })
      .then((response) => {
        // console.log("reacted: ", response);
      })
      .catch(function (error) {
        // console.log(error);
      });
  };

  override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;
  render() {
    const { direct_messages } = this.props;

    const Message_Reactions = ({ msg }) => {
      const msg_reaction = Object.keys(msg.reactions);
      let emoji = "";
      reactions.forEach((reaction, i) => {
        if (msg_reaction.includes(`${reaction.id}`)) {
          emoji += reaction.unicode;
        }
      });
      return <span className="d-block">{emoji}</span>;
    };

    const Show_Message = ({ msg }) => {
      // Jitsi Link
      if (msg.msg.includes("meet.jit.si")) {
        return (
          <a
            href="#"
            onClick={() => this.join_meeting(msg.msg)}
            className={`btn btn-primary btn-sm font-12-400 text-white msg-s-event-listitem__body `}
          >
            Click to Join
          </a>
        );
      } else {
        if (msg.attachments != undefined && msg.attachments != "") {
          // Quote Message
          const message = msg.msg.split(") ");
          let message_text = msg.attachments[0].text;
          if (message_text.startsWith("[ ](")) {
            message_text = message_text.split(") ")[1];
          }
          return (
            <React.Fragment>
              <p className={`msg-s-event-listitem__body `}>
                {message[1]}
                {msg.hasOwnProperty("reactions") ? (
                  <Message_Reactions msg={msg} />
                ) : null}
              </p>
              <div className="qoute-preview-message-popup ml-5 pl-2">
                <div className="message">
                  <div className="attachment-author">
                    <img
                      src={
                        this.state.config[0].value.replace(/\/$/g, "") +
                        "/avatar/" +
                        msg.attachments[0].author_name
                      }
                      alt={msg.attachments[0].author_name}
                    />
                    <span>{msg.attachments[0].author_name}</span>
                    <a href="#!">
                      {moment(msg.attachments[0].ts).format(
                        "MMMM  DD, yyyy LT"
                      )}
                    </a>
                  </div>
                  <div className="attachment">
                    <div className="attachment-text">
                      {message_text}
                      {/*{msg.attachments[0].text}*/}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        } else {
          // Text Message
          return (
            <React.Fragment>
              <p className={`msg-s-event-listitem__body `}>
                {msg.msg}
                {msg.hasOwnProperty("reactions") ? (
                  <Message_Reactions msg={msg} />
                ) : null}
              </p>
            </React.Fragment>
          );
        }
      }
    };

    return (
      <React.Fragment key={Math.random().toString(36).substr(2, 9)}>
        {direct_messages != "" && direct_messages != undefined ? (
          [...direct_messages].reverse().map((msg, j) => {
            {
              current_date = moment(msg.ts).format("LL");
              current_date != show_time
                ? (show_time = current_date)
                : (current_date = "");
            }
            return (
              <React.Fragment key={Math.random().toString(36).substr(2, 9)}>
                {show_time == current_date ? (
                  <li>
                    <div className="date-time-wrap">
                      <span>{moment(msg.ts).format("LL")}</span>
                    </div>
                  </li>
                ) : null}
                <li
                  key={msg._id.toString()}
                  id={msg._id.toString()}
                  className="msg-s-message-list__event clearfix"
                >
                  <div className="dropdown-option-popup">
                    <div className="btn m-0">
                      <button
                        type="button"
                        className="btn dropdown-toggle border-0"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="ri-emotion-line"></i>
                      </button>
                      <div className="dropdown-menu">
                        <div className="reaction-emoji">
                          {reactions.map((emoticons, j) => {
                            return (
                              <a
                                key={`emoticons_${emoticons.id}`}
                                href="#!"
                                onClick={() =>
                                  this.react_message(msg._id, emoticons.id)
                                }
                              >
                                <span>{emoticons.unicode}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="btn m-0 dropleft ">
                      <button
                        type="button"
                        className="btn dropdown-toggle border-0"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="ri-more-2-fill"></i>
                      </button>
                      <div className="dropdown-menu">
                        <ul>
                          <li>
                            <a
                              href="#!"
                              onClick={() => this.quote_message(msg)}
                            >
                              <i className="ri-double-quotes-r"></i>{" "}
                              <span>Quote</span>
                            </a>
                          </li>
                          {msg.u.username ==
                          this.state.current_user.username ? (
                            <li>
                              <a
                                href="#!"
                                onClick={() =>
                                  this.delete_message(msg._id, msg.rid)
                                }
                              >
                                <i className="ri-delete-bin-line"></i>{" "}
                                <span>Delete</span>
                              </a>
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    </div>
                  </div>
                  {
                    // Show Attachment
                    typeof msg.file != "undefined" && msg.file != "" ? (
                      <div
                        className="msg-conatiner"
                        key={Math.random().toString(36).substr(2, 9)}
                      >
                        <a href="" className="msg-s-event-listitem__link">
                          <div className="msg-abject">
                            <img
                              src={
                                this.state.config[0].value.replace(/\/$/g, "") +
                                "/avatar/" +
                                msg.u.username
                              }
                              alt={msg.u.username}
                            />
                          </div>
                        </a>
                        <div className="msg-s-message-group__meta">
                          <a href="#!">
                            <span className="msg-s-message-group__name">
                              {msg.u ? msg.u.username : ""}
                            </span>
                          </a>
                          <time className="msg-time">
                            {moment(msg.ts).format("LT")}
                          </time>
                        </div>
                        <div className="msg-s-event-listitem__message-bubble msg-s-event-listitem__attachment-item">
                          <div className="msg-s-event-listitem__image-container">
                            <a
                              href={
                                this.state.config[0].value.replace(/\/$/g, "") +
                                "/file-upload/" +
                                msg.file._id +
                                "/" +
                                msg.file.name
                              }
                            >
                              <i className="ri-download-2-line text-danger"></i>{" "}
                              {msg.file.name}
                            </a>
                          </div>
                        </div>
                        {msg.hasOwnProperty("reactions") ? (
                          <Message_Reactions msg={msg} />
                        ) : null}
                        {/*<div className="msg-read-user-box">*/}
                        {/*    <i className="ri-check-double-line"></i>*/}
                        {/*</div>*/}
                      </div>
                    ) : (
                      <div
                        className="msg-conatiner"
                        key={Math.random().toString(36).substr(2, 9)}
                      >
                        <a href="#!" className="msg-s-event-listitem__link">
                          <div className="msg-abject">
                            <img
                              src={
                                this.state.config[0].value.replace(/\/$/g, "") +
                                "/avatar/" +
                                msg.u.username
                              }
                              alt={msg.u.username}
                            />
                          </div>
                        </a>
                        <div className="msg-s-message-group__meta">
                          <a href="#!">
                            <span className="msg-s-message-group__name">
                              {msg.u.username}
                            </span>
                          </a>
                          <time className="msg-time">
                            {moment(msg.ts).format("LT")}
                          </time>
                        </div>
                        <div className="msg-s-event-listitem__message-bubble">
                          {<Show_Message msg={msg} />}

                          {/*<div className="msg-read-user-box">*/}
                          {/*    <i className="ri-check-double-line"></i>*/}
                          {/*</div>*/}
                        </div>
                      </div>
                    )
                  }
                </li>
              </React.Fragment>
            );
          })
        ) : this.props.loading ? (
          ""
        ) : (
          <span
            style={{
              padding: "30px 30px",
              fontWeight: "500",
              color: "#adb5bd",
            }}
          >
            Let's start conversation and say something!
          </span>
        )}
      </React.Fragment>
    );
  }
}

export default connect()(popupMsgList);
