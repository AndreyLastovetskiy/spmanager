import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "../../hook/context"


export const Logout = () => {
    const navigate = useNavigate()
    const { user, setUser } = useContext()

    useEffect(() => {
        if(!user.address){
            return navigate("/login")
        }

        setUser({})
        navigate("/")
    })

    return null
}