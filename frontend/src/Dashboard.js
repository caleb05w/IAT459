// need to fetch token from authProvider
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button";
//use this to decode the token.
import { jwtDecode } from "jwt-decode";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  useEffect(() => {
    console.log("token", token);

    if (token) {
      const user = jwtDecode(token);
      console.log("user", user);
      setUsername(user.username);
    }
  }, []);

  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen gap-[2rem] flex flex-col items-center justify-center bg-white">
      <h1 className="text-[24px] font-medium text-black">Dashboard</h1>
      {username}
      <Button body="Logout" onClick={handleLogout} />
    </div>
  );
}
