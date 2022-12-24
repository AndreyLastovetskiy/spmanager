export const Roles = ["BUYER", "SELLER", "OWNER"]

export const changeRole = async (contract, from, address, requiredRole) => {
    try {
        const user = await contract.methods.getUser(address).call()
        if(user.maxRole < requiredRole)
            throw new Error("You can't elevate yourself to role that is above your max role!")
        
        await contract.methods
            .changeRole(address, requiredRole, "", false)
            .send({ from })
    } catch (e) {
        console.log(e)
    }
}