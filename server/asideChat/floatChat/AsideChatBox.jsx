import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import ChatToggle from "./ChatToggle";
import ChatSwitchButton from "./ChatSwitchBtn";
import ChatContactList from "./ChatContactList";
import PopupChat from "../popupChat/PopupChat";
import GroupPopupChat from "../groupPopupChat/GroupPopupChat";
import { RequestMethods } from "../../../interceptor/RequestMethods";
import { connect } from "react-redux";
import {
  updateBoothChatToggle,
  updateChatToggle,
} from "../../../actions/chatToggleActions";

import socketIOClient from "socket.io-client";
import { SOCKET_IO } from "../../../interceptor/config";
import $ from "jquery";
import {
  generateHash,
  rcAuthToken,
  rcBaseURL,
  rcUserId,
} from "../../../utils/RocketChat";
import { loggedInUser } from "../../../utils/utils";
import { updateList } from "../../../actions/chatActions";

// Create your forceUpdate hook
function useForceUpdate() {
  let [value, setState] = useState(true);
  return () => setState(!value);
}
const ENDPOINT = SOCKET_IO
  ? SOCKET_IO
  : "http://127.0.0.1:" + process.env.MIX_SOCKET_PORT;

const AsideChatBox = (props) => {
  const [state, setState] = useState({
    direct_messages: [],
    popup_chat: "",
    group_info: [],
    group_chat_data: [],
    toggle_class: "",
    chat_popups: [],
    group_chat_popups: [],
    gotMsg: false,
    socketObj: null,
    members: [],
    un_read_groups: 0,
    RcSocket: null,
    cr_user: loggedInUser(),
  });
  const dispatch = useDispatch();
  const RcSocket = null;

  const PopupChatRef = [];
  const GroupPopupChatRef = [];
  const contactListRef = useRef();
  let socket = null;

  PopupChatRef[0] = useRef(null);
  GroupPopupChatRef[0] = useRef(null);
  PopupChatRef[1] = useRef(null);
  GroupPopupChatRef[1] = useRef(null);

  useEffect(() => {
    // createDynamicRefs();
    customSocket();
    makeConnection();
  }, []);
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    if (props.toggle_chat == "minimize" && state.toggle_class != "") {
      setState({ toggle_class: "" });
    }

    if (props.toggle_booth_chat == "opened" && state.toggle_class == "") {
      setState({ toggle_class: "float_mini_action" });
      dispatch(updateBoothChatToggle(""));
    }

    let un_read_groups = contactListRef.current.get_unread_groups_count();
    if (state.un_read_groups != un_read_groups) {
      setState({ un_read_groups: un_read_groups });
    }
  }, [state.toggle_class]);

  // const createDynamicRefs = () => {};

  //Rocket Chat Socket Connection
  const makeConnection = () => {
    var rc_base_url = rcBaseURL();
    rc_base_url = rc_base_url.replace("https", "wss");
    let socket = new WebSocket(rc_base_url + "sockjs/websocket");
    setTimeout(() => {
      socket.onopen = function () {
        // console.log('Websocket Connected')
      };
    }, 5000);

    waitForSocketConnection(socket, () => {
      RcSocket = socket;
      connectRcSocket();
    });
  };

  const waitForSocketConnection = (socket, callback) => {
    setTimeout(() => {
      if (socket.readyState === 1) {
        // console.log("Connection is made");
        if (callback != null) {
          callback();
        }
      } else {
        // console.log("wait for connection...");
        waitForSocketConnection(socket, callback);
      }
    }, 5);
  };

  const connectRcSocket = () => {
    const socket = RcSocket;

    //1 connect
    let connectObject = {
      msg: "connect",
      version: "1",
      support: ["1", "pre2", "pre1"],
    };

    //2 getInitialData
    let getInitialDataObject = {
      msg: "method",
      method: "livechat:getInitialData",
      params: [String(rcAuthToken()), null],
      id: String(generateHash(17)),
    };

    setTimeout(() => {
      socket.send(JSON.stringify(getInitialDataObject));
    }, 2000);

    setTimeout(() => {
      socket.send(JSON.stringify(connectObject));
    }, 1000);

    // Refresh Login
    let loginByToken = {
      msg: "method",
      method: "login",
      params: [{ resume: String(rcAuthToken()) }],
      id: String(generateHash(17)),
    };
    setTimeout(() => {
      socket.send(JSON.stringify(loginByToken));
    }, 3000);

    // 3 Stream Notify Rooms
    let streamNotifyRoom = {
      msg: "sub",
      id: String(generateHash(17)),
      name: "stream-notify-user",
      params: [
        `${String(rcUserId())}/message`,
        { useCollection: false, args: [] },
      ],
    };
    setTimeout(() => {
      socket.send(JSON.stringify(streamNotifyRoom));
    }, 3000);

    // 3 Stream Notify Rooms Change (New Message)
    let streamRoomChange = {
      msg: "sub",
      id: String(generateHash(17)),
      name: "stream-notify-user",
      params: [
        `${String(rcUserId())}/rooms-changed`,
        { useCollection: false, args: [] },
      ],
    };
    setTimeout(() => {
      socket.send(JSON.stringify(streamRoomChange));
    }, 3000);

    // 3 Stream Notifications
    let streamNotification = {
      msg: "sub",
      id: String(generateHash(17)),
      name: "stream-notify-user",
      params: [
        `${String(rcUserId())}/notification`,
        { useCollection: false, args: [] },
      ],
    };
    setTimeout(() => {
      socket.send(JSON.stringify(streamNotification));
    }, 3000);

    var that = this;
    socket.onmessage = function (res) {
      if (res.data) {
        let response = JSON.parse(res.data);

        // when Some message first time
        if (
          response.msg === "changed" &&
          response.collection === "stream-notify-user"
        ) {
          let rooms_changed = String(rcUserId()) + "/rooms-changed";
          // let notification = String(rcUserId()) + '/notification';

          // check message notification
          // if (response.fields.eventName == notification) {
          //     const data = response.fields.args[0];
          //     if (data.payload != undefined && data.payload.type != 'd') {
          //
          //     }
          // }
          if (response.fields.eventName == rooms_changed) {
            if (
              response.fields.args[1] != undefined &&
              response.fields.args[1].t == "d"
            ) {
              that.updateOneToChatData(response);
            } else if (
              response.fields.args[1] != undefined &&
              response.fields.args[1].t != "d"
            ) {
              that.openGroupPopUpChatBox(response);
            }
          }
          return;
        }

        // you have to pong back if you need to keep the connection alive
        // each ping from server need a 'pong' back
        if (response.msg == "ping") {
          socket.send(JSON.stringify({ msg: "pong" }));
          return;
        }
      }
    };
  };

  const openGroupPopUpChatBox = (data) => {
    const record = data.fields.args[1];
    if (record.t != "d") {
      const sender_user = record.lastMessage.u.username;
      var group_obj = {
        _id: record._id,
        ts: "2021-09-23T09:23:32.472Z",
        t: record.t,
        name: record.name,
        usernames: [],
        msgs: 0,
        usersCount: 0,
        default: true,
        _updatedAt: "2021-09-23T09:23:32.472Z",
        success: false,
        receive_msg: false,
      };
      const findIndex = state.group_chat_data.findIndex(
        (rec) => rec._id == record._id
      );
      if (findIndex > -1) {
        if (state.cr_user.username != sender_user) {
          GroupPopupChatRef[findIndex].current.append_message(
            record.lastMessage
          );
          GroupPopupChatRef[findIndex].current.playSound();
          get_group_chat(group_obj, true);
        }
        if (state.cr_user.username == sender_user) {
          // Updating Group Chat List
          GroupPopupChatRef[findIndex].current.get_group_messages(group_obj);
        }
      } else {
        if (state.cr_user.username != sender_user) {
          get_group_chat(group_obj);
        }
      }
    }
  };

  const updateOneToChatData = (data) => {
    const record = data.fields.args[1];
    if (record.t == "d") {
      const sender_user = record.lastMessage.u.username;
      const findIndex = state.direct_messages.findIndex(
        (rec) => rec.room.rid == record._id
      );
      if (findIndex > -1) {
        // Appending message to other User
        if (state.cr_user.username != sender_user) {
          PopupChatRef[findIndex].current.append_message(record.lastMessage);
          PopupChatRef[findIndex].current.playSound();
          contactListRef.current.directMsgCSS(sender_user);

          //emitting Message
          socket.emit("new-message-sent", sender_user);
        }

        // updating One To Chat List
        PopupChatRef[findIndex].current.get_direct_messages(record._id);
      } else {
        if (state.cr_user.username != sender_user) {
          start_direct_messaging(sender_user);
        }
      }
    }
  };

  const customSocket = () => {
    socket = socketIOClient(ENDPOINT, {
      rejectUnauthorized: false,
      transports: ["websocket"],
    });

    socket.on("message", (data) => {
      setState({ gotMsg: true });
      forceUpdate();
    });

    // socket = socket;
    setState({
      socketObj: socket,
    });
  };

  const popUpLogic = (room_obj) => {
    //checking if room object is not empty
    if (room_obj.room.rid != "") {
      // Find if the array contains an object by comparing the property value
      if (
        state.direct_messages.some(
          (person) => person.room.rid == room_obj.room.rid
        )
      ) {
        openExistingPopUp(room_obj.room.rid);
      } else {
        //Remove Popup when exceed to Window Size
        const chat_width = Math.floor((window.innerWidth - 288) / 336);
        // chat_width > 0 ? chat_width : 1;

        const direct_msg_box_count =
          state.direct_messages.length + state.group_chat_data.length;
        if (direct_msg_box_count >= chat_width) {
          setState({
            chat_popups: [...state.chat_popups, state.direct_messages[0]],
          });

          if (state.direct_messages.length > 0) {
            state.direct_messages.shift();
          } else {
            state.group_chat_data.shift();
          }
        }
        setState({
          direct_messages: [...state.direct_messages, room_obj],
        });
      }
    } else {
      // if room id is empty then check by link_to
      const findIndex = state.direct_messages.findIndex(
        (record) => record.room.link_to == room_obj.room.link_to
      );
      if (findIndex > -1) {
        // if the room id is not empty then open a popUp
        if (state.direct_messages[findIndex].room.rid != "") {
          openExistingPopUp(state.direct_messages[findIndex].room.rid);
        }
      } else {
        //Remove Popup when exceed to Window Size
        const chat_width = Math.floor((window.innerWidth - 288) / 336);
        // chat_width > 0 ? chat_width : 1;

        const direct_msg_box_count =
          state.direct_messages.length + state.group_chat_data.length;

        if (direct_msg_box_count >= chat_width) {
          setState({
            chat_popups: [...state.chat_popups, state.direct_messages[0]],
          });
          if (state.direct_messages.length > 0) {
            state.direct_messages.shift();
          } else {
            state.group_chat_data.shift();
          }
        }
        setState({
          direct_messages: [...state.direct_messages, room_obj],
        });
      }
    }
  };

  const start_direct_messaging = (username) => {
    update_global_user_list(username);
    $(".chat-user-list-wrap").addClass("pointer-events-none");
    // open Chat Box First then Call messages API. Also checking how many windows should open based on screen size
    if (localStorage.getItem(btoa("direct_messages")) != null) {
      let localDmRecords = localStorage.getItem("direct_messages");
      localDmRecords = JSON.parse(localDmRecords);
      let response = localDmRecords.find((o) => o.room.link_to === username);
      if (response) {
        popUpLogic(response);
      }
    } else {
      var obj = {
        room: {
          t: "",
          rid: "",
          usernames: [username, state.cr_user.username],
          _id: 0,
          link_to: username,
        },
        success: false,
      };
      popUpLogic(obj);
    }

    RequestMethods.getChatRequestWithToken(
      "/chat/start_direct_messaging?username=" + username
    )
      .then((response) => {
        storeVisitPoints();
        get_direct_message(response);
      })
      .catch(function (error) {
        // console.log(error);
      });
  };

  const get_direct_message = (response) => {
    const findIndex = state.direct_messages.findIndex(
      (record) => record.room.link_to == response.room.link_to
    );
    if (findIndex > -1) {
      state.direct_messages[findIndex] = response;
      setState({ direct_messages: state.direct_messages });
    } else {
      setState({
        direct_messages: [...state.direct_messages, response],
      });
    }
    localStorage.setItem(
      "direct_messages",
      JSON.stringify(state.direct_messages)
    );
    $(".chat-user-list-wrap").removeClass("pointer-events-none");
  };

  const get_group_chat = (group_obj, receive_msg = false) => {
    // Show Group Chat Box
    var obj = {
      _id: group_obj._id,
      ts: "2021-09-23T09:23:32.472Z",
      t: group_obj.t,
      name: group_obj.name,
      usernames: [],
      msgs: 0,
      usersCount: 0,
      default: true,
      _updatedAt: "2021-09-23T09:23:32.472Z",
      success: false,
      receive_msg: receive_msg,
    };
    show_group_chat_box(obj);

    const type = group_obj.t == "c" ? "channels" : "groups";
    RequestMethods.postChatRequestWithToken(`chat/group_info/${type}`, {
      group_id: group_obj._id,
    })
      .then((response) => {
        let res =
          typeof response.group != "undefined"
            ? response.group
            : response.channel;
        res.receive_msg = receive_msg;
        res.new_msg = receive_msg;
        const index = state.group_chat_data.findIndex((x) => x._id == res._id);
        if (index > -1) {
          state.group_chat_data[index] = res;
          setState({ group_chat_data: state.group_chat_data });
        }
      })
      .catch(function (error) {
        // console.log(error);
      });
    getGroupMembers(group_obj);
  };

  const getGroupMembers = (group_obj) => {
    const group_id = group_obj._id;
    const type = group_obj.t == "c" ? "channels" : "groups";
    RequestMethods.getChatRequestWithToken(
      `chat/group/members/${group_id}/${type}`
    )
      .then((response) => {
        const res = response;
        if (typeof res && res.responseData.count > 0) {
          setState({
            members: res.responseData.members,
          });
        }
      })
      .catch((error) => {
        // console.log(error);
      });
  };

  const remove_chat_popup = (rid) => {
    unsub_room_stream_room_messages(rid);
    const filteredPopUps = state.direct_messages.filter(
      (person) => person.room.rid !== rid
    );
    setState({
      direct_messages: filteredPopUps,
    });
  };

  const remove_group_chat_popup = (id) => {
    const filteredGroupPopUps = state.group_chat_data.filter(
      (group) => group._id !== id
    );
    setState({
      group_chat_data: filteredGroupPopUps,
    });
  };

  const update_more_popup = (username, rid) => {
    start_direct_messaging(username);

    const filteredMorePopUps = state.chat_popups.filter(
      (person) => person.room.rid !== rid
    );
    setState({
      chat_popups: filteredMorePopUps,
    });
  };

  const storeVisitPoints = () => {
    RequestMethods.postChatRequestWithToken("/add/lobby/visit/points", {
      area: "profile_visit",
    })
      .then((response) => {})
      .catch(function (error) {
        // console.log(error);
      });
  };

  const float_chat_toggle = (t_class) => {
    if (state.toggle_class == "") {
      setState({ toggle_class: t_class });
      dispatch(updateChatToggle("opened"));
    } else {
      setState({ toggle_class: "" });
    }
  };

  const openExistingPopUp = (room_id) => {
    const t_class = "";
    const findIndex = state.direct_messages.findIndex(
      (person) => person.room.rid == room_id
    );
    if (PopupChatRef.length > 0) {
      PopupChatRef[findIndex].current.popup_chat_toggle(t_class);
    } else {
      PopupChatRef[0].current.popup_chat_toggle(t_class);
    }
  };

  const show_group_chat_box = (response) => {
    if (state.group_chat_data.some((group) => group._id == response._id)) {
      // console.log("Group Popup already open.");
    } else {
      const chat_width = Math.floor((window.innerWidth - 288) / 336);
      // chat_width > 0 ? chat_width : 1;
      let message_box_count =
        state.direct_messages.length + state.group_chat_data.length;
      if (message_box_count >= chat_width) {
        setState({
          group_chat_popups: [
            ...state.group_chat_popups,
            state.group_chat_data[0],
          ],
        });

        if (state.group_chat_data.length > 0) {
          state.group_chat_data.shift();
        } else {
          state.direct_messages.shift();
        }
      }
      setState({
        group_chat_data: [...state.group_chat_data, response],
      });
    }
  };

  const receive_msg = (group_obj) => {
    group_obj.receive_msg = false;
    const index = state.group_chat_data.findIndex(
      (x) => x._id == group_obj._id
    );
    if (index > -1) {
      state.group_chat_data[index] = group_obj;
      setState({ group_chat_data: state.group_chat_data });
    }
  };

  const read_group_msg = (group_obj) => {
    contactListRef.current.group_msg_read(group_obj);
  };

  const unsub_room_stream_room_messages = (chatRoomId) => {
    let roomMessagesUnSub = {
      msg: "unsub",
      id: String(generateHash(17)),
      name: "stream-room-messages",
      params: [String(chatRoomId), false],
    };

    setTimeout(() => {
      RcSocket.send(JSON.stringify(roomMessagesUnSub));
    }, 6000);
  };

  const update_global_user_list = (username) => {
    let user_list = props.user_list;
    user_list.forEach((user, i) => {
      if (user.username == username) {
        user_list[i].popup_state = false;
        user_list[i].directMsg = false;
      }
    });
    dispatch(updateList(user_list));
    socket.emit("ping", {});
  };

  return (
    <div className={"aside-chat-container " + state.toggle_class}>
      <div className="aside-chat-box">
        <ChatToggle float_chat_toggle={float_chat_toggle} />
        <ChatSwitchButton un_read_groups={state.un_read_groups} />
        <div className="msg-conversation-card-wrap">
          <div className="msg-conversation-card-conatiner">
            <ChatContactList
              ref={contactListRef}
              socketObj={state.socketObj}
              start_direct_messaging={start_direct_messaging}
              get_group_chat={get_group_chat}
            />
          </div>
        </div>
      </div>

      {state.direct_messages != "" && state.direct_messages != undefined
        ? state.direct_messages.map((chat, index) => {
            return (
              <PopupChat
                ref={PopupChatRef[index]}
                socketObj={state.socketObj}
                chat={chat}
                key={chat.room.rid}
                remove_chat_popup={remove_chat_popup}
                rc_sockt_obj={RcSocket}
              />
            );
          })
        : ""}

      {/* {state.group_chat_data != ""
                    ? state.group_chat_data.map((group_chat, index) => {
                          return (
                              <GroupPopupChat
                                  ref={GroupPopupChatRef[index] }
                                  socketObj={state.socketObj}
                                  group_chat={group_chat}
                                  key={group_chat._id}
                                  members={state.members}
                                  remove_group_chat_popup={remove_group_chat_popup}
                                  start_chat={start_direct_messaging}
                                  receive_msg={receive_msg}
                                  read_group_msg={read_group_msg}
                              />
                          );
                      })
                    : ""} */}
    </div>
  );
};

//connects component with redux store state
const mapStateToProps = (state) => ({
  toggle_chat: state.chatToggleReducers.toggle_chat,
  toggle_booth_chat: state.chatToggleReducers.toggle_booth_chat,
  user_list: state.chatReducers.user_list,
});

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps)(AsideChatBox);
