import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import styles from './Login.module.css'
import { isLoggedInAtom, nameAtom, roleAtom } from '../store/loginAndRoleState'
import { Link, useNavigate } from 'react-router-dom'
import { signinValidate } from '../../validation/input_validation'
import { useEffect, useState } from 'react'
import ValidationError from './ValidationError'
import axios from 'axios'

const Login = () => {
    const setLoginStatus = useSetRecoilState(isLoggedInAtom)
    const setName = useSetRecoilState(nameAtom)
    const navigate = useNavigate()
    const [values, setValues] = useState({
        email:'',
        password:''
    })
    const [errors, setErrors] = useState({})
    // console.log(errors)
    const [role, setRole] = useRecoilState(roleAtom)

    const handleOnChange = (e) =>{
        const field = e.target.id
        const value = e.target.value
        setValues(prev => ({...prev, [field]: value}))
    }
    const handleOnBlur = (e) => {
        const field = e.target.id
        const err_obj = {...errors}
        const errR_obj = signinValidate({field, err_obj}, values)
        setErrors(errR_obj)
    }
    const handleSubmit = async () => {
        
        const new_err_obj = signinValidate({}, values)
        // console.log(new_err_obj)
        setErrors(new_err_obj)
        
        if(Object.keys(new_err_obj).length == 0){
            // console.log('hi')
            const response = await axios.post(`http://localhost:3000/${role.toLowerCase()}/signin`,{
                email: values.email,
                password: values.password
            })
            console.log(response.data)
            if(response.data.error){
                setErrors(response.data.error)
            }
            else if(response.data.name){
                console.log(response.data.name)
                setLoginStatus(true)
                setName(response.data.name)
                navigate(`/${role.toLowerCase()}`)
            }
            
        }
    }
    const handleRoleChange = () => {
        setErrors({})
        setValues({
            email:'',
            password:''
        })
        if(role == 'Admin'){
            setRole('User')
            localStorage.setItem('role', 'User')
        }
        else {  
            setRole('Admin')
            localStorage.setItem('role', 'Admin')
        }
        
    }
    
    return <div className={styles.Login}>
        <div className={styles.logo}>CourseNexus</div>
        <div className={styles.heading}>{role} Sign In</div>
        <div className={styles.SigninForm}>
            <div className={styles.email}>
                <label htmlFor='email'>Email</label>
                <input className={`${styles.signInInput} ${errors.email ? styles.redInput : ''}`} onChange={handleOnChange} onBlur={handleOnBlur} value={values.email} id='email' type='email' name='email'/>
                {errors.email && <ValidationError error={errors.email}></ValidationError>}
            </div>
            <div className={styles.password}>
                <label htmlFor='password'>Password</label>
                <input className={`${styles.signInInput} ${errors.password ? styles.redInput : ''}`} onChange={handleOnChange} onBlur={handleOnBlur} value={values.password} id='password' type='password' name='password'/>
                {errors.password && <ValidationError error={errors.password}></ValidationError>}
            </div>
            <button onClick={handleSubmit}>Sign in</button>
        </div>
        
        <div className={styles.OtherOption}>Dont have an account? <Link to="/authorize/signup"> Sign up</Link></div>
        <div className={styles.OtherRole}>Are you {role == 'Admin' ? 'a user' : 'an admin'}? <span onClick={handleRoleChange}>Log in here</span></div>
    </div>
}

export default Login