import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ChatRooms from "./pages/ChatRooms"
import AddRoom from "./pages/AddRoom"
import Room from "./pages/Room"
import NotFoundPage from "./pages/NotFoundPage"
import "react-toastify/dist/ReactToastify.css"
import './index.css'


function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate replace to="/login" />} />
                    <Route path="/login/" element={<LoginPage />} />
                    <Route path="/register/" element={<RegisterPage />} />

                    <Route path="/chat-rooms/" element={<ChatRooms />} />
                    <Route path="/add-room/" element={<AddRoom />} />
                    <Route path="/room/:id" element={<Room />} />

                    <Route path="*" element={<NotFoundPage />}/>
                </Routes>
            </Router>
            <ToastContainer />
        </>
    )
}

export default App
