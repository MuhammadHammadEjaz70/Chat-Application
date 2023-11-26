import React, { Component, createRef } from "react";
import PopupHead from "./PopupHead";
import PopupMsgList from "./popupMsgList";
import PopupFooter from "./PopupFooter";
import { RequestMethods } from "../../../interceptor/RequestMethods";
import { loggedInUser } from "../../../utils/utils";
import { connect } from "react-redux";
import { css } from "@emotion/react";
import LoaderGif from "../../../../images/loopexploader.gif";
import moment from "moment";
import $ from "jquery";
const base_url = window.location.origin;

class PopupChat extends Component {
  state = {
    _messages: [],
    toggle_class: "",
    newMsg: "",
    webSocket: null,
    cr_username: "",
    loading: true,
    count: 1,
    total_msg: 0,
    socketConnect: false,
    rcSocket: null,
    isConnected: false,
    prevY: 0,
    page: 1,
    last_page: 0,
  };
  socket = null;
  RcSocket = this.props.rc_sockt_obj;

  audio = new Audio(base_url + "/audio/chat.mp3");
  override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;

  componentDidMount() {
    this.setState({ rcSocket: this.props.rc_sockt_obj });
    let cr_user = loggedInUser();
    this.setState({
      cr_username: cr_user.username,
    });
    this.get_direct_messages(this.props.chat.room.rid);
    setTimeout(() => {
      this.customSocket();
    }, 1000);

    var options = {
      root: null,
      rootMargin: "-50px",
      threshold: 1,
    };

    this.observer = new IntersectionObserver(
      (e) => this._handleObserver(e),
      options
    );
    this.observer.observe(this.loadingRef);
  }

  componentWillUnmount() {
    this.observer.unobserve(this.loadingRef);
  }

  _handleObserver(entities, observer) {
    this.handleObserver(entities);
  }

  handleObserver = (entities, observer) => {
    const y = entities[0].boundingClientRect.y;
    if (
      this.state._messages.length > 0 &&
      (this.state.prevY == 0 || this.state.prevY < y)
    ) {
      const new_count = this.state.count + 1;
      this.setState({
        count: this.state.count + 1,
      });
      let count = new_count * 10;
      if (count <= this.state.total_msg) {
        this.setState({
          _messages: [],
          loading: true,
        });
        this.get_direct_messages(this.props.chat.room.rid, count);
      } else {
        //Preventing extra calls to API
        let diff = count - this.state.total_msg;
        if (diff < 10) {
          this.setState({
            _messages: [],
            loading: true,
          });
          this.get_direct_messages(
            this.props.chat.room.rid,
            this.state.total_msg
          );
        }
      }
    }
    this.setState({ prevY: y });
  };

  customSocket = () => {
    const socket = this.props.socketObj;

    socket.on("message", (data) => {
      data.otherUser == this.state.cr_username ? this.playSound() : null;
      setTimeout(() => {
        this.get_direct_messages(this.props.chat.room.rid);
      }, 300);
    });

    this.socket = socket;
  };

  handleSendMessage = (room_id, text) => {
    let roomUsernames = this.props.chat.room.usernames;
    let cr_user = loggedInUser();
    let data = {
      room_id: room_id,
      text: text,
      link_to: cr_user.username,
      otherUser: JSON.stringify(roomUsernames),
    };
    this.socket.emit("send-message", data);
  };

  get_direct_messages = (room_id, count = 10) => {
    if (room_id != "") {
      RequestMethods.getChatRequestWithToken(
        `/chat/get_direct_messages/${room_id}?count=${count} `
      )
        .then((response) => {
          this.setState({
            _messages: response.messages,
            total_msg: response.total,
            loading: false,
          });
          if (count == 10) {
            const scrollHeight = $("#msg_" + room_id)[0].scrollHeight;
            $("#msg_" + room_id).scrollTop(scrollHeight);
          } else {
            let element = document.getElementById(
              "msg_" + this.props.chat.room._id
            );
            $("#msg_" + room_id).scrollTop(element.clientHeight);
          }
        })
        .catch(function (error) {
          // console.log(error);
        });
    }
  };

  append_message = (message_obj) => {
    this.setState({
      _messages: [message_obj, ...this.state._messages],
    });
    const msg_list = $("#msg_" + message_obj.rid);
    msg_list.animate({ scrollTop: msg_list.prop("scrollHeight") }, 100);
  };

  playSound = () => {
    this.audio.play();
  };

  popup_chat_toggle = (t_class) => {
    this.state.toggle_class == ""
      ? this.setState({ toggle_class: t_class })
      : this.setState({ toggle_class: "" });
  };

  getNewMsg = (messag) => {
    this.handleSendMessage(String(this.props.chat.room.rid), messag);
  };

  render() {
    const { chat } = this.props;
    return (
      <div className={"PopupChat-box " + this.state.toggle_class}>
        <PopupHead
          popup_chat_toggle={this.popup_chat_toggle}
          user_info={chat.room}
          remove_chat_popup={this.props.remove_chat_popup}
          cr_username={this.state.cr_username}
          msgCallback={this.getNewMsg}
          append_msg={this.append_message}
          toggle_class={this.state.toggle_class}
        />
        <div className="PopupChat-body">
          <div className="PopupChat-content">
            <div className="msg-s-message-list">
              <ul
                className="msg-s-message-list-content"
                id={"msg_" + chat.room._id}
              >
                <li ref={(loadingRef) => (this.loadingRef = loadingRef)} />
                {this.state.loading ? (
                  <div
                    className="msg-s-message-list gifloader"
                    style={{ position: "absolute", top: "40%" }}
                  >
                    <img src={LoaderGif} alt="" width="150" height="83" />
                  </div>
                ) : (
                  <PopupMsgList
                    direct_messages={this.state._messages}
                    loading={this.state.loading}
                    cr_username={this.state.cr_username}
                  />
                )}
              </ul>
            </div>
          </div>
        </div>
        <PopupFooter
          msgCallback={this.getNewMsg}
          user_info={chat.room}
          socketObj={this.props.socketObj}
          append_msg={this.append_message}
          cr_username={this.state.cr_username}
        />
      </div>
    );
  }
}

//connects component with redux store state
const mapStateToProps = (state) => ({
  user_list: state.chatReducers.user_list,
});

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps, null, null, { forwardRef: true })(
  PopupChat
);
