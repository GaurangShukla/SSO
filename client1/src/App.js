import "./App.css";

import React, { Component } from "react";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false
    };

    this.myRef = React.createRef();
    window.addEventListener("message", this.msgHandler);
  }

  componentDidMount() {
    if (localStorage.JWToken) {
      this.setState({ isAuthenticated: true });
    }
  }
  // componentDidUpdate() {
  //   if (!localStorage.JWToken) {
  //     this.setState({ isAuthenticated: false });
  //   }
  // }

  getAuthenticated = () => {
    this.myRef.current.contentWindow.postMessage(
      {
        reqType: "JWToken"
      },
      "*"
    );
  };

  createQueryParams = params =>
    Object.keys(params)
      .map(k => `${k}=${encodeURI(params[k])}`)
      .join("&");

  msgHandler = e => {
    if (e.data.hasOwnProperty("JWToken")) {
      if (e.data.JWToken) {
        this.setState({ isAuthenticated: true }, () => {
          localStorage.setItem("JWToken", e.data.JWToken);
        });
      } else {
        // get current URL and redirect to login url
        const params = { continue: window.location };
        let redirectURI =
          encodeURI(`${process.env.REACT_APP_AUTHENTICATOR}`) +
          "?" +
          this.createQueryParams(params);
        window.location = redirectURI;
      }
    }
  };

  render() {
    let { isAuthenticated } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1>Client1 : Home</h1>
          {isAuthenticated ? (
            <div>
              <h1
                onClick={() =>
                  this.setState({ isAuthenticated: false }, () => {
                    localStorage.removeItem("JWToken");
                  })
                }
              >
                "Yay! I am autheneticated!"
              </h1>
            </div>
          ) : (
            <iframe
              title="login iframe"
              sandbox="allow-same-origin allow-scripts"
              style={{ display: "none" }}
              ref={this.myRef}
              src={`${process.env.REACT_APP_AUTHENTICATOR}`}
              onLoad={this.getAuthenticated}
            />
          )}
        </header>
      </div>
    );
  }
}
