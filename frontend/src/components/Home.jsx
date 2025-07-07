import { useRecoilState, useRecoilValue } from "recoil"
import { isLoggedInAtom, roleAtom } from "../store/loginAndRoleState"
import { Navigate } from "react-router-dom"
import { useEffect } from "react"

const Home = () => {
    const loginStatus = useRecoilValue(isLoggedInAtom)
    const [role, setRole] = useRecoilState(roleAtom)
    

    if(loginStatus){
        if(role == 'user') return <Navigate to="/user" replace />
        if(role == 'admin') return <Navigate to="/admin" replace />
    }
    else{
        return <Navigate to="/authorize" replace />
    }
}

export default Home