import React, { useState, useEffect } from "react";

const auth = window.osmAuth.osmAuth({
  client_id: "OzEEGgyYM2RSU4sZtucfdT9URz3IM17MFH8i3fJ8aa0",
  scope: "read_prefs write_api",
  redirect_uri: `${window.location.origin}/osm-auth-get-and-post/land.html`,
  singlepage: false,
});

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [getParam, setGetParam] = useState("");
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
        path: `http://0.0.0.0:8080/send_get?msg=${getParam}`,
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

  return (
    <>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>

      {error && <> {error} </>}
      {user && <> Authenticated: {user.name}</>}

      <div>
        <label htmlFor="send_get">
          Send a string via a GET request and query parameters:
        </label>
        <input
          id="send_get"
          type="text"
          value={getParam}
          onChange={(e) => setGetParam(e.target.value)}
        />
        <button onClick={sendGET}>Send</button>
      </div>

      <div>{resp}</div>
    </>
  );
}
