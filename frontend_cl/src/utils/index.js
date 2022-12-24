
export const capitalizeString = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value)
}