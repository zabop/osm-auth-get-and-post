import React, { useState, useEffect } from "react";

const auth = window.osmAuth.osmAuth({
  client_id: "cJmOITzl1zLD8-XwfNTMXmtOMVJSXppey8Dg0Y2UrAs",
  scope: "read_prefs",
  redirect_uri: `${window.location.origin}/osm-auth-get-and-post/land.html`,
  singlepage: false,
});

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [getParam, setGetParam] = useState("");
  const [postContent, setPostContent] = useState("");
  const [resp, setResp] = useState("");

  function fetchUserDetails() {
    auth.xhr({ method: "GET", path: "/api/0.6/user/details" }, (err, res) => {
      if (err) {
        setError("Failed to fetch user details");
        return;
      }

      const userEl = res.getElementsByTagName("user")[0];
      const changesets = res.getElementsByTagName("changesets")[0];

      setUser({
        name: userEl.getAttribute("display_name"),
        id: userEl.getAttribute("id"),
        count: changesets.getAttribute("count"),
      });
      setError("");
    });
  }

  useEffect(() => {
    if (
      window.location.search.includes("code=") &&
      !auth.authenticated() &&
      !user &&
      !error
    ) {
      auth.authenticate(() => {
        window.history.pushState({}, null, window.location.pathname);
        fetchUserDetails();
      });
    }
  }, []);

  function handleLogin() {
    auth.authenticate(() => fetchUserDetails());
  }

  function handleLogout() {
    auth.logout();
    setUser(null);
    setError("");
  }

  function sendGET() {
    if (!auth.authenticated()) {
      setError("You must be logged in to send.");
      return;
    }

    auth.xhr(
      {
        method: "GET",
        //path: `http://0.0.0.0:8080/get?msg=${getParam}`,
        path: `https://backend-twilight-brook-3157.fly.dev/get?msg=${getParam}`,
        prefix: false,
        options: {
          headers: {
            Accept: "application/json",
          },
        },
      },
      (err, res) => {
        setResp(JSON.parse(res)["message"]);
      }
    );
  }

  function sendPOST() {
    if (!auth.authenticated()) {
      setError("You must be logged in to send.");
      return;
    }
    auth.xhr(
      {
        method: "POST",
        // path: `http://0.0.0.0:8080/post`,
        path: `https://backend-twilight-brook-3157.fly.dev/post/`,
        prefix: false,
        options: {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: { msg: postContent },
        },
      },
      (err, res) => {
        console.log("err", err);
        setResp(JSON.parse(res)["message"]);
      }
    );
  }

  return (
    <>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>

      {error && <> {error} </>}
      {user && <> Authenticated: {user.name}</>}

      <div>
        <label htmlFor="get">Send a string via GET as a query param:</label>
        <input
          id="get"
          type="text"
          value={getParam}
          onChange={(e) => setGetParam(e.target.value)}
        />
        <button onClick={sendGET}>Send</button>
      </div>
      <div>
        <label htmlFor="post">Send a string via POST in request body:</label>
        <input
          id="post"
          type="text"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        <button onClick={sendPOST}>Send</button>
      </div>

      <div>{resp}</div>
    </>
  );
}
