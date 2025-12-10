import { Link, Outlet, useNavigate } from 'react-router-dom'
import styles from './UserNavBar.module.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { isLoggedInAtom, nameAtom, roleAtom } from '../store/loginAndRoleState'
import { useEffect, useState } from 'react'
import { AuthCheck } from '../utils/AuthCheck'
import axios from 'axios'
import { allCoureIdListAtom, userPurchasedCoureIdListAtom } from '../store/userCourseList'

const UserNavBar = () => {
    const setAllCourseIdList = useSetRecoilState(allCoureIdListAtom)
    const setUserPurchasesIdList = useSetRecoilState(userPurchasedCoureIdListAtom)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [name, setName] = useRecoilState(nameAtom)
    const setLoginStatus = useSetRecoilState(isLoggedInAtom)
    const [role, setRole] = useRecoilState(roleAtom)
    const handleLogout = async () => {
        try{
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/logout`)
            setLoginStatus(false)
            navigate('/authorize/signin')
            return
        }
        catch(err){
            console.log(err)
        }
    }
    useEffect(() => {
        const checks = async () => {
            const prevRole = localStorage.getItem('role')
            if(role === null){
                if(prevRole){
                    setRole(prevRole)
                }
                else{
                    setLoginStatus(false)
                    navigate('/authorize/signin')
                    return
                    console.log('nullRole')
                }
            }
            if(prevRole != 'User'){
                navigate('/unauthorized')
                return
                console.log('Wrong role')
            }
            const isAuthorized = await AuthCheck(prevRole)
            if(!isAuthorized){
                setLoginStatus(false)
                navigate('/authorize/signin')
                return
                console.log('unauthorized')
            }
            else{
                setLoginStatus(true)
                setName(isAuthorized)
                const allCourseIdList = (await axios.get(`${import.meta.env.VITE_BACKEND_URL}/course/preview`)).data.courses
                // console.log(allCourseIdList)
                const userPurchasesIdList = (await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/purchases`)).data.courses
                // console.log(userPurchasesIdList)
                const purchasedSet = new Set(userPurchasesIdList)
                setAllCourseIdList(allCourseIdList)
                setUserPurchasesIdList(userPurchasesIdList)
            }
            
            
            
            
            setLoading(false)
        }
        checks()
    },[])
    // console.log(loading)
    if(loading)return null
    return <div className={styles.UserPageWrapper}>
        <div className={styles.UsersPage}>
            <div className={styles.UserNavBar}>
                <div className={styles.logo}>CourseNexus</div>
                <div className={styles.OtherOptions}>
                    <span><Link to="courses">All Courses</Link></span>
                    <span><Link to="purchases">My Purchases</Link></span>
                    <span className={styles.userName}>Welcome, {name}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <Outlet />
        </div>
    </div>
}

export default UserNavBar