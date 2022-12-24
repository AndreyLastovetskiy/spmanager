import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useContext } from "../../hook/context"
import { ChangeUserRoleForm } from "../../component/forms/changeUserRole"
import { Shop } from "../../component/forms/shop"
import { SendElevateRequestForm } from "../../component/forms/sendElevateRequest"
import { ElevateRequestsList } from "../../component/lists/elevateRequests"

export const Dashboard = () => {
    const { user, contract } = useContext()
    const navigate = useNavigate()

    const [availableOperations, setAvailableOperations] = useState([])
    const [currentRole, setRole] = useState()
    const [shops, setShops] = useState([])
    const [hisShop, setHisShop] = useState("")
    
    const getRoleAndShop = useCallback(async () => {
        const { currentRole, shop } = await contract.methods.getUser(user.address).call()
        setRole(currentRole)
        setHisShop(shop)
    }, [contract, setRole, setHisShop, user])

    const getShops = useCallback(async () => {
        const actualShops = await contract.methods.getShops().call()
        setShops(actualShops)
    }, [contract.methods])

    const getAvailableOperations = (currentRole) => {
        let operations = []
        switch(currentRole) {
            case "0":
                operations = ["createProductForShop", "sendElevateRequests"]
                break
            case "1":
                operations = ["viewHisShop", "sendElevateRequests"]
                break
            case "2":
                break
            case "3":
                operations = [
                    "changeRoles",
                    "viewElevateRequests",
                ]
                break
            default:
                break
        }

        setAvailableOperations(operations)
    }

    useEffect(() => {
        if (!user.address) return navigate("/login")
        getRoleAndShop().then(() => getAvailableOperations(currentRole))
        getShops()
    }, [getRoleAndShop, getShops, navigate, currentRole, user])
    
    const handleElevateRequestSend = (currentRole) => {
        alert(
            `You have successfully sent elevate request to role ${currentRole}`
        )
    }

    return(
        <div className="dashboard_page">
            <ol>
                {availableOperations.includes("changeRoles") ? (
                    <li key="change_roles">
                        <h3>Change user role:</h3>
                        <ChangeUserRoleForm />
                    </li>
                ) : null}
                {availableOperations.includes("viewElevateRequests") ? (
                    <li key="view_elevate_requests">
                        <h3>Current elevate requests:</h3>
                        <ElevateRequestsList />
                    </li>
                ) : null}
                {availableOperations.includes("viewHisShop") ? (
                    <li key="view_his_shop">
                        <h3>Your shop:</h3>
                        <ul>
                            <Shop city={hisShop} />
                        </ul>
                    </li>
                ) : null}
                {availableOperations.includes("sendElevateRequests") ? (
                    <li key="send_elevate_requests">
                        <h3>Send elevate request:</h3>
                        <SendElevateRequestForm
                        availableRoles={[currentRole === "0" ? "SELLER" : "BUYER", "OWNER"]}
                        onSend={handleElevateRequestSend}
                        shops={shops}
                        />
                    </li>
                ) : null}
            </ol>
        </div>
    )

}