import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { Button, TextInput } from "flowbite-react";
import axios from 'axios'
import { logout, reset } from "../features/auth/authSlice"
import Spinner from "../components/Spinner"


const RegisterPage = () => {
    const BACKEND_DOMAIN = 'http://127.0.0.1:8000'

    const { id } = useParams();

    const [formData, setFormData] = useState({
        "id": id,
        "question": "",
    })
    const { question } = formData

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token] = useState(localStorage.getItem('user'));


    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleLogout = () => {
        toast.success('Logged out.')
        dispatch(logout())
        dispatch(reset())
        navigate("/")
    }

    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        try {
            const config = {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-type": "application/json"
                }
            }
            
            const response = await axios.get(BACKEND_DOMAIN+'/get-conversation/'+id, config)
            
            setData(response.data.conversations.reverse());
            setLoading(false);
        } catch(error) {
            if(error.status == 401) {
                toast.error('Timout, please login again.')
                dispatch(logout())
                dispatch(reset())
                navigate("/")
                return
            }else if(error.status == 400) {
                return
            }

            var detail = ''
            if(error.response && error.response.data.detail) {detail = error.response.data.detail}
            toast.error('Failed to fetch data. ' + detail)
            setLoading(false)
        }
    }

    
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }
    
    function alterFields(is_disabled) {
        document.getElementById('question').disabled = is_disabled
        document.getElementById('button').disabled = is_disabled
    }

    const handleSubmit = async () => {
        setLoading(true);
        alterFields(true);
        
        if (!question) {
            toast.error('Question is required.')
            setLoading(false);
            alterFields(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-type": "application/json"
                }
            }
            
            const response = await axios.post(BACKEND_DOMAIN+'/make-conversation/', formData, config)
            
            setLoading(false);
            alterFields(false);
            
            if(response.status == 200) {
                formData.question = ''
                toast.success('Conversation is made.')
                fetchData()
                return;
            }

            toast.error('An error occured, please reload and try again.')
        } catch (error) {
            if(error.status == 401) {
                toast.error('Timout, please login again.')
                dispatch(logout())
                dispatch(reset())
                navigate("/")
                return
            }

            toast.error('Error.')
            setLoading(false);
            alterFields(false);
        }
    }

    const handleEnterPress = (event) => {
        if (event.key === 'Enter') {
            handleSubmit()
        }
    };


    return (
        <div className='px-48 py-10 grid grid-cols-3 gap-20'>
            <div className="col-span-2">
                <h1 className="flex justify-right text-3xl">History</h1>
                
                <div className="p-5 grid grid-cols-2 gap-10 mt-10 rounded border border-cyan-700 h-144 overflow-y-auto" id="conversation_parent">
                    {data.length === 0 ? (
                        <div className="col-span-2 text-center font-medium">There are no conversations yet.</div>
                    ) : (data.map((item) => {
                        if(item.by == 'User') {
                            return (
                                <div key={item.creation_date} className="col-span-2 text-right whitespace-pre-wrap">
                                    <h6 className="text-cyan-700 font-medium">{item.by}, {item.creation_date}</h6>
                                    <p className="break-all pl-20">{item.content}</p>
                                    <hr className="mt-5"/>
                                </div>
                            )
                        }else {
                            return (
                                <div key={item.creation_date} className="col-span-2 whitespace-pre-wrap">
                                    <h6 className="text-cyan-700 font-medium">{item.by}, {item.creation_date}</h6>
                                    <p className="break-all pr-20">{item.content}</p>
                                    <hr className="mt-5"/>
                                </div>
                            )
                        }
                    }))}
                </div>
            </div>

            <div className="">
                <h1 className="flex justify-right text-3xl">Ask about the file.</h1>
                
                {loading && <Spinner />}

                <div className="flex justify-end gap-x-3 mt-4">
                    <Button color="gray" onClick={() => navigate("/chat-rooms/")}>Back</Button>

                    <Button color="failure" onClick={handleLogout}>Logout</Button>
                </div>

                <div className="flex flex-col gap-4 mt-5">
                    <div>
                        <TextInput type="text"
                            id="question"
                            name="question"
                            placeholder="Your question"
                            onChange={handleChange}
                            onKeyDown={handleEnterPress}
                            value={question}
                            required 
                        />
                    </div>

                    <Button id="button" type="button" onClick={handleSubmit}>Submit</Button>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
