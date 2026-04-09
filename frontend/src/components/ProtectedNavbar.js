import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import Topbar from "./Topbar";
import Button from "./Button";

export default function ProtectedNavbar({ children }) {
  const { logout } = useContext(AuthContext);
  const { refresh } = useContext(DataContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Topbar>
      {children}
      <Button body="Refresh" onClick={refresh} size="sm" style="primary" />
      <Button body="Logout" onClick={handleLogout} size="sm" style="secondary" />
    </Topbar>
  );
}
