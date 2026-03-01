//these files will be globally available.

import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";

//this is basically a bucket that any componetn can reach into and use the components from in here.
//we export it so that any file can import it, via createContext();
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token" || null));
  //set user as null so that it wont exist unless detected
  const [user, setUser] = useState(null);

  useEffect(
    () => {
      //first, check if the token exists
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);
        } catch (e) {
          console.warn("issue decodiung token", e);
          logout();
        }
      } else {
        setUser(null);
      }
    },
    //triggers each time token changes
    [token],
  );

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    console.log("logout successful");
  }

  function login(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    console.log("login successful");
  }

  //value is what is made globally available. In this case, the login, logout function, aswell as the user and the token.
  //Any component inside auth provider can use these.
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {/* //where the rest of our code will sit */}
      {children}
    </AuthContext.Provider>
  );
}

//Both AuthContext and Authprovider /or whatever name, work in conjunction with each other.
//export const AuthContext = createContext() <-- set it up
//export function AuthContext.Provider <-- provides it.

//that way, you can call and desrtucture it
//const {user, token, login, logout} = userContext(AuthContext)
//use Context is syntax here that allows you to reach in and grab.
