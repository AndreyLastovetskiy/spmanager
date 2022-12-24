import { fromWei } from "web3-utils"
import { Link } from "react-router-dom"
import { useState } from "react"
import { getKeyByValue } from "../../utils"
import { Roles } from "../../utils/roles"

export const Header = (props) => {
    const { username, currentRole, maxRole, balance, onChangeRole } = props
    const [selectedRole, setSelectedRole] = useState(Roles[maxRole])
    
    const handleChange = (event) => {
        const { value: newSelectedRole } = event.currentTarget
        setSelectedRole(newSelectedRole)
    }

    const handleChangeRole = (event) => {
        event.preventDefault()
        onChangeRole(selectedRole)
    }

    return(
        <div>
            <div>
                <h1>Shop Manager</h1>
            </div>
            <div>
                {username ? (
                    <>
                        Welcome, <b>{username}</b> | <Link to="/dashboard">Dashboard</Link> | <Link to="/">Home</Link>{" "}
                    </>
                ) : (
                    <>
                        <Link to="/login">Log In</Link> | <Link to="/signup">Sign Up</Link>
                    </>
                )}{" "}
            </div>
            <div align="right">
            {username ? (
                <> 
                    <b>
                        Your balance: {Math.floor(fromWei(balance, "ether"))} ether
                    </b>
                    <br />
                    <b>Current Role: {Roles[currentRole]}</b>
                    {(maxRole === getKeyByValue(Roles, "OWNER") ||
                      (currentRole !== getKeyByValue(Roles, "SELLER") &&
                        currentRole !== getKeyByValue(Roles, "BUYER"))) && (
                            <form onSubmit={handleChangeRole}>
                                <label>
                                    Change Role:
                                    <select onChange={handleChange} value={selectedRole}>
                                        {Roles.slice(0, maxRole + 1).map((currentRole, i) => (
                                            <option key={i}>{currentRole}</option>
                                        ))}
                                    </select>
                                </label>
                                <button type="submit">Change</button>
                            </form>
                    )}
                    
                </>
            ) : null}
            </div>
        </div>
    )
}