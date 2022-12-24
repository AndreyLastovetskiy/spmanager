import { useEffect, useState } from "react"
import { useContext } from "../../../hook/context"
import { Roles } from "../../../utils/roles"
import { getKeyByValue, capitalizeString } from "../../../utils"

export const ChangeUserRoleForm = () => {
    const {
        contract,
        user: { address: from },
    } = useContext()
    const [state, setState] = useState({username: "", currentRole: 0, shop: ""})

    const [users, setUsers] = useState([])
    const [shops, setShops] = useState([])

    const getUsers = async () => {
        const actualUsers = await contract.methods.getUserLogins().call()
        
        const fullUsers = actualUsers.map(async (username) => {
            const address = await contract.methods.getUserAddress(username).call()
            return contract.methods.getUser(address).call()
        })

        setUsers(await Promise.all(fullUsers))
    }

    const getShops = async () => {
        const actualShops = await contract.methods.getShops().call()
        setShops(actualShops)
        setState({...state, shop: actualShops[0]})
    }

    const handleChange = (e) => {
        const { name, value } = e.currentTarget
        setState({...state, [name]: value})
        console.log(state)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { username, currentRole, shop } = state
        try {
            const address = await contract.methods.getUserAddress(username).call()

            console.log(
                address,
                getKeyByValue(Roles, currentRole),
                currentRole === "SELLER" ? shop : ""
            )

            await contract.methods
                .changeRole(
                    address, 
                    getKeyByValue(Roles, currentRole),
                    currentRole === "SELLER" ? shop : "",
                    true
                )
                .send({from})
            alert(`Successfully changed role of ${username} to ${currentRole}`)
        } catch(e) {
            console.log(e)
            alert(e.message)
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        getShops()
        getUsers()
    }, [])

    return (
        <div className="change_user_role_form">
            <form onSubmit={handleSubmit}>
                <label>
                    User:
                    <br />
                    <select name="username" onChange={handleChange} value={state.username}>
                        {users.map(
                            (user) =>
                                user.currentRole !== getKeyByValue(Roles, "BUYER") &&
                                user.currentRole !== getKeyByValue(Roles, "SELLER") && (
                                    <>
                                        <option value={user.username}>{user.username}</option>
                                    </>
                                )
                        )}
                    </select>
                </label>
                <br />
                <label>
                    Role:
                    <br />
                    <select name="currentRole" onChange={handleChange} value={state.currentRole}>
                        {Roles.map(
                            (currentRole) =>
                                currentRole !== "BUYER" &&
                                currentRole !== "SELLER" && (
                                    <>
                                        <option value={currentRole}>{currentRole}</option>
                                    </>
                                )
                        )}
                    </select>
                </label>
                {state.currentRole === "SELLER" && (
                    <>
                        <label>
                            Shop:
                            <br />
                            <select name="shop" onChange={handleChange} value={state.shop}>
                                {shops.map((shop) => (
                                    <>
                                        <option value={shop}>{capitalizeString(shop)}</option>
                                    </>
                                ))}
                            </select>
                        </label>
                    </>
                )}
                <button type="submit">Change user role</button>
            </form>
        </div>
    )
}