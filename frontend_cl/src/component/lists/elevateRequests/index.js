import { useEffect, useState } from "react"
import { useContext } from "../../../hook/context"
import { Roles } from "../../../utils/roles"

export const ElevateRequestsList = () => {
    const {
        contract,
        user: {address: from},
    } = useContext()
    const [requests, setRequests] = useState([])

    const handleRequestOperation = async (requester, accept) => {
        try {
            await contract.methods
                .approveElevationRequest(requester, accept)
                .send({from})

            alert(`Succesfully ${accept ? "accepted" : "denied"} request of user with address ${requester}!`)
            await getRequests()
        } catch (e) {
            console.log(e)
            alert(e.message)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getRequests = async () => {
        const actualRequests = await contract.methods
            .getElevateRequests()
            .call({from})

        console.log(actualRequests)

        const requests = await Promise.all(actualRequests.map(async (requester) => {
            const request = await contract.methods
                .getElevateRequest(requester)
                .call({from})

            console.log(request)
                
            const sender = await contract.methods.getUser(requester).call()
            const currentRole = Roles[request.requiredRole]
            const { requiredShop: shop } = request

            console.log({from: requester, sender, currentRole, shop})
            return {from: requester, sender, currentRole, shop}
        }))

        setRequests(requests)
    }

    // eslint-disable-next-line
    useEffect(getRequests, [])

    return (
        <>
            <div className="elevate_requests_list">
                <ol>
                    {requests.map(
                        (request, i) =>
                            request.sender.exists && (
                                <>
                                    <li key={i}>
                                        <h4>Request from: {request.sender.username}</h4>
                                        <h5>
                                            Role: <b>{request.currentRole}</b>
                                        </h5>
                                        {request.currentRole === "SELLER" && (
                                        <h5>Shop: {request.shop}</h5>
                                        )}
                                        <button
                                        onClick={() => handleRequestOperation(request.from, true)}
                                        >
                                        Accept
                                        </button>
                                        <button
                                        onClick={() =>
                                            handleRequestOperation(request.from, false)
                                        }
                                        >
                                        Deny
                                        </button>
                                    </li>
                                </>
                            )
                    )}
                </ol>
            </div>
        </>
    )
}