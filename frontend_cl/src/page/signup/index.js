import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "../../hook/context"
import { addUser } from "../../utils/users"


export const SignUp = () => {
    const navigate = useNavigate()
    const { user, setUser, contract, web3 } = useContext()

    const [loading, setLoading] = useState(false)
    const [credentials, setCredentials] = useState({
        username: "",
        // shop: "",
        password: "",
        secret: ""
    })

    useEffect(() => {
        if(user.address) navigate("/")
    })

    const handleChange = (event) => {
        const {name, value} = event.currentTarget
        setCredentials({ ...credentials, [name]: value})
    }

    const handleSubmit = async (event) => {
        setLoading(true)
        event.preventDefault()
        const { username, password, secret } = credentials //shop

        try {
            const address = await addUser(web3, contract, username, password, secret) //shop

            const { currentRole, maxRole } = await contract.methods.getUser(address).call()
            const balance = await web3.eth.getBalance(address)
            setUser({ username, address, currentRole, maxRole, balance })
            navigate("/")
        } catch(event) {
            setLoading(false)
            console.log(event.message)
        }
    }

    return(
        <div className="signup_form">
            {loading && <h4>Loading ...</h4>}
            <form onSubmit={handleSubmit}>
                <label>
                    Username
                    <input name="username" value={credentials.username} onChange={handleChange}></input>
                </label>
                <br />
                <label>
                    Password
                    <input name="password" value={credentials.password} onChange={handleChange}></input>
                </label>
                <br />
                <label>
                    Secret
                    <input name="secret" value={credentials.secret} onChange={handleChange}></input>
                </label>
                <br />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}