import React, { Component } from "react";
import {Tooltip as ReactTooltip} from "react-tooltip";
import moment from "moment";
import $ from 'jquery';

class GroupPopupHead extends Component {
    state = {
        user_avatar: this.props.group_info.name.charAt(0).toUpperCase(),
        enable_avatar: false,
    };
    render() {
        const { group_info } = this.props;
        return (
            <div className="chat-header group-header">
                <div id="chat-box-toggle" className={`header ${group_info.receive_msg ? 'active' : ''}`} >
                    <div
                        className="right-content"
                        onClick={() =>
                            this.props.popup_chat_toggle("popup_mini_action", group_info)
                        }
                    >
                        <div className="avatar-wrap">
                            {!this.state.enable_avatar ? (
                                <div
                                    className="name_avatar"
                                    title={group_info.name}
                                >
                                    {this.state.user_avatar}
                                </div>
                            ) : (
                                <img
                                    src={this.state.user_avatar}
                                    alt={group_info.name}
                                />
                            )}
                        </div>
                        <a href="#!" className="user-link">
                            {group_info.name}
                        </a>
                    </div>
                    <div className="left-content">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <a
                                    className="nav-link active"
                                    id="GroupPopupMsgTab-tab"
                                    data-toggle="tab"
                                    href={`#GroupPopupMsgTab-${group_info._id}`}
                                    role="tab"
                                    aria-controls="GroupPopupMsgTab"
                                    aria-selected="true"
                                    data-tip data-for="ChatRoom"
                                >
                                    <i className="ri-message-2-line"></i>
                                    <ReactTooltip id="ChatRoom" place="top" effect="solid">
                                        Chat Room
                                    </ReactTooltip>
                                </a>
                            </li>
                            <li className="nav-item" role="presentation">
                                <a
                                    className="nav-link"
                                    id="GroupSearchTab-tab"
                                    data-toggle="tab"
                                    href={`#GroupSearchTab-${group_info._id}`}
                                    role="tab"
                                    aria-controls="GroupSearchTab"
                                    aria-selected="false"
                                    data-tip data-for="UsersList"
                                >
                                    <i className="ri-group-line"></i>
                                    <ReactTooltip id="UsersList" place="top" effect="solid">
                                        Users List
                                    </ReactTooltip>
                                </a>
                            </li>
                        </ul>

                        <span
                            id="close-btn"

                            onClick={() =>
                                this.props.remove_group_chat_popup(
                                    group_info._id
                                )
                            }
                            data-tip data-for="Closechat"
                        >
                            <i className="arrow-btn ri-close-line"></i>
                            <ReactTooltip id="Closechat" place="top" effect="solid">
                                    Close chat
                                </ReactTooltip>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default GroupPopupHead;
