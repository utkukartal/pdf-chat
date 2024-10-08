import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { Table, Button } from "flowbite-react";
import axios from 'axios'
import { logout, reset } from "../features/auth/authSlice"
import Spinner from "../components/Spinner"


const ChatRooms = () => {
    const BACKEND_DOMAIN = 'http://127.0.0.1:8000'

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
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
                    "Content-type": "multipart/form-data"
                }
            }
            
            const response = await axios.get(BACKEND_DOMAIN+'/get-chat-rooms/', config)

            setData(response.data);
            setLoading(false);
        } catch(error) {
            if(error.status == 401) {
                toast.error('Timout, please login again.')
                dispatch(logout())
                dispatch(reset())
                navigate("/")
                return
            }

            toast.error('Failed to fetch data')
            setLoading(false);
        }
    }

    const deleteRoom = async (room_id) => {
        try {
            const config = {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-type": "application/json"
                }
            }
            
            const response = await axios.delete(BACKEND_DOMAIN+'/delete-room/'+room_id, config)
            
            if(response.status == 200) {
                toast.success('Chat room deleted.')
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

            toast.error('Error during file deletion:'+error)
        }
    }

    function formatDate(date_str) {
        const date = new Date(date_str);
        const formattedDate = date.toLocaleDateString('tr', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('tr', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return `${formattedTime}  ${formattedDate}`
    }

    
    return (
        <div className='flex px-0 md:px-20 py-20 w-full justify-center'>
            <div className="w-full md:w-7/12">
                <h1 className="main__title flex justify-center">Chat Rooms</h1>
                
                {loading && <Spinner />}

                <div className="flex justify-end gap-x-3">
                    <Button color="blue" onClick={() => navigate('/add-room/')}>Add New</Button>

                    <Button color="failure" onClick={handleLogout}>Logout</Button>
                </div>

                <Table className="mt-5 w-48 md:w-full">
                    <Table.Head>
                        <Table.HeadCell>Room Name</Table.HeadCell>
                        <Table.HeadCell>Date Added</Table.HeadCell>
                        <Table.HeadCell>Settings</Table.HeadCell>
                    </Table.Head>

                    <Table.Body className="divide-y text-black">
                        {data.length === 0 ? (
                            <Table.Row className="text-center"><Table.Cell colSpan={3}>No chat rooms registered.</Table.Cell></Table.Row>
                        ) : (data.map((item) => (
                            <Table.Row key={item.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell>{item.file_name}</Table.Cell>
                                <Table.Cell>{formatDate(item.creation_date)}</Table.Cell>
                                <Table.Cell>
                                    <a href={BACKEND_DOMAIN+item.file_path.replace('./', '/')} target="_blank" className="font-medium text-green-600 hover:underline">
                                        File
                                    </a>
                                    <a onClick={() => navigate("/room/"+item.id)} className="font-medium text-cyan-600 hover:underline ml-3 cursor-pointer">
                                        Open Room
                                    </a>
                                    <a onClick={() => deleteRoom(item.id)} className="font-medium text-red-600 hover:underline ml-3 cursor-pointer">
                                        Delete
                                    </a>
                                </Table.Cell>
                            </Table.Row>
                        )))}
                    </Table.Body>
                </Table>
            </div>
        </div>
    )
}

export default ChatRooms
