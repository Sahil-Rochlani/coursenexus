import axios from "axios"

export const AuthCheck = async (role) => {

    try{
        const role = localStorage.getItem('role')
        const response = await axios.get(`http://localhost:3000/${role.toLowerCase()}/me`)
        // console.log(response.data)
        if(response.data.name){
            return response.data.name
        }
        else return false
    }
    catch(err){
        console.log(err)
    }
}