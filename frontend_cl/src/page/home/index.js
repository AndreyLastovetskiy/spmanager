import { useState, useEffect } from "react";
import { Shop } from "../../component/lists/shop/";
import { useContext } from "../../hook/context";
import { Link } from "react-router-dom";

export const Home = () => {
    const { contract } = useContext()
    const [shops, setShops] = useState([])

    useEffect(() => {
        contract.methods
            .getShops()
            .call()
            .then((actualShops) => setShops(actualShops))
    })

    return(
        <div>
            <Link to="/logout">LogOut</Link>
            <ol>
                {shops.map((shop, i) => (
                    <Shop city={shop} key={i} />
                ))}
            </ol>
        </div>
    )
}