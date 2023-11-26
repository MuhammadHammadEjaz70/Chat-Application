import React, { Component } from "react";
import { RequestMethods } from "../../../interceptor/RequestMethods";
import { connect } from "react-redux";
import { rcData, config } from "../../../utils/utils";
import {Tooltip as ReactTooltip} from "react-tooltip";
import { quoteDirectMsg } from "../../../actions/chatToggleActions";
import AttachFile from "../../../../images/attach_file.svg";

import moment from "moment";
import $ from "jquery";
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
let reactions = people.concat(
  nature,
  food,
  activity,
  travel,
  objects,
  symbols,
  flags
);


class PopupFooter extends Component {
  state = {
    message: "",
    attachment: "",
    attachment_preview: "",
    attachment_value: "",
    username: "",
    rc_id: "",
    quote: "d-none",
    quote_msg: "",
    emojis: false,
  };
  socket = null;
  componentDidMount() {
    let user_data = rcData();
    this.setState({
      username: user_data.me.username,
      rc_id: user_data.userId,
    });

    setTimeout(() => {
      this.customSocket();
    }, 1000);
  }

  componentDidUpdate() {
    if (
      this.props.quote_direct_msg != "" &&
      this.props.quote_direct_msg.msg != this.state.quote_msg.msg
    ) {
      this.setState({ quote_msg: this.props.quote_direct_msg });
    }
  }

  handleChange = (e) => {
    let message = { ...this.message };
    message = e.currentTarget.value;
    let attachment = "";
    let attachment_preview = "";
    if (e.target.files != null) {
      attachment = e.target.files[0];
      attachment_preview = URL.createObjectURL(e.target.files[0]);
      message = e.target.files[0].name;
    }
    this.setState({
      message,
      attachment_preview: attachment_preview,
      attachment: attachment,
    });
  };

  handleFocus = (room_id, link_to) => {
    let user_list = this.props.user_list;
    user_list.forEach((user, i) => {
      if (user.username == this.props.user_info.link_to) {
        user_list[i].directMsg = false;
      }
    });
    this.socket.emit("ping", { data: "pong" });
    this.setState({
      emojis: false,
    });
  };

  sendMessage = (e) => {
    e.preventDefault();
    if (this.state.message === undefined || this.state.message === "") {
      return;
    }
    let funtionName = "/chat/send_message";
    const site_config = config();
    const site_url = site_config.filter(
      (conf) => conf.key === "rc_chat_url"
    )[0]["value"];
    let msg = "";
    if (this.state.quote_msg == "") {
      msg = this.state.message;
    } else {
      msg = `[ ](${site_url}direct/${this.state.quote_msg.rid}?msg=${this.state.quote_msg._id}) ${this.state.message}`;
    }

    let formData = {
      rid: this.props.user_info.rid,
      msg: msg,
    };
    if (this.state.attachment != "") {
      funtionName = "/chat/attach_message/" + this.props.user_info.rid;
      formData = new FormData();
      formData.append(
        "file",
        this.state.attachment,
        this.state.attachment.name
      );
    }

    const msg_obj = {
      message: {
        rid: this.props.user_info.rid,
        msg: this.state.message,
        ts: moment().format(),
        u: {
          _id: this.state.rc_id,
          username: this.state.username,
        },
        unread: true,
        mentions: [],
        channels: [],
        _updatedAt: moment().format(),
        _id: 0,
      },
      success: true,
    };
    this.props.append_msg(msg_obj.message);
    // this.props.msgCallback(this.state.message);

    // remove quote message
    this.remove_quote_msg();

    this.setState({
      message: "",
      attachment: "",
      attachment_preview: "",
      attachment_value: "",
      emojis: false,
    });
    RequestMethods.postChatRequestWithToken(funtionName, formData)
      .then((response) => {})
      .catch(function (error) {
        // console.log(error);
      });
  };

  remove_attachment = () => {
    this.setState({
      attachment_preview: "",
      attachment: "",
      attachment_value: "",
    });
  };

  customSocket = () => {
    const socket = this.props.socketObj;
    this.socket = socket;
  };

  remove_quote_msg = () => {
    this.setState({ quote_msg: "" });
    this.props.dispatch(quoteDirectMsg(""));
  };

  activateEmojis = () => {
    let currentState = this.state.emojis;
    this.setState({
      emojis: !this.state.emojis,
    });
  };

  closeEmojis = () => {
    this.setState({
      emojis: false,
    });
  };

  addEmoticons = (emote) => {
    let newMessage = this.state.message + emote;
    this.setState({
      message: newMessage,
    });
  };

  render() {
    const Show_Quote_Msg = ({ msg }) => {
      if (this.props.user_info.rid === msg.rid) {
        let message = msg.msg;
        if (message.startsWith("[ ](")) {
          message = msg.msg.split(") ")[1];
        }
        return (
          <div className="reply-preview-message-popup">
            <div className="message">
              <div className="attachment">
                <div className="attachment-author">{msg.u.username}</div>
                <div className="attachment-flex">{message}</div>
              </div>
            </div>
            <div
              className="rc-message-box__icon cancel-reply"
              onClick={this.remove_quote_msg}
            >
              <i className="ri-close-fill"></i>
            </div>
          </div>
        );
      } else {
        return null;
      }
    };

    return (
      <div className="PopupChat-footer">
        {this.props.quote_direct_msg != "" ? (
          <Show_Quote_Msg msg={this.props.quote_direct_msg} />
        ) : null}

        <form onSubmit={this.sendMessage} className="">
          {this.state.attachment_preview != "" ? (
            <div className="inbox-send-attached-outer">
              <span onClick={this.remove_attachment}>
                <i className="ri-close-fill"></i>
              </span>
              <div className="inbox-send-attached-inner">
                <img src={AttachFile} alt="" />
              </div>
            </div>
          ) : (
            ""
          )}

          <div className="input-group">
            <textarea
              placeholder="Write your message ..."
              className="form-control chatTextArea"
              onChange={this.handleChange}
              onFocus={() =>
                this.handleFocus(
                  this.props.user_info.rid,
                  this.props.user_info.link_to
                )
              }
              value={this.state.message}
              rows={1}
              onKeyDown={(e) => {
                e.keyCode == 13 ? this.sendMessage(e) : null;
              }}
            >
              {this.state.message}
            </textarea>
            <div className="input-group-append">
              <span className="input-group-text">
                <button
                  type="submit"
                  className="btn btn-primary"
                  data-tip
                  data-for="SendMsg01"
                >
                  <i className="ri-send-plane-fill"></i>
                  <ReactTooltip id="SendMsg01" place="top" effect="solid">
                    Send
                  </ReactTooltip>
                </button>
              </span>
            </div>

            <div className="input-group-append">
              <span className="input-group-text">
                <div
                  className={`emoji-wrap ${this.state.emojis ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="btn border-0"
                    onClick={this.activateEmojis}
                  >
                    <i className="ri-emotion-line"></i>
                  </button>
                  <div className="emoji-container">
                    <div className="reaction-emoji">
                      {reactions.map((emoticons, j) => {
                        return (
                          <a
                            key={`emoticons_${emoticons.id}`}
                            href="#!"
                            onClick={() => this.addEmoticons(emoticons.unicode)}
                          >
                            <span>{emoticons.unicode}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </span>
            </div>

            <div className="input-group-append">
              <span className="input-group-text">
                <div className="upload-btn-wrapper">
                  <button className="filebtn">
                    <i className="ri-attachment-line"></i>
                  </button>
                  <input
                    type="file"
                    name="myfile"
                    value={this.state.attachment_value}
                    onChange={this.handleChange}
                    onClick={this.closeEmojis}
                    title=""
                    data-tip
                    data-for="AttachfileSend"
                  />
                  <ReactTooltip id="AttachfileSend" place="top" effect="solid">
                    Attach file
                  </ReactTooltip>
                </div>
              </span>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

//connects component with redux store state
const mapStateToProps = (state) => ({
  user_list: state.chatReducers.user_list,
  quote_direct_msg: state.chatToggleReducers.quote_direct_msg,
});

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps)(PopupFooter);
