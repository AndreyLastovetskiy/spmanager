import { useContext } from "../../hook/context"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"

export const Login = () => {
    const navigate = useNavigate()
    const { user, setUser, contract, web3 } = useContext()

    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
        secret: "",
    })

    useEffect(() => {
        if (user.address) navigate("/")
    })

    const handleChange = (event) => {
        const { name, value } = event.currentTarget
        setCredentials({ ...credentials, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const { username, password, secret } = credentials

        try {
            const address = await contract.methods.getUserAddress(username).call()
            console.log(address)
            console.log(username)
            console.log(password)
            console.log(secret)
            const auth = await web3.eth.personal.unlockAccount(address, password, 0)

            if(auth) {
                await contract.methods
                    .authorizateUser(username, password, secret)
                    .call()
            }

            const {currentRole, maxRole} = await contract.methods
                .getUser(address)
                .call()
            
            const balance = await web3.eth.getBalance(address)
            setUser({username, address, balance, currentRole, maxRole})
        } catch(e) {
            console.log(e)
            alert("Wrong username, password or secret!")
        }
    }

    return(
        <div className="form_login">
            <form onSubmit={handleSubmit}>
                <label>
                    Username
                    <input name="username" value={credentials.name} onChange={handleChange}></input>
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
                <button type="submit">Log In</button>
            </form>
        </div>
    )
}