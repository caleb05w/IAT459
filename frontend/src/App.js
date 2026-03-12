import "./App.css"
//to use routes, we will need to set them up here through react-router-dom
import {Route, BrowserRouter as Router, Routes} from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Details from "./pages/Details"
import Marketplace from "./pages/Marketplace"
import TeamSettings from "./pages/TeamSettings"
import {Agentation} from "agentation"
import ProtectedRoute from "./ProtectedRoute"

//need to make auth provider globally available!
import {AuthProvider} from "./context/AuthContext"
import {DataProvider} from "./context/DataContext"

//TODO
//Dashboard View
//Login + Register

//protected routes

//app is where we will house all our routes.
function App() {
  return (
    <AuthProvider>
      <Router>
        <DataProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          {/* //render dashboard only if user has logged in (checked via protecter route.) */}
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/details'
            element={
              <ProtectedRoute>
                <Details />
              </ProtectedRoute>
            }
          />
          <Route path='/marketplace' element={<Marketplace />} />
          <Route
            path='/settings'
            element={
              <ProtectedRoute>
                <TeamSettings />
              </ProtectedRoute>
            }
          />
        </Routes>
        </DataProvider>
      </Router>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </AuthProvider>
  )
}

export default App
