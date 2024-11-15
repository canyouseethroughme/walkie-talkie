import { useState } from "react";
import { Login } from "./Login";
import { LoggedInPage } from "./LoggedInPage";

export default function Home() {
  const [userName, setUserName] = useState<string>("");
  const [loggedInUser, setLoggedInUser] = useState({
    user: "",
    loggedIn: false,
  });

  return loggedInUser.loggedIn ? (
    <LoggedInPage userName={loggedInUser.user} />
  ) : (
    <Login
      onSubmit={(e) => setLoggedInUser({ user: e, loggedIn: true })}
      setUserName={setUserName}
      userName={userName}
    />
  );
}
