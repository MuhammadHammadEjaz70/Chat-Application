import React, { Component } from "react";
import {config} from "../../../utils/utils";

class GroupPopupSearchList extends Component {

    state = {
        config: config(),
        members: [],
        search: ''
    };

    componentWillReceiveProps() {
        this.setState({
            members: this.props.members
        });
    }

    searchMember = (event) => {
        let search_val = event.target.value;
        this.setState({ search: search_val });

        if (search_val.length > 0) {
            let search_member_data = this.state.members.filter((member) =>
                member.name
                    .toLowerCase()
                    .includes(search_val.toLowerCase())
            );
            this.setState({ members: search_member_data });
        } else {
            this.setState({ members: this.props.members });
            this.slider.slickGoTo(0)
        }
    };

    render() {
        return (
            <div className="group-search-height">
                <div className="group-search">
                    <div className="search-input-container">
                        <form className="">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span
                                        className="input-group-text"
                                        id="basic-addon1"
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-ico btn btn-primary"
                                        >
                                            <i className="ri-search-line"></i>
                                        </button>
                                    </span>
                                </div>
                                <input
                                    placeholder="Search people..."
                                    aria-label="Search"
                                    aria-describedby="basic-addon1"
                                    className="form-control"
                                    value={this.state.search}
                                    onChange={this.searchMember}
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <div className="GroupSearch-List-wrapper">
                    <ul>

                        {this.state.members.length > 0 ? this.state.members.map((member) => {
                            return(
                                <li
                                    key={member._id}
                                    onClick={() =>
                                        this.props.start_chat(member.username)
                                    }
                                >
                                    <div className="msg-conversation-card-img">
                                        <div className="name_avatar" title="rogersmith">
                                            <img
                                                src={this.state.config[0].value.replace(
                                                    /\/$/g,
                                                    ""
                                                ) + '/avatar/' + member.username}
                                                alt={member.username}
                                            />
                                        </div>
                                    </div>
                                    <div className="msg-conversation-card-content">
                                        <h4 className="text-truncate mb-0">
                                            { member.name != '' ? member.name : member.username }
                                        </h4>
                                    </div>
                                </li>
                                )
                        }) : ''}

                    </ul>
                </div>
            </div>
        );
    }
}

export default GroupPopupSearchList;
