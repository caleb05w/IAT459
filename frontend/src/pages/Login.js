import {useState, useEffect, useContext} from "react"
import Button from "../components/Button"
import TextInput from "../components/TextInput"
import Status from "../components/Status"
import {useNavigate} from "react-router-dom"
//need this for login function from AuthContext JS
import {AuthContext} from "../context/AuthContext"

export default function Login() {
  const {login} = useContext(AuthContext)
  //little debug test for me!
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      console.log("token found!", token)
    } else {
      console.log("no token found")
    }
  }, [])
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {
    // prevents reload during process
    e.preventDefault()
    try {
      console.log("Attempting Login ...")
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus({body: "Login successful!", type: "confirm"})
        console.log("Logging User In ...")
        //needs to update the login token in authcontext
        login(data.token)
        navigate("/")
      } else {
        setStatus({body: data.message, type: "error"})
      }
      // I need to retrieve and match the password and username combo with
      //the existing mongodb user set.

      //then if it matches, I can navigate them to the dashboard.
      //also give them a wristband.
    } catch (e) {
      console.warn("issue logging in", e)
    }
  }

  return (
    <div className='min-h-screen flex flex-row'>
      {/* Left — form */}
      <div className='w-[50%] flex items-center justify-center bg-white'>
        <div className='flex flex-col gap-[2rem] w-[448px]'>
          <Status
            body={status?.body}
            type={status?.type}
            onClose={() => setStatus(null)}
          />
          {/* Header */}
          <div className='flex flex-col gap-[0.8rem]'>
            <h1 className='text-[24px] font-medium text-black leading-none'>
              Login
            </h1>
            <p className='text-[16px] text-secondary'>
              Let's get you set up in just a few steps.
            </p>
          </div>

          {/* Form */}
          <div className='flex flex-col gap-[1.8rem]'>
            <TextInput
              body='Username'
              placeholder='johndoe'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextInput
              body='Password'
              placeholder='••••••••'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Divider */}
            <div className='w-full h-px bg-[#D9D9D9]' />

            {/* Continue button */}
            <Button body='Continue' onClick={handleLogin} />
          </div>
        </div>
      </div>
      {/* Right — placeholder */}
      <div className='w-[50%] bg-gray-200' />
    </div>
  )
}
