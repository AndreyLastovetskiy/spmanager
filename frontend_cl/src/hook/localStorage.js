import { useState } from "react";

export const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        try {
            const currentValue = localStorage.getItem(key);
            return currentValue ? JSON.parse(currentValue) : initialValue;
        } catch(e) {
            console.error(e);
            return initialValue;
        }
    });

    const setStoredValue = (newValue) => {
        try {
            const valueToStore = typeof newValue === Function ? newValue(value) : newValue;
            setValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch(e) {
            console.error(e);
        }
    };

    return [value, setStoredValue];
};