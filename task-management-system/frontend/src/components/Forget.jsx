import { useState } from "react";

export const Forget = () => {
  const [email, setEmail] = useState("");
  return (
    <div>
      <h1>Forget Password</h1>
      <form action="/" method="post">
        <input
          type="email"
          name="email"
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Forget</button>
      </form>
    </div>
  );
};
