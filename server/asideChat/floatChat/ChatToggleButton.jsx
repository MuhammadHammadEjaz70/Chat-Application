import React, { Component } from "react";

class chatToggleButton extends Component {
    render() {
        return (
            <div className="text-center">
                <span className="Talk-to-chat"
                      onClick={() =>
                          this.float_chat_toggle('float_mini_action')
                      }
                >
                    <i className="ri-message-2-line"></i>
                    Talk to chat
                </span>
            </div>
        );
    }
}

export default chatToggleButton;
