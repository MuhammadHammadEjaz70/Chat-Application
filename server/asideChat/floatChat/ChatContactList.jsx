import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import GroupListContainer from "./GroupListContainer";
import { RequestMethods } from "../../../interceptor/RequestMethods";
import { config, loggedInUser } from "../../../utils/utils";
import { connect } from "react-redux";
import { updateList } from "../../../actions/chatActions";
import LoaderGif from "../../../../images/loopexploader.gif";

// This code is extending the Array.prototype in JavaScript by adding a new method called sortBy. This custom sortBy method is designed to sort an array of objects based on the value of a property p within each object.

/*************/
// Array.prototype.sortBy = function (p) {
//     return this.slice(0).sort(function (a, b) {
//         return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
//     });
// };

// Create your forceUpdate hook
function useForceUpdate() {
  let [value, setState] = useState(true);
  return () => setState(!value);
}

const ChatContactList = (props) => {
  const dispatch = useDispatch();
  let socket = null;

  const [state, setState] = useState({
    user_list: [],
    group_list: [],
    searchItem: "",
    groupSearchItem: "",
    cr_user: {},
    socket: null,
    onlineUsers: [],
    booth_reps_list: [],
    config: config(),
    loading: false,
    page: 0,
    prevY: 0,
    search_booth: "",
    un_read_groups: 0,
    show_user_loader: false,
    show_booth_loader: false,
    show_group_loader: false,
  });
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    let cr_user = loggedInUser();
    if (cr_user != null) {
      setState({
        cr_user: cr_user,
      });
    }
    get_user_list();
    get_group_list(50);
    get_booth_reps_list(50);

    setTimeout(() => {
      customeSocket();
      groups_socket();
      ping_pong();
    }, 1000);
  }, []);

  const sort_by = (field, reverse, primer) => {
    const key = primer
      ? function (x) {
          return primer(x[field]);
        }
      : function (x) {
          return x[field];
        };

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
      return (a = key(a)), (b = key(b)), reverse * ((a > b) - (b > a));
    };
  };

  const makeUsersOnline = () => {
    let user_list = state.user_list;
    let onlineUsers = state.onlineUsers;
    user_list.forEach((user, i) => {
      let index = onlineUsers.indexOf(user.username);
      if (index >= 0) {
        //online
        user_list[i].status = "online";
      } else {
        user_list[i].status = "offline";
      }
    });
    user_list.sort(sort_by("status", true));
    setState({
      user_list: user_list,
    });
    dispatch(updateList(user_list));
  };

  const directMsgCSS = (username) => {
    let user_list = state.user_list;

    for (const [i, user] of user_list.entries()) {
      if (user.username == username) {
        //online
        user_list[i].directMsg = true;
        user_list[i].popup_state = true;
        var cr_time = new Date();
        user_list[i].time = cr_time.getTime();
        break;
      }
    }
    user_list.sort(sort_by("time", true));
    setState({
      user_list: user_list,
    });
    dispatch(updateList(user_list));
  };

  const customeSocket = () => {
    socket = props.socketObj;
    setState({
      socket: socket,
    });
    let cr_user = loggedInUser();
    let emit_user = { username: cr_user ? cr_user.username : null };
    socket.emit("login", emit_user);
    socket.on("connected", (data) => {
      setState({
        //onlineUsers: [...state.onlineUsers, JSON.parse(data.users)]
        onlineUsers: JSON.parse(data.users),
      });
      makeUsersOnline();
      makeBoothRepsOnline();
      forceUpdate();
    });

    socket.on("message", (data) => {
      setState({ gotMsg: true });
      if (
        cr_user.username != data.link_to &&
        cr_user.username == data.otherUser
      ) {
        directMsgCSS(data.link_to);
        props.start_direct_messaging(data.link_to);
        // notifyMe(data.message);
      }
      forceUpdate();
    });

    socket.on("refreshUsers", () => {
      get_user_list();
      get_group_list(50);
      get_booth_reps_list(50);
    });

    socket.on("pong", (data) => {
      // alert('I am pong');
    });

    //***********************************************************************//
    // this.socket = socket;
  };

  //   const notifyMe=(text)=> {
  //     // Let's check if the browser supports notifications
  //     if (!("Notification" in window)) {
  //       alert("This browser does not support desktop notification");
  //     }

  //     // Let's check if the user is okay to get some notification
  //     else if (Notification.permission === "granted") {
  //       // If it's okay let's create a notification
  //       var notification = new Notification(text);
  //     }

  //     // Otherwise, we need to ask the user for permission
  //     // Note, Chrome does not implement the permission static property
  //     // So we have to check for NOT 'denied' instead of 'default'
  //     else if (Notification.permission !== "denied") {
  //       Notification.requestPermission(function (permission) {
  //         // Whatever the user answers, we make sure we store the information
  //         if (!("permission" in Notification)) {
  //           Notification.permission = permission;
  //         }

  //         // If the user is okay, let's create a notification
  //         if (permission === "granted") {
  //           var notification = new Notification(text);
  //         }
  //       });
  //     } else {
  //       alert(`Permission is ${Notification.permission}`);
  //     }
  //   }

  const get_user_list = () => {
    setState({ show_user_loader: true });
    RequestMethods.getChatRequestWithToken("/chat/get_users_list")
      .then((response) => {
        try {
          response.users.forEach((user, i) => {
            if (user.username == state.cr_user.username) {
              //online
              response.users[i].status = "online";
              let emit_user = {
                username: state.cr_user ? state.cr_user.username : null,
              };
              socket.emit("login", emit_user);
              //remove logged in user from chat list to avoid self-messaging
              response.users.splice(i, 1);
            }
            response.users[i].directMsg = false;
            response.users[i].popup_state = false;
            response.users[i].time = "";
          });
        } catch (err) {
          console.log("err", err);
        }

        setState({
          user_list: response.users,
        });
        dispatch(updateList(response.users));
        setState({ show_user_loader: false });
      })
      .catch(function (error) {});
    makeUsersOnline();
  };

  const get_booth_reps_list = (count = 10) => {
    setState({ show_booth_loader: true });
    RequestMethods.getChatRequestWithToken("/chat/get_booth_users_list")
      .then((response) => {
        if (response.length > 0) {
          setState({
            booth_reps_list: response,
          });
          makeBoothRepsOnline();
        }
        setState({ show_booth_loader: false });
      })
      .catch(function (error) {
        // console.log(error);
      });
  };

  const get_group_list = (count = 10) => {
    setState({ show_group_loader: true });
    RequestMethods.getChatRequestWithToken("/chat/group_list_all")
      .then((response) => {
        const res = response;
        if (res._metadata["status"] == "SUCCESS") {
          let group_list = res.records;
          group_list.forEach((group, i) => {
            group_list[i].new_msg = false;
          });
          setState({
            group_list: group_list,
          });
        }
        setState({ show_group_loader: false });
      })
      .catch(function (error) {
        // console.log(error);
      });
  };

  //On change of Search Box text
  const edit_search_item = async (e) => {
    let search_val = e.target.value;
    await setState({ searchItem: search_val });
    if (search_val.length > 0) {
      dynamic_search();
    } else {
      get_user_list();
    }
  };

  const dynamic_search = () => {
    makeUsersOnline();
    console.log(state.searchItem);
    let search_user = state.user_list.filter(
      (name) =>
        name.name.toLowerCase().includes(state.searchItem.toLowerCase()) ||
        name.username.toLowerCase().includes(state.searchItem.toLowerCase())
    );

    setState({ user_list: search_user });
  };

  //Search Groups
  const group_edit_search_item = (e) => {
    let search_val = e.target.value;
    setState({ groupSearchItem: search_val });
    if (search_val.length > 0) {
      group_dynamic_search();
    } else {
      get_group_list();
    }
  };

  const group_dynamic_search = () => {
    let search_group = state.group_list.filter((name) =>
      name.name.toLowerCase().includes(state.groupSearchItem.toLowerCase())
    );
    setState({ group_list: search_group });
  };

  const TestState = () => {
    forceUpdate();
  };

  const makeBoothRepsOnline = () => {
    let user_list = state.user_list;
    let booth_reps = state.booth_reps_list;
    booth_reps.forEach((reps, i) => {
      //checking if booth owner is is logged in then splice him
      if (
        reps.booth_owner != undefined &&
        state.cr_user.username == reps.booth_owner.username
      ) {
        booth_reps[i].booth_owner = null;
      }

      if (booth_reps[i].booth_reps != undefined) {
        booth_reps[i].booth_reps.forEach((booth_rep, r) => {
          if (
            booth_rep != undefined &&
            state.cr_user.username == booth_rep.username
          ) {
            booth_reps[i].booth_reps.splice(r, 1);
          }
        });
      }

      user_list.forEach((user, j) => {
        // checking if booth owner is loggedin or not
        if (
          reps.booth_owner != undefined &&
          reps.booth_owner.username == user.username
        ) {
          booth_reps[i].booth_owner.status = user.status;
        }

        // checking if booth Reps are loggedin or not
        if (booth_reps[i].booth_reps != undefined) {
          booth_reps[i].booth_reps.forEach((booth_rep, r) => {
            if (state.cr_user.username == booth_rep.username) {
              booth_reps[i].booth_reps[r] = null;
            } else {
              if (booth_rep.username == user.username) {
                booth_reps[i].booth_reps[r].status = user.status;
              }
            }
          });
        }
      });
    });
    // console.log('booth_reps', booth_reps)
    setState({ booth_reps_list: booth_reps });
  };

  // Search Booths
  const search_booths = (e) => {
    let search_val = e.target.value;
    setState({ search_booth: search_val });
    if (search_val.length > 0) {
      dynamic_booth_search(search_val);
    } else {
      get_booth_reps_list();
    }
  };

  const dynamic_booth_search = (search_val) => {
    let search_booths = state.booth_reps_list.filter((name) =>
      name.booth_name.toLowerCase().includes(search_val)
    );
    setState({ booth_reps_list: search_booths });
  };

  // Groups Socket
  const groups_socket = () => {
    const socket = props.socketObj;

    socket.on("receive-group-message", (data) => {
      const group_obj = data.group_obj;
      const sender = data.link_to;
      let other_user = JSON.parse(data.otherUser);

      other_user.forEach((user, i) => {
        if (sender != user && state.cr_user.username != sender) {
          props.get_group_chat(group_obj, true);
          group_msg_received(group_obj);
        }
      });
      forceUpdate();
    });
    //********************************************//
    // this.socket = socket;
  };

  const ping_pong = () => {
    const socket = props.socketObj;
    socket.on("pong", (data) => {
      forceUpdate();
    });
    //********************************************//
    // this.socket = socket;
  };

  const group_msg_received = (group_obj) => {
    const index = state.group_list.findIndex((x) => x._id == group_obj._id);
    if (index > -1) {
      let group = group_obj;
      group.new_msg = true;
      state.group_list[index] = group;

      setState({ group_list: state.group_list });
    }
    get_unread_groups_counts();
  };

  const group_msg_read = (group_obj) => {
    const index = state.group_list.findIndex((x) => x._id == group_obj._id);
    if (index > -1) {
      let group = group_obj;
      group.new_msg = false;
      state.group_list[index] = group;
      setState({ group_list: state.group_list });
    }
    get_unread_groups_counts();
  };

  const get_unread_groups_counts = () => {
    let group_list = state.group_list;
    let counter = 0;
    group_list.forEach((group, i) => {
      if (group.new_msg) {
        counter++;
      }
    });
    setState({ un_read_groups: counter });
  };

  const get_unread_groups_count = () => {
    return state.un_read_groups;
  };

  return (
    <div className="tab-content">
      <div
        className={"tab-pane fade show active"}
        id="Direct"
        role="tabpanel"
        aria-labelledby="Direct-tab"
      >
        <div className="search-input-container">
          {/*<form>*/}
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">
                <button type="button" className="btn btn-ico btn btn-primary">
                  <i className="ri-search-line"></i>
                </button>
              </span>
            </div>
            <input
              placeholder="Search For Users"
              aria-label="Search"
              aria-describedby="basic-addon1"
              className="form-control"
              value={state.searchItem}
              onChange={edit_search_item}
            />
          </div>
          {/*</form>*/}
        </div>
        <div className="chat-user-list-wrap">
          <ul>
            {props.user_list != "" ? (
              props.user_list.map((user) => {
                return (
                  <li
                    key={user._id}
                    onClick={() => props.start_direct_messaging(user.username)}
                    className={user.directMsg ? " active" : ""}
                    id={user.username}
                  >
                    <div className="msg-conversation-card-img">
                      <div className="name_avatar" title={user.name}>
                        <img
                          src={
                            state.config[0].value.replace(/\/$/g, "") +
                            "/avatar/" +
                            user.username
                          }
                          alt={user.username}
                        />
                      </div>
                      <span
                        className={`user-status ${
                          user.status == "online" ? "status-online" : ""
                        }`}
                      ></span>
                    </div>
                    <div className="msg-conversation-card-content">
                      <h4
                        className={
                          "text-truncate mb-0" +
                          (user.directMsg ? " direct-msg" : "")
                        }
                      >
                        {user.name != "" ? user.name : user.username}
                      </h4>
                    </div>
                  </li>
                );
              })
            ) : (
              <div style={{ position: "absolute", left: "25%", top: "45%" }}>
                {state.show_user_loader ? (
                  <img src={LoaderGif} alt="" width="150" height="83" />
                ) : (
                  <p>No Record Found</p>
                )}
              </div>
            )}
          </ul>
        </div>
      </div>
      <div
        className="tab-pane fade"
        id="Booth"
        role="tabpanel"
        aria-labelledby="Booth-tab"
      >
        <div className="search-input-container">
          {/*<form className="">*/}
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon2">
                <button type="button" className="btn btn-ico btn btn-primary">
                  <i className="ri-search-line"></i>
                </button>
              </span>
            </div>
            <input
              placeholder="Search for Booths"
              aria-label="Search"
              aria-describedby="basic-addon1"
              className="form-control"
              value={state.search_booth}
              onChange={search_booths}
            />
          </div>
          {/*</form>*/}
        </div>
        <div className="chat-user-list-wrap">
          <div className="accordion" id="accordionExample">
            {state.booth_reps_list.length > 0 ? (
              state.booth_reps_list.map((booth, index) => {
                return (
                  <div className="card" key={"accordion_" + booth.booth_id}>
                    <div
                      className="card-header"
                      id={"heading_" + booth.booth_id}
                    >
                      <span
                        className="btn btn-link btn-block text-white text-left collapsed"
                        data-toggle="collapse"
                        data-target={"#booth" + booth.booth_id}
                        aria-expanded="false"
                        aria-controls={"booth" + booth.booth_id}
                      >
                        {booth.booth_name}
                        <span className="arrow-btn">
                          <i className="ri-arrow-down-s-line"></i>
                        </span>
                        <div className="notification-alert"></div>
                      </span>
                    </div>

                    <div
                      id={"booth" + booth.booth_id}
                      className={"collapse"}
                      aria-labelledby={"heading_" + booth.booth_id}
                      data-parent="#accordionExample"
                    >
                      <div className="card-body">
                        <ul>
                          {/* if booth owner object in not null */}
                          {typeof booth.booth_owner != undefined &&
                          booth.booth_owner != null ? (
                            <li
                              key={booth.booth_owner._id}
                              onClick={() =>
                                props.start_direct_messaging(
                                  booth.booth_owner.username
                                )
                              }
                              className={
                                "" +
                                (booth.booth_owner.directMsg ? " active" : "")
                              }
                            >
                              <div className="msg-conversation-card-img">
                                <img
                                  src={
                                    state.config[0].value.replace(/\/$/g, "") +
                                    "/avatar/" +
                                    booth.booth_owner.username
                                  }
                                  alt={booth.booth_owner.username}
                                />
                                <span
                                  className={
                                    "user-status" +
                                    (booth.booth_owner.status == "online"
                                      ? " status-online"
                                      : " ")
                                  }
                                ></span>
                              </div>
                              <div className="msg-conversation-card-content">
                                <h4 className="text-truncate mb-0">
                                  {booth.booth_owner.name} (Owner)
                                </h4>
                              </div>
                            </li>
                          ) : null}

                          {booth.booth_reps != "" &&
                          booth.booth_reps != undefined
                            ? booth.booth_reps.map((user) => {
                                return (
                                  <li
                                    key={user._id}
                                    onClick={() =>
                                      props.start_direct_messaging(
                                        user.username
                                      )
                                    }
                                    className={
                                      "" + (user.directMsg ? " active" : "")
                                    }
                                  >
                                    <div className="msg-conversation-card-img">
                                      <img
                                        src={
                                          state.config[0].value.replace(
                                            /\/$/g,
                                            ""
                                          ) +
                                          "/avatar/" +
                                          user.username
                                        }
                                        alt={user.username}
                                      />
                                      <span
                                        className={
                                          "user-status" +
                                          (user.status == "online"
                                            ? " status-online"
                                            : " ")
                                        }
                                      ></span>
                                    </div>
                                    <div className="msg-conversation-card-content">
                                      <h4 className="text-truncate mb-0">
                                        {user.name}
                                      </h4>
                                    </div>
                                  </li>
                                );
                              })
                            : null}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="justify-content-center align-items-center gifloader">
                {state.show_booth_loader ? (
                  <img src={LoaderGif} alt="" width="150" height="83" />
                ) : (
                  <p>No Record Found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className="tab-pane fade"
        id="Group"
        role="tabpanel"
        aria-labelledby="Group-tab"
      >
        <div className="search-input-container">
          {/*<form className="">*/}
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon3">
                <button type="button" className="btn btn-ico btn btn-primary">
                  <i className="ri-search-line"></i>
                </button>
              </span>
            </div>
            <input
              placeholder="Search For Groups"
              aria-label="Search"
              aria-describedby="basic-addon1"
              className="form-control"
              value={state.groupSearchItem}
              onChange={group_edit_search_item}
            />
          </div>
          {/*</form>*/}
        </div>
        <div className="chat-user-list-wrap">
          <ul>
            {state.group_list != "" ? (
              state.group_list.map((group) => {
                return (
                  <GroupListContainer
                    group_data={group}
                    key={group._id}
                    get_group_chat={props.get_group_chat}
                  />
                );
              })
            ) : (
              <div className="justify-content-center align-items-center gifloader">
                {state.show_group_loader ? (
                  <img src={LoaderGif} alt="" width="150" height="83" />
                ) : (
                  <p>No Record Found</p>
                )}
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

//connects component with redux store state
const mapStateToProps = (state) => ({
  user_list: state.chatReducers.user_list,
});

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps, null, null, { forwardRef: true })(
  ChatContactList
);
