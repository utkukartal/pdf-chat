import { Link, useNavigate } from "react-router-dom"
import { BiUser } from "react-icons/bi"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { useEffect, useState } from "react"
import { Button, TextInput } from "flowbite-react";
import { register, reset } from "../features/auth/authSlice"
import Spinner from "../components/Spinner"


const RegisterPage = () => {
    const [formData, setFormData] = useState({
        "email": "",
        "first_name": "",
        "last_name": "",
        "password": "",
        "re_password": "",
    })

    const { email, first_name, last_name, password, re_password } = formData
    const {user, isLoading, isErrror, isSuccess, message} = useSelector((state) => state.auth)


    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if(!(first_name || last_name || email || password || re_password)) {
            toast.error("All fields are required.")
        }else if(password !== re_password) {
            toast.error("Passwords do not match.")
        }else {
            const userData = {
                first_name,
                last_name,
                email,
                password,
                re_password
            }
            dispatch(register(userData))
        }
    }

    useEffect(() => {
        if(isErrror) {
            toast.error(message)
        }
        
        if(isSuccess || user) {
            toast.success("Account created succesfully.")
            navigate("/")
        }

        dispatch(reset())
    }, [isErrror, isSuccess, user, navigate, dispatch])


    return (
        <div className='flex px-20 py-20 justify-center'>
            <div className="w-96">
                <h1 className="main__title flex justify-center">Register <BiUser className="h-auto ml-5"/></h1>
                
                {isLoading && <Spinner />}

                <form className="max-w-md flex flex-col gap-4 mt-5">
                    <div>
                        <TextInput type="email"
                            name="email" 
                            placeholder="Your email"
                            onChange={handleChange}
                            value={email}
                            required 
                        />
                    </div>

                    <div>
                        <TextInput type="text"
                            name="first_name" 
                            placeholder="Your first name"
                            onChange={handleChange}
                            value={first_name}
                            required 
                        />
                    </div>

                    <div>
                        <TextInput type="text"
                            name="last_name" 
                            placeholder="Your last name"
                            onChange={handleChange}
                            value={last_name}
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

                    <div>
                        <TextInput type="password"
                            name="re_password"
                            placeholder="Your password again"
                            onChange={handleChange}
                            value={re_password}
                            required
                        />
                    </div>

                    <p className="flex">
                        Already have an account?
                        <Link to="/login" className="ml-2 text-cyan-600">
                            Login.
                        </Link>
                    </p>
                    <Button type="submit" onClick={handleSubmit}>Submit</Button>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
