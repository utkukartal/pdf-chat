import axios from 'axios'


// Define urls
const BACKEND_DOMAIN = "http://127.0.0.1:8000"
const REGISTER_URL = `${BACKEND_DOMAIN}/register/`
const LOGIN_URL = `${BACKEND_DOMAIN}/token/`


// Register user
const register = async(userData) => {
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }

    const response = await axios.post(REGISTER_URL, userData, config)

    if(response.data) {
        localStorage.setItem("user", response.data['access_token'])
    }
    
    return response.data
}


// Login user
const login = async(userData) => {
    const config = {
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        }
    }
    
    const response = await axios.post(LOGIN_URL, userData, config)
    
    if(response.data) {
        localStorage.setItem("user", response.data['access_token'])
    }

    return response.data
}


// Logout user
const logout = async() => {
    return localStorage.removeItem("user")
}


const authService = { register, login, logout }

export default authService

