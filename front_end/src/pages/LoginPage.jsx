import { Link, useNavigate } from "react-router-dom"
import { BiLogInCircle } from "react-icons/bi"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { useEffect, useState } from "react"
import { Button, TextInput } from "flowbite-react";
import { login, reset } from "../features/auth/authSlice"
import Spinner from "../components/Spinner"


const LoginPage = () => {
    const [formData, setFormData] = useState({
        "username": "",
        "password": "",
    })

    const { username, password } = formData
    const {user, isLoading, isErrror, isSuccess, message} = useSelector((state) => state.auth)


    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }
    
    const handleSubmit = (e) => {
        e.preventDefault()

        if(!(username || password)) {
            toast.error("All fields are required.")
        }else {
            const userData = {
                username,
                password,
            }
            
            dispatch(login(userData))
        }
    }

    useEffect(() => {
        if(isErrror) {
            toast.error(message)
        }

        if(isSuccess || user) {
            navigate("/chat-rooms/")
        }

        dispatch(reset())
    }, [isErrror, isSuccess, user, navigate, dispatch])

    
    return (
        <div className='px-20 py-20 flex justify-center'>
            <div className="w-96">
                <h1 className="main__title flex justify-center">Login <BiLogInCircle className="h-auto ml-5"/></h1>

                {isLoading && <Spinner />}

                <form className="max-w-md flex flex-col gap-4 mt-5">
                    <div>
                        <TextInput type="email"
                            name="username" 
                            placeholder="Your email"
                            onChange={handleChange}
                            value={username}
                            required 
                        />
                    </div>

                    <div>
                        <TextInput type="password"
                            name="password"
                            placeholder="Your password"
                            onChange={handleChange}
                            value={password}
                            required
                        />
                    </div>

                    <p className="flex">
                        Don't have an account?
                        <Link to="/register" className="ml-2 text-cyan-600">
                            Register.
                        </Link>
                    </p>
                    <Button type="submit" onClick={handleSubmit}>Submit</Button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
