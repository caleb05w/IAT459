import "./App.css";
//to use routes, we will need to set them up here through react-router-dom
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import { Agentation } from "agentation";

//TODO
//Dashboard View
//Login + Register

//protected routes

//app is where we will house all our routes.
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  );
}

export default App;
