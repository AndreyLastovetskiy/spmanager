import { useState } from "react"
import { useContext } from "../../../hook/context"
import { Roles } from "../../../utils/roles"
import { capitalizeString, getKeyByValue } from "../../../utils"

export const SendElevateRequestForm = (props) => {
    const { shops, availableRoles, onSend } = props
    const { contract, user } = useContext()

    const [requestDetails, setRequestDetails] = useState({
        shop: shops[0],
        currentRole: availableRoles[0],
    })

    const handleChange = (e) => {
        const { name, value } = e.currentTarget
        setRequestDetails({...requestDetails, [name]: value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { currentRole, shop } = requestDetails

        const roleToRequest = getKeyByValue(Roles, currentRole)
        console.log(roleToRequest)

        try {
            await contract.methods
                .newElevateRequest(roleToRequest, roleToRequest === "1" ? shop : "")
                .send({from: user.address})
            onSend(currentRole, shop)
        } catch (e) {
            console.log(e)
            alert(e.message)
        }
    }

    return (
        <div className="send_elevate_request_form">
            <form onSubmit={handleSubmit}>
                <label>
                    Role:
                    <select name="currentRole" value={requestDetails.currentRole} onChange={handleChange}>
                        {Roles.map(
                            (currentRole) =>
                                availableRoles.includes(currentRole) && (
                                    <option value={currentRole}>{currentRole}</option>
                                )
                        )}
                    </select>
                </label>
                <br />
                {requestDetails.currentRole === "SELLER" && (
                    <>
                        <label>
                            Shop:
                            <select name="shop" value={requestDetails.shop} onChange={handleChange}>
                                {shops.map(
                                    (shop) => 
                                        shop && (
                                            <>
                                                <option value={shop}>{capitalizeString(shop)}</option>
                                            </>
                                        )
                                )}
                            </select>
                        </label>
                    </>
                )}
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}