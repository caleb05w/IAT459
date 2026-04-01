import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import Topbar from "./Topbar";
import Button from "./Button";

export default function ProtectedNavbar({ breadcrumbs, onBreadcrumbClick, children }) {
  const { logout } = useContext(AuthContext);
  const { refresh } = useContext(DataContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Topbar breadcrumbs={breadcrumbs} onBreadcrumbClick={onBreadcrumbClick}>
      {children}
      <Button body="Refresh" onClick={refresh} size="sm" style="primary" />
      <Button body="Logout" onClick={handleLogout} size="sm" style="secondary" />
    </Topbar>
  );
}
