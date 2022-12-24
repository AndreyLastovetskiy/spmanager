import { Fragment } from "react"
import { Link } from "react-router-dom"


export const Shop = (props) => {
    const { city } = props

    return(
        <Fragment>
            {city && (
                <li key={city}>
                    <b><Link to={`/shop/${city}`}>{`${city} Shop`}</Link></b>
                </li>
            )}
        </Fragment>
    )
}