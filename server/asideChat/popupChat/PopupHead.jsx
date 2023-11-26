import React, { Component } from "react";
import { FaPhoneAlt } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import Modal from 'react-modal';
import {loggedInUser, rcData} from "../../../utils/utils";
import {connect} from "react-redux";
import {updateList} from "../../../actions/chatActions";
import {config} from "../../../utils/utils";
import {RequestMethods} from "../../../interceptor/RequestMethods";
import {renderProfileApi} from "../../../actions/ModalApiActions";
import {Tooltip as ReactTooltip} from "react-tooltip";
import $ from "jquery";
import moment from 'moment';
import socketIOClient from "socket.io-client";
import { SOCKET_IO } from "../../../interceptor/config";
const ENDPOINT = (SOCKET_IO)? SOCKET_IO: "http://127.0.0.1:" + process.env.MIX_SOCKET_PORT;

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#chatContainerId');

class PoppupHead extends Component {
    state = {
        user_avatar: this.props.user_info.link_to.charAt(0).toUpperCase(),
        enable_avatar: false,
        direct_msg: false,
        config: config(),
        chatUserName:"",
        chatUserStatus: 'offline',
    };
    socket = null;

    componentDidMount() {
        let cr_user = loggedInUser();
        this.setState({
            cr_user:cr_user
        });
        this.customSocket();
        this.setUserOnlineStatus();
    }

    customSocket = () => {
        const socket = socketIOClient(ENDPOINT, {rejectUnauthorized: false, transports: ['websocket']});
        socket.on('connected', (sender) => {
                this.setUserOnlineStatus();
            });
        this.socket = socket;
    };

    setUserOnlineStatus = () => {
        for (const [i, user] of this.props.user_list.entries()) {
            if(user.username == this.props.user_info.link_to){
                this.setState({chatUserName: user.name});
                this.setState({chatUserStatus:user.status});
                break;
            }
        }
    };

    openModal = () =>  {
        let meeting_url = 'https://meet.jit.si/'+this.props.user_info.rid;
        this.sendMessage(meeting_url);

        meeting_url = meeting_url + '#userInfo.displayName="'+this.state.cr_user.fname+' '+this.state.cr_user.lname+'"';
        window.open(meeting_url);
    };

    update_direct_msg = () => {
        if (this.state.direct_msg) {
            this.setState({direct_msg: false});
        }
        this.update_global_user_list();
    };

    customSocket = () => {
        const socket = socketIOClient(ENDPOINT, {rejectUnauthorized: false, transports: ['websocket']});

        socket.on('new-message-received', (sender) => {
            this.newChatMessageReceive(sender);
        });
        this.socket = socket;
    };

    newChatMessageReceive = (sender) => {
        for (const [i, user] of this.props.user_list.entries()) {
            if(user.username == this.props.user_info.link_to && !this.state.direct_msg && sender != this.state.cr_user.username){
                if (user.popup_state){
                    this.setState({direct_msg: true});
                    break;
                }
            }
        }
    };

    sendMessage = (meeting_url) => {
        let user_data = rcData();

        let funtionName = "/chat/send_message";
        let formData = {
            rid: this.props.user_info.rid,
            msg: meeting_url,
        };

        const msg_obj = {
            "message": {
                "rid": this.props.user_info.rid,
                "msg": meeting_url,
                "ts": moment().format(),
                "u": {
                    "_id": user_data.userId,
                    "username": user_data.me.username,
                },
                "unread": true,
                "mentions": [],
                "channels": [],
                "_updatedAt": moment().format(),
                "_id": 0,
            },
            "success": true
        };
        this.props.append_msg(msg_obj.message);
        this.props.msgCallback(meeting_url);

        RequestMethods.postChatRequestWithToken(funtionName, formData)
            .then((response) => {

            }).catch(function (error) {
            // console.log(error);
        });
    };

    update_global_user_list = () => {
        let user_list = this.props.user_list;
        user_list.forEach((user, i) => {
            if (user.username == this.props.user_info.link_to) {
                user_list[i].popup_state = false;
                user_list[i].directMsg = false;
            }
        });
        this.props.dispatch(updateList(user_list));
        this.socket.emit('ping', {});
    };

    show_profile = (username) => {
        if (this.props.toggle_class == '') {
            RequestMethods.getChatRequestWithToken(`user/profile_by_username/${username}`)
                .then((response) => {
                    const res = response;
                    if (res._metadata["status"] == "SUCCESS") {
                        this.props.dispatch(renderProfileApi(res.records.id));
                        $("#ProfilePopup").modal("show");
                    }
                }).catch(function (error) {
                // console.log(error);
            });
        }
    };

    render() {
        const { user_info } = this.props;
        return (
            <div className="chat-header">
                <div
                    id="chat-box-toggle"
                    className={`header ${this.state.direct_msg ? 'active' : ''}`}
                    onClick={() => {this.update_direct_msg()}}>
                    <div
                        className="right-content"
                        onClick={() =>
                            this.props.popup_chat_toggle("popup_mini_action")
                        }
                    >
                        <div className="avatar-wrap">
                            <img
                                src={this.state.config[0].value.replace(
                                    /\/$/g,
                                    ""
                                ) + '/avatar/' + user_info.link_to}
                                alt={user_info.link_to}
                            />
                            <span className={`user-status ${this.state.chatUserStatus == 'online' ? 'status-online' : ''} `}></span>
                        </div>
                        <a href="#!" className="user-link" onClick={() => this.show_profile(user_info.link_to)}
                           data-tip data-for="ViewProfileTooltip"
                        >
                            {this.state.chatUserName != '' ? this.state.chatUserName : user_info.link_to}
                            <ReactTooltip id="ViewProfileTooltip" place="top" effect="solid">
                                View Profile
                            </ReactTooltip>
                        </a>
                    </div>
                    <div className="left-content">
                        <ul className="ui-social-widget">
                            <li className="ui-contact-circle" onClick={this.openModal} data-tip data-for="Startavoicecall">
                                <FaPhoneAlt />
                                <ReactTooltip id="Startavoicecall" place="top" effect="solid">
                                    Start an audio/video call
                                </ReactTooltip>
                            </li>
                            <li className="cross-btn" onClick={() => this.props.remove_chat_popup(user_info.rid)} data-tip data-for="Closechat">
                                <MdClose/>
                                <ReactTooltip id="Closechat" place="top" effect="solid">
                                    Close chat
                                </ReactTooltip>
                            </li>
                        </ul>
                        {/* font-size: 24px; */}
                    </div>
                </div>
            </div>
        );
    }
}

//connects component with redux store state
const mapStateToProps = state => ({user_list: state.chatReducers.user_list});

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps)(PoppupHead);
