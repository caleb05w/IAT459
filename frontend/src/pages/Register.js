import {useState} from "react"
import Button from "../components/Button"
import TextInput from "../components/TextInput"
import Status from "../components/Status"
import {useNavigate} from "react-router-dom"
import PublicNavbar from "../components/PublicNavbar"

const steps = [
  {field: "username", label: "Username", placeholder: "johndoe", type: "text"},
  {field: "password", label: "Password", placeholder: "••••••••", type: "password"},
]

const PORT = 5001

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState(null)

  const values = {username, password}
  const setters = {username: setUsername, password: setPassword}

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`http://localhost:${PORT}/api/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({body: "Successfully registered!", type: "confirm"})
        navigate("/login")
      } else {
        setStatus({body: data.message, type: "error"})
      }
    } catch (e) {
      setStatus({body: "Error registering. Please try again.", type: "error"})
    }
  }

  const handleContinue = (e) => {
    e.preventDefault()
    if (step < steps.length - 1) setStep(step + 1)
    else handleRegister(e)
  }

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <PublicNavbar />
      <div className='flex-1 flex items-center justify-center'>
        <div className='flex flex-col gap-[2rem] w-[448px]'>
          <Status
            body={status?.body}
            type={status?.type}
            onClose={() => setStatus(null)}
          />

          {/* Header */}
          <div className='flex flex-col gap-[0.8rem]'>
            <h1 className='text-black leading-none'>Register</h1>
            <p className='text-secondary'>Let's get you set up in just a few steps.</p>
          </div>

          {/* Sliding steps */}
          <form onSubmit={handleContinue} className='flex flex-col gap-[1.8rem]'>
            <div className='overflow-hidden w-full'>
              <div
                className='flex transition-transform duration-300 ease-in-out'
                style={{
                  width: `${steps.length * 100}%`,
                  transform: `translateX(${-(step * (100 / steps.length))}%)`,
                }}
              >
                {steps.map((s) => (
                  <div key={s.field} style={{width: `${100 / steps.length}%`}}>
                    <TextInput
                      body={s.label}
                      placeholder={s.placeholder}
                      type={s.type}
                      value={values[s.field]}
                      onChange={(e) => setters[s.field](e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='w-full h-px bg-[#D9D9D9]' />
            <div className='flex items-center gap-3'>
              <Button body={step < steps.length - 1 ? "Continue" : "Register"} type="submit" />
              {step > 0 && (
                <Button body="Back" size="lg" style="secondary" onClick={(e) => { e.preventDefault(); setStep(step - 1) }} />
              )}
            </div>
          </form>

          <a
            href='/login'
            className='text-secondary underline w-fit hover:text-black/80 transition-colors'
          >
            <h6>I already have an account</h6>
          </a>
        </div>
      </div>
    </div>
  )
}
