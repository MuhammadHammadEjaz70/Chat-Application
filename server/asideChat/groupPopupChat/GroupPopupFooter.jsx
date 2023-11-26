import React, { Component } from "react";
import { RequestMethods } from "../../../interceptor/RequestMethods";
import {rcData} from "../../../utils/utils";
import AttachFile from "../../../../images/attach_file.svg";
import moment from "moment";
import $ from 'jquery';

class GroupPopupFooter extends Component {
    state = {
        message: "",
        attachment: "",
        attachment_preview: "",
        attachment_value: "",
        username: "",
        rc_id: ""
    };

    componentDidMount() {
        let user_data = rcData();
        this.setState({
            username:user_data.me.username,
            rc_id:user_data.userId
        });
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
        this.setState({ message, attachment_preview: attachment_preview, attachment: attachment });
    };

    sendMessage = (e) => {
        e.preventDefault();
        let funtionName = "/chat/send_message";
        let formData = {
            rid: this.props.group_info._id,
            msg: this.state.message,
        };
        if (this.state.attachment != "") {
            funtionName = "/chat/attach_message/" + this.props.group_info._id;
            // Create an object of formData
            formData = new FormData();
            // Update the formData object
            formData.append(
                "file",
                this.state.attachment,
                this.state.attachment.name
            );
        }

        const msg_obj = {
            "message": {
                "rid": this.props.group_info._id,
                "msg": this.state.message,
                "ts": moment().format(),
                "u": {
                    "_id": this.state.rc_id,
                    "username": this.state.username
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
        this.setState({ message: "", attachment: "", attachment_preview: "", attachment_value: ""  });

        RequestMethods.postChatRequestWithToken(funtionName, formData)
            .then((response) => {
                // this.props.groupMsgCallback(this.props.group_info);
            }).catch(function (error) {
                // console.log(error);
            });
    };

    remove_attachment = () => {
        this.setState({ attachment_preview: "", attachment: "", attachment_value: "" });
    };

    handleFocus = (group_obj) => {
        this.props.popup_chat_toggle('', group_obj);
        this.props.read_group_msg(group_obj)
    };

    render() {
        const { group_info } = this.props;
        return (
            <div className="PopupChat-footer">
                <form onSubmit={this.sendMessage} className="">
                    {
                        this.state.attachment_preview != "" ?
                            <div className="inbox-send-attached-outer">
                                <span onClick={this.remove_attachment}><i className="ri-close-fill"></i></span>
                                <div className="inbox-send-attached-inner">
                                    <img src={AttachFile} alt=""/>
                                </div>
                            </div>
                            : ''
                    }
                    <div className="input-group">
                        <input
                            placeholder="Write your message ..."
                            className="form-control"
                            onChange={this.handleChange}
                            onFocus={() => this.handleFocus(group_info)}
                            value={this.state.message}
                        />
                        <div className="input-group-append">
                            <span className="input-group-text">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    <i className="ri-send-plane-fill"></i>
                                </button>
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
                                    />
                                </div>
                            </span>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export default GroupPopupFooter;
