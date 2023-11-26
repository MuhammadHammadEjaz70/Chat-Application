import React, { Component } from "react";
import {RequestMethods} from "../../../interceptor/RequestMethods";

class UserListContainer extends Component {
    state = {
        user_avatar: this.props.user_data.username.charAt(0).toUpperCase(),
        enable_avatar: false,
        status: this.props.user_data.status,
    };

    get_user_avatar = (user_id) => {
        RequestMethods.getChatRequestWithToken("/api/chat/get_user_avatar/" + user_id)
            .then((response) => {
                this.setState({
                    user_avatar: response,
                });
            });
    };

    render() {
        const { user_data } = this.props;
        return (
            <li
                key={user_data._id}
                onClick={() =>
                    this.props.start_direct_messaging(user_data.username)
                }
            >
                <div className="msg-conversation-card-img">
                    {!this.state.enable_avatar ? (
                        <div className="name_avatar" title={user_data.username}>
                            {this.state.user_avatar}
                        </div>
                    ) : (
                        <img
                            src={this.state.user_avatar}
                            alt={user_data.username}
                        />
                    )}
                    <span className={`user-status ${this.state.status == 'online' ? 'status-online' : ''}`}></span>
                </div>
                <div className="msg-conversation-card-content">
                    <h4 className="text-truncate mb-0">
                        {user_data.name != ""
                            ? user_data.name
                            : user_data.username}
                    </h4>
                </div>
            </li>
        );
    }
}

export default UserListContainer;
