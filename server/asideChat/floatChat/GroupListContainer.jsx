import React, { Component } from "react";
import { RequestMethods } from "../../../interceptor/RequestMethods";

class GroupListContainer extends Component {
    state = {
        user_avatar: this.props.group_data.name.charAt(0).toUpperCase(),
        enable_avatar: false,
    };

    componentDidMount() {
    }

    get_group_avatar = (user_id) => {
        RequestMethods.getChatRequestWithToken(
            "/api/chat/get_user_avatar/" + user_id
        ).then((response) => {
                this.setState({
                    user_avatar: response,
                });
            }).catch(function (error) {
                // console.log(error);
            });
    };

    render() {
        const { group_data } = this.props;
        return (
            <li key={group_data._id}
                onClick={() => this.props.get_group_chat(group_data)}
            >
                <div className="msg-conversation-card-img">
                    {!this.state.enable_avatar ? (
                        <div className="name_avatar" title={group_data.name}>
                            {this.state.user_avatar}
                        </div>
                    ) : (
                        <img src={this.state.user_avatar} alt={group_data.name}/>
                    )}

                </div>
                <div className="msg-conversation-card-content">
                    <div className="user-name-with-time">
                        <h4 className={`text-truncate mb-0 ${group_data.new_msg? 'direct-msg' : ''}`}>
                            {group_data.name}
                        </h4>
                        {/*<time className="msg-time-stamp">*/}
                        {/*    {typeof group_data.lastMessage != "undefined"*/}
                        {/*        ? moment(group_data.lastMessage.ts).format("LT")*/}
                        {/*        : moment(group_data.ts).format("LT")}*/}
                        {/*</time>*/}
                    </div>
                    {/*{typeof group_data.lastMesssage != "undefined" ? (*/}
                    {/*    <p className="text-truncate m-0">*/}
                    {/*        {typeof group_data.lastMessage.attachments !=*/}
                    {/*        "undefined"*/}
                    {/*            ? "{attachment}"*/}
                    {/*            : group_data.lastMessage.msg}*/}
                    {/*    </p>*/}
                    {/*) : (*/}
                    {/*    ""*/}
                    {/*)}*/}
                </div>
            </li>
        );
    }
}

export default GroupListContainer;
