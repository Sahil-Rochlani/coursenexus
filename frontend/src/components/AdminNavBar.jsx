import { Link, Outlet, useNavigate } from 'react-router-dom'
import styles from './AdminNavBar.module.css'
import { useRecoilState, useRecoilStateLoadable, useRecoilValue, useSetRecoilState } from 'recoil'
import { isLoggedInAtom, nameAtom, roleAtom } from '../store/loginAndRoleState'
import { useEffect, useRef, useState } from 'react'
import { AuthCheck } from '../utils/AuthCheck'
import Authorize from './Authorize'
import axios from 'axios'
import { creatorCourseAtomFamily, creatorCourseIdListAtom, editModalAtom, modalCourseIdAtom, modalValuesAtom } from '../store/creatorCourseList'
import ValidationError from './ValidationError'
import { CourseCreationValidate } from '../../validation/input_validation'

const AdminNavBar = () => {
    const editModalWrapperRef = useRef()
    const editModalRef = useRef()
    const modalCourseId = useRecoilValue(modalCourseIdAtom)
    const [courseDetails, setCourseDetails] = useRecoilStateLoadable(creatorCourseAtomFamily(modalCourseId))
    const [modalVisible, setModalVisible] = useRecoilState(editModalAtom)
    const [values, setValues] = useRecoilState(modalValuesAtom)
    const [errors, setErrors] = useState({
        title:'',
        description:'',
        price:'',
        imageUrl:''
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [name, setName] = useRecoilState(nameAtom)
    // console.log('hi')
    
    const setLoginStatus = useSetRecoilState(isLoggedInAtom)
    const [role, setRole] = useRecoilState(roleAtom)
    const setCreatedCourseIdList = useSetRecoilState(creatorCourseIdListAtom)
    // console.log(errors)
    const handleLogout = async () => {
        try{
            
            await axios.post('http://localhost:3000/logout')
            setLoginStatus(false)
            setCreatedCourseIdList([])
            navigate('/authorize/signin')
            return
        }
        catch(err){
            console.log(err)
        }
    }
    const handleOnChange = (e) => {
        const field = e.target.id
        const value = e.target.value
        setValues(prev => ({...prev, [field] : value}))

    }
    const handleOnBlur = async (e) => {
        const field = e.target.id
        const err_obj = {...errors}
        const errorR = await CourseCreationValidate({field, err_obj},values)
        setErrors(errorR)
    }
    const handleModalSubmit = async () => {
        const errorR = await CourseCreationValidate({}, values)
        setErrors(errorR)
        if(Object.values(errorR).length == 0){
            console.log('Successfully edited')
            const response = await axios.put(`http://localhost:3000/admin/course/${modalCourseId}`,{
                title: values.title,
                description: values.description,
                price: values.price,
                imageUrl: values.imageUrl,
            })
            if(response.data.course){
                
                setCourseDetails(response.data.course)
                handleModalCancel()
            }
        }
    }
    const handleModalCancel = () => {
        setModalVisible(false)
        setValues({
            title:'',
            description:'',
            price:'',
            imageUrl:''
        })
        setErrors({
            title:'',
            description:'',
            price:'',
            imageUrl:''
        })

    }
    // console.log('hi')
    useEffect(() => {
        

        const checks = async () => {
            const prevRole = localStorage.getItem('role')
            // console.log(prevRole)
            if(role === null){
                
                if(prevRole){
                    setRole(prevRole)
                }
                else{
                    setLoginStatus(false)
                    navigate('/authorize/signin')
                    return
                }
            }
            if(prevRole != 'Admin'){
                console.log(role)
                navigate('/unauthorized')
                return
            }
            // console.log(role)
            const isAuthorized = await AuthCheck(role)
            // console.log(isAuthorized)
            if(!isAuthorized){
                setLoginStatus(false)
                navigate('/authorize/signin')
                return
                console.log('Unauthorized')
            }
            
            setLoginStatus(true)
            // console.log(isAuthorized)
            setName(isAuthorized)
            
            // if(!loginStatus){
            //     navigate('/authorize/signin')
            //     return
            //     console.log('false login status')
            // }
            
            
            
            setLoading(false)
            
        }
        checks()

    },[])
    useEffect(() => {
        if(modalVisible){
            editModalWrapperRef.current.style.visibility = 'visible'
            editModalWrapperRef.current.style.opacity = 1
            editModalRef.current.style.transform = 'translateY(0px)'
        }
        else{
            
            editModalWrapperRef.current.style.opacity = 0
            editModalRef.current.style.transform = 'translateY(100px)'
            setTimeout(() => {
                editModalWrapperRef.current.style.visibility = 'hidden'
            },324)
        }
    },[modalVisible])
    if(loading)return null
    
    return <div className={styles.AdminPageWrapper}>
        <div className={styles.AdminPage}>
            <div className={styles.AdminNavBar}>
                <div className={styles.logo}>CourseNexus</div>
                <div className={styles.OtherOptions}>
                    <span><Link to="mycreations">My Creations</Link></span>
                    <span><Link to="create">Create a Course</Link></span>
                    <span className={styles.AdminName}>Welcome, {name}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <Outlet />
            {<div ref={editModalWrapperRef} className={styles.editModalWrapper}>
                <div ref={editModalRef} className={styles.editModal}>
                    <div className={styles.modalHeading}>Edit Course</div>
                    <div className={styles.editForm}>
                        <div className={styles.editTitle}>
                            <label htmlFor='title'>Title</label>
                            <input id='title' type='text' value={values.title} name='title' onChange={handleOnChange} onBlur={handleOnBlur} className={errors.title ? styles.redInput : ''} />
                            {errors.title && <ValidationError error={errors.title} />}
                        </div>
                        <div className={styles.editDescription}>
                            <label htmlFor='description'>Description</label>
                            <textarea id='description' name='description' rows={4} cols={70} value={values.description} onChange={handleOnChange} onBlur={handleOnBlur} className={errors.description ? styles.redInput : ''} />
                            {errors.description && <ValidationError error={errors.description} />}
                        </div>
                        <div className={styles.editPrice}>
                            <label htmlFor='price'>Price</label>
                            <input id='price' type='text' value={values.price} name='price' onChange={handleOnChange} onBlur={handleOnBlur} className={errors.price ? styles.redInput : ''} />
                            {errors.price && <ValidationError error={errors.price} />}
                        </div>
                        <div className={styles.editImageUrl}>
                            <label htmlFor='imageUrl'>Image URL</label>
                            <input id='imageUrl' type='text' value={values.imageUrl} name='imageUrl' onChange={handleOnChange} onBlur={handleOnBlur} className={errors.imageUrl ? styles.redInput : ''}  />
                            {errors.imageUrl && <ValidationError error={errors.imageUrl} />}
                        </div>
                        <div className={styles.buttons}>
                            <button onClick={handleModalCancel} className={styles.cancelBtn}>Cancel</button>
                            <button onClick={handleModalSubmit} className={styles.saveBtn}>Save</button>
                        </div> 
                    </div>
                </div>
            </div>}
        </div>
    </div>
}

export default AdminNavBar