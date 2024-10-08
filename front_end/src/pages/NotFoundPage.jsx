import { TbError404 } from "react-icons/tb";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom"


const NotFoundPage = () => {
    const navigate = useNavigate()
    
    return (
        <div className='px-20 py-20 flex justify-center'>
            <div className="w-96">
                <h1 className="main__title flex justify-center">Nothing here <TbError404 className="h-auto ml-5"/></h1>

                <div className="flex justify-center mt-10">
                    <Button color="blue" onClick={() => navigate('/')}>Home</Button>
                </div>
            </div>
        </div>
    )
}

export default NotFoundPage
