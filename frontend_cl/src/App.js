import { Route, Routes } from 'react-router-dom';
import Web3 from 'web3'
import { Header } from './component/header';
import { Abi } from './contract';
import { Context } from './hook/context';
import { useLocalStorage } from './hook/localStorage';
import { Dashboard } from './page/dashboard';
import { Home } from './page/home';
import { Login } from './page/login';
import { Logout } from './page/logout';
import { SignUp } from './page/signup';
import { getKeyByValue } from './utils';
import { changeRole, Roles } from './utils/roles';

export const App = () => {
  const web3 = new Web3(process.env.REACT_APP_GETH_ENDPOINT)
  const contract = new web3.eth.Contract(
    Abi,
    process.env.REACT_APP_GETH_CONTRACT_ADDRESS,
  )

  const [user, setUser] = useLocalStorage("user", {
    username: "",
    address: "",
    currentRole: "",
    maxRole: "",
    balance: "",
  })

  const handleRoleChange = (currentRole) => {
    changeRole(contract, user.address, user.address, getKeyByValue(Roles, currentRole)).then(() => {
      setUser({...user, currentRole: getKeyByValue(Roles, currentRole)})
    })
  }

  return(
    <Context.Provider value={{web3, contract, user, setUser}}>
      <div className="App">
        <Header
          username={user.username}
          currentRole={user.currentRole}
          maxRole={user.maxRole}
          balance={user.balance}
          onChangeRole={handleRoleChange}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </div>
    </Context.Provider>
  )
}