import React, { Component } from "react";
import { config } from "../../../utils/utils";
import moment from "moment";
import $ from 'jquery';
let show_time = '';
let current_date = '';

class GroupPopupMsgList extends Component {
    state = {
        enable_avatar: false,
        config: config(),
    };
    render() {
        const { group_messages } = this.props;
        return (
            <React.Fragment>
                {group_messages != "" && group_messages != undefined ? (
                    [...group_messages].reverse().map((msg) => {
                        {
                            current_date = moment(msg.ts).format('LL');
                            current_date != show_time ?
                                show_time = current_date : current_date = ''
                        }
                        return (
                            <React.Fragment key={ Math.random().toString(36).substr(2, 9) }>
                                { (show_time == current_date) ?
                                    <li>
                                        <div className="date-time-wrap">
                                            <span>{moment(msg.ts).format('LL')}</span>
                                        </div>
                                    </li>

                                    : null
                                }
                                {typeof msg.attachments != "undefined" &&
                                msg.attachments.length > 0 ? (
                                    msg.attachments.map((attachment) => {
                                        return (
                                            <li key={msg._id.toString()}
                                                className="msg-s-message-list__event clearfix">
                                                <div className="msg-conatiner">
                                                    <a href="#!" className="msg-s-event-listitem__link">
                                                        <div className="msg-abject">
                                                            <img
                                                                src={this.state.config[0].value.replace(
                                                                    /\/$/g,
                                                                    ""
                                                                ) + '/avatar/' + msg.u.username}
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
                                                            {moment(
                                                                msg.ts
                                                            ).format("LT")}
                                                        </time>
                                                    </div>
                                                    <div className="msg-s-event-listitem__message-bubble msg-s-event-listitem__attachment-item">
                                                        <div className="msg-s-event-listitem__image-container">
                                                            <a href={this.state.config[0].value.replace(
                                                                /\/$/g,
                                                                ""
                                                            ) +
                                                            attachment.image_url} target="_blank">{attachment.image_url}</a>

                                                            {/*<img*/}
                                                            {/*    src={*/}
                                                            {/*        this.state.config[0].value.replace(*/}
                                                            {/*            /\/$/g,*/}
                                                            {/*            ""*/}
                                                            {/*        ) +*/}
                                                            {/*        attachment.image_url*/}
                                                            {/*    }*/}
                                                            {/*    alt=""*/}
                                                            {/*    className="msg-s-event-listitem__image block ember-view"*/}
                                                            {/*/>*/}
                                                        </div>

                                                        <div
                                                            id="ember559"
                                                            className="ember-view"
                                                        ></div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="msg-s-message-list__event clearfix" key={msg._id.toString()}>
                                        <div className="msg-conatiner">
                                            <a href="#!" className="msg-s-event-listitem__link">
                                                <div className="msg-abject">
                                                    <img src={this.state.config[0].value.replace(
                                                            /\/$/g,
                                                            ""
                                                        ) + '/avatar/' + msg.u.username}
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
                                                <time className="msg-time">{moment(msg.ts).format("LT")}
                                                </time>
                                            </div>
                                            <div className="msg-s-event-listitem__message-bubble">
                                                <p className="msg-s-event-listitem__body">
                                                    {msg.msg}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                )}
                            </React.Fragment>
                        );
                    })
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

export default GroupPopupMsgList;
