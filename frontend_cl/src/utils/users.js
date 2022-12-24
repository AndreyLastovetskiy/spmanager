export const addUser = async (web3, contract, username, password, secret) => {
    const { exists } = await contract.methods
        .getUser(await contract.methods.getUserAddress(username).call())
        .call()
    if(exists) throw new Error("User existst!")

    const address = await web3.eth.personal.newAccount(password)
    await web3.eth.personal.unlockAccount(address, password, 0)

    await transferFromReserve(web3, address, web3.utils.toWei("0.1", "ether"))
    
    await contract.methods
        .createUser(address, username.toLowerCase(), password, secret)
        .send({ from: address })

    return address
}

export const transferFromReserve = async (web3, toAddress, countInWei) => {
    const reserveAddress = process.env.REACT_APP_GETH_RESERVE_ACCOUNT_ADDRESS
    return web3.eth.sendTransaction({
        from: reserveAddress,
        to: toAddress,
        value: countInWei
    })
}

export const unlockReserve = async (web3) => {
    const reserveAddress = process.env.REACT_APP_GETH_RESERVE_ACCOUNT_ADDRESS
    const reservePassword = process.env.REACT_APP_GETH_RESERVE_ACCOUNT_PASSWORD

    await web3.personal.unlockAccount(reserveAddress, reservePassword, 0)
}