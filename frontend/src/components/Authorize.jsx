import { Outlet, useNavigate } from 'react-router-dom'
import styles from './Authorize.module.css'
import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { isLoggedInAtom, nameAtom, roleAtom } from '../store/loginAndRoleState';
import { AuthCheck } from '../utils/AuthCheck';

const Authorize = () => {
    // console.log('hi')
    const setName = useSetRecoilState(nameAtom)
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useRecoilState(roleAtom)
    const setLoginStatus = useSetRecoilState(isLoggedInAtom)
    const navigate = useNavigate()
    useEffect(() => {
        const checks = async () => {
            const prevRole = localStorage.getItem('role') 
            // console.log(prevRole)
            if(prevRole){
                setRole(prevRole)
            }
            else {
                localStorage.setItem('role', 'User')
                setRole('User')
            }
            const isAuthorized = await AuthCheck(prevRole || role)
            if(isAuthorized){
                // console.log('hi')
                setName(isAuthorized)
                setLoginStatus(true)
                navigate(`/${(prevRole || role).toLowerCase()}`)
                return
            }
            
            setLoading(false)
            // console.log()
        }     
        checks()   
    },[])
    if(loading) {
        // console.log('hi')
        return null
    }
    return <div className={styles.Authorizewrapper}>
        <div className={styles.Authorize}><Outlet /></div>
    </div>
}

export default Authorize