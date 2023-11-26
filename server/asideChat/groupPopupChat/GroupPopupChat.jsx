import React, { Component } from "react";
import GroupPopupHead from "./GroupPopupHead";
import GroupPopupMsgList from "./GroupPopupMsgList";
import GroupPopupSearchList from "./GroupPopupSearchList";
import GroupPopupFooter from "./GroupPopupFooter";
import moment from "moment";
import $ from 'jquery';

import { RequestMethods } from "../../../interceptor/RequestMethods";
import LoaderGif from "../../../../images/loopexploader.gif";
import {loggedInUser} from "../../../utils/utils";
const base_url = window.location.origin;

export default class GroupPopupChat extends Component {
    state = {
        _messages: [],
        toggle_class: "",
        loader:true,
        count:1,
        total_msg: 0,
        group_id: "",
    };

    socket = null;
    audio = new Audio(base_url+'/audio/chat.mp3');

    componentDidMount() {
        this.get_group_messages(this.props.group_chat);
        setTimeout(()=>{
            this.socket_receive();
        },1000)
    }

    playSound = () => {
        this.audio.play();
    };

    append_message = (message_obj) => {
        this.setState({
            _messages: [message_obj, ...this.state._messages],
        });
        const msg_list  = $("#msg_"+ message_obj.rid);
        msg_list.animate({scrollTop: msg_list.prop("scrollHeight")}, 100);
    };

    popup_chat_toggle = (t_class, group_info = '') => {
        this.state.toggle_class == ""
            ? this.setState({ toggle_class: t_class })
            : this.setState({ toggle_class: "" });

        if (group_info != '') {
            this.props.receive_msg(group_info)
        }
    };

    get_group_messages = (group_obj, count = 10) => {

        const group_id = group_obj._id;
        const type = group_obj.t == 'c' ? 'channels' : 'groups';
        RequestMethods.postChatRequestWithToken(`chat/group_chats?limit=${count}&type=${type}`,
            {group_id: group_id}
            ).then((response) => {
                this.setState({
                    _messages: response.messages,
                    total_msg: response.total,
                    group_id: group_id,
                    loader:false,
                });

            if (count == 10) {
                $("#msg_"+group_id).scrollTop($("#msg_"+group_id)[0].scrollHeight);
            }else {
                let element = document.getElementById("msg_"+ group_id);
                $("#msg_"+ group_id).scrollTop(element.clientHeight);
            }

            }).catch(function (error) {
                // console.log(error);
            });
    };

    socket_receive = () => {
        const socket = this.props.socketObj;

        socket.on('receive-group-message', (data) => {
            const sender = data.link_to;
            let other_user = JSON.parse(data.otherUser);
            const loggedUser = loggedInUser();
            other_user.forEach((user, i) => {
                if (sender != user && sender != loggedUser.username ) {
                    this.playSound();
                }
            });
            this.forceUpdate();
        });
        this.socket = socket;
    };

    fire_socket = (group_obj) => {
        let members = [];
        if (this.props.members.length > 0) {
            this.props.members.map((member) => {
                members.push(member.username)
            });
        }
        let user = loggedInUser();
        let data =  { "group_obj":group_obj,"link_to":user.username,"otherUser": JSON.stringify(members)};
        this.socket.emit('send-group-message',data);
    };

    handleScroll = () => {
        let element = document.getElementById("msg_"+this.props.group_chat._id);

        if(element.scrollTop <= 10 && this.state._messages.length < this.state.total_msg){
            const new_count = this.state.count + 1;
            this.setState({
                count: this.state.count + 1,
            });
            let count = new_count * 10;
            if(count <= this.state.total_msg){
                this.setState({
                    _messages:[],
                    loader:true
                });
                this.get_group_messages(this.props.group_chat,count);
            }else{
                //Preventing extra calls to API
                let diff = count - this.state.total_msg;
                if(diff < 10){
                    this.setState({
                        _messages:[],
                        loader:true
                    });
                    this.get_group_messages(this.props.group_chat,this.state.total_msg);
                }
            }
            // element.scrollTo(0,0)
            return;
        }
    };

    render() {
        const { group_chat } = this.props;
        return (
            <div
                className={
                    "PopupChat-box GroupChatWrapper " + this.state.toggle_class
                }
            >
                <GroupPopupHead
                    popup_chat_toggle={this.popup_chat_toggle}
                    group_info={group_chat}
                    remove_group_chat_popup={this.props.remove_group_chat_popup}
                />
                <div className="PopupChat-body">
                    <div className="PopupChat-content">
                        <div className="msg-s-message-list">
                            <div className="tab-content" id="myTabContent">
                                {
                                    this.state.loader ?
                                        <div className="msg-s-message-list gifloader"
                                             style={{position: "absolute", top: "40%"}}>
                                            <img src={LoaderGif} alt="" width="150" height="83"/>
                                        </div>
                                        :
                                        <div
                                            className="tab-pane fade show active"
                                            id={`GroupPopupMsgTab-${group_chat._id}`}
                                            role="tabpanel"
                                            aria-labelledby={`GroupPopupMsgTab-${group_chat._id}`}  onScroll={this.handleScroll}
                                        >
                                            <ul className="msg-s-message-list-content" id={`msg_${group_chat._id}`}>
                                                <GroupPopupMsgList
                                                    group_messages={
                                                        this.state._messages
                                                    }
                                                />
                                            </ul>
                                        </div>
                                }
                                <div
                                    className="tab-pane fade"
                                    id={`GroupSearchTab-${group_chat._id}`}
                                    role="tabpanel"
                                    aria-labelledby={`GroupSearchTab-${group_chat._id}`}

                                >
                                    <GroupPopupSearchList
                                    members={this.props.members}
                                    start_chat={
                                        this.props.start_chat
                                    }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <GroupPopupFooter
                    groupMsgCallback={this.fire_socket}
                    group_info={group_chat}
                    append_msg={this.append_message}
                    popup_chat_toggle={this.popup_chat_toggle}
                    read_group_msg={this.props.read_group_msg}
                />
            </div>
        );
    }
}

// export default groupPopupChat;
