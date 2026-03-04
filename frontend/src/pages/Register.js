import {useState} from "react"
import Button from "../components/Button"
import TextInput from "../components/TextInput"
import Status from "../components/Status"
import {useNavigate} from "react-router-dom"

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const PORT = 5001

  const [status, setStatus] = useState(null)

  //need function to register user, and send it to DB.
  const handleRegister = async (e) => {
    //stops page from refreshing when sending data.
    e.preventDefault()
    try {
      //send req
      //backedn is hosted on port 5001.
      //api is a prefix for saying this is for backend
      //auth is the file path
      //register is the function that we are calling.
      const res = await fetch(`http://localhost:${PORT}/api/auth/register`, {
        method: "POST", //sendind data.
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
      })

      //res is short for response. It gives us status's.
      //ok = true/false if succeeded or not
      //res.status returns the status
      //res.json reads the response body and parses it as json.
      const data = await res.json()

      if (res.ok) {
        setStatus({body: "Successfully registered!", type: "confirm"})
        navigate("/login")
      } else {
        setStatus({body: data.message, type: "error"})
      }
    } catch (e) {
      setStatus({
        body: "Error registering. Please try again.",
        type: "error",
      })
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
              Register
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
            <Button body='Register' onClick={handleRegister} />
          </div>

          {/* Register link */}
          <a
            href='/login'
            className='text-[16px] text-secondary underline w-fit hover:text-black/80 transition-colors'
            style={{letterSpacing: "-0.4px"}}>
            I already have an account
          </a>
        </div>
      </div>
      {/* Right — placeholder */}
      <div className='w-[50%] bg-gray-200' />
    </div>
  )
}
