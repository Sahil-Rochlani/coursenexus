import axios from "axios"

/**
 * Verifies user authentication by checking token validity with backend
 * @param {string} role - User role (unused parameter, role is read from localStorage)
 * @returns {Promise<string|false>} User's full name if authenticated, false otherwise
 */
export const AuthCheck = async (role) => {

    try{
        const role = localStorage.getItem('role')
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/${role.toLowerCase()}/me`)
        if(response.data.name){
            return response.data.name
        }
        else return false
    }
    catch(err){
        console.log(err)
    }
}