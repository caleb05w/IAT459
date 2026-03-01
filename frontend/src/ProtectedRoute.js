import { useContext } from "react";
import { Navigate } from "react-router-dom";
//pull in auth context from auth provider.
import { AuthContext } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  //pull only the token from AuthContedxt
  //Token should load in from localStorage. (Assuming user has signed in.)
  const { token } = useContext(AuthContext);

  //verify if token is there. If not, then redirect to login page.This is edge case.
  if (!token) {
    return <Navigate to="/register" />;
  }

  //   If access granted, render children (prop)
  return children;
}

export default ProtectedRoute;
