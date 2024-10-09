import { useNavigate } from "react-router-dom"
import { MdCreateNewFolder } from "react-icons/md"
import { toast } from "react-toastify"
import { useDispatch } from "react-redux"
import { useState } from "react"
import { FileInput, Label, Button } from "flowbite-react";
import axios from 'axios'
import { logout, reset } from "../features/auth/authSlice"
import Spinner from "../components/Spinner"


const AddRooms = () => {
    const BACKEND_DOMAIN = "http://127.0.0.1:8000"

    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('user'));


    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        toast.success('Logged out.')
        dispatch(logout())
        dispatch(reset())
        navigate("/")
    }

    const handleChange = (e) => {
        setFile(e.target.files[0]);
    }
    
    const handleSubmit = async () => {
        setLoading(true);
        alterFields(true);

        if (!file) {
            toast.error('Please select a file first.')
            setLoading(false);
            alterFields(false);
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);

        try {
            const config = {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-type": "multipart/form-data"
                }
            }
            
            const response = await axios.post(BACKEND_DOMAIN+'/add-room/', formData, config)
            
            if(response.status == 200) {
                toast.success('Chat room created.')
                navigate('/chat-rooms/')
                return;
            }

            toast.error('An error occured, please reload and try again.')
            setLoading(false);
            alterFields(false);
        } catch (error) {
            if(error.status == 401) {
                toast.error('Timout, please login again.')
                dispatch(logout())
                dispatch(reset())
                navigate("/")
                return
            }

            var detail = ''
            if(error.response && error.response.data.detail) {detail = error.response.data.detail}
            toast.error('Error during file upload: '+detail)
            setLoading(false);
            alterFields(false);
        }
    }
    
    function alterFields(is_disabled) {
        document.getElementById('room_pdf').disabled = is_disabled
        document.getElementById('button').disabled = is_disabled
    }


    return (
        <div className='px-20 py-20 flex justify-center'>
            <div className="w-96">
                <h1 className="main__title flex justify-center">Add Room <MdCreateNewFolder className="h-auto ml-5"/></h1>
                
                {loading && <Spinner />}
                
                <div className="flex justify-end gap-x-3">
                    <Button color="gray" onClick={() => navigate('/chat-rooms/')}>Back</Button>

                    <Button color="failure" onClick={handleLogout}>Logout</Button>
                </div>

                <form className="max-w-md flex flex-col gap-4 mt-5">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="room_pdf" value="Upload a pdf" />
                        </div>

                        <FileInput accept="application/pdf"
                            name="room_pdf"
                            id="room_pdf"
                            placeholder="Your room pdf"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Button type="button" id="button" onClick={handleSubmit}>Submit</Button>
                </form>
            </div>
        </div>
    )
}

export default AddRooms
