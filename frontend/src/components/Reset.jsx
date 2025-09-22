import { useState } from "react";

export const Reset = () => {
  const [password, setPassword] = useState("");
  return (
    <div>
      <h1>Rest Password</h1>
      <form action="/" method="post">
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Reset </button>
      </form>
    </div>
  );
};
