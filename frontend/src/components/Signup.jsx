import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import styles from './Signup.module.css'
import { isLoggedInAtom, nameAtom, roleAtom } from '../store/loginAndRoleState'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { signupValidate } from '../../validation/input_validation'
import ValidationError from './ValidationError'
import axios from 'axios'

const Signup = () => {
    const setLoginStatus = useSetRecoilState(isLoggedInAtom)
    const navigate = useNavigate()
    const [values, setValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        repeat_pswd: '',
    })
    const [errors, setErrors] = useState({})
    // console.log(errors)
    const [role, setRole] = useRecoilState(roleAtom)
    // console.log(role)
    const setName = useSetRecoilState(nameAtom)
    const handleOnChange = (e) => {
        const field = e.target.id
        const value = e.target.value
        setValues(prev => ({...prev, [field]: value}))
    }
    const handleOnBlur = (e) => {
        const field = e.target.id
        // console.log(field)
        const err_obj = {...errors}
        const errR_obj = signupValidate({field, err_obj}, values)
        // console.log(errR_obj)
        setErrors(errR_obj)

    }

    const handleSubmit = async () =>{
        
        const err_obj = signupValidate({}, values)
        setErrors(err_obj)
        // console.log(values)
        if(Object.keys(err_obj).length == 0){
            const response = await axios.post(`http://localhost:3000/${role.toLowerCase()}/signup`,{
                firstName: values.firstName,
                lastName:values.lastName,
                email:values.email,
                password: values.password
            })
            // console.log(response.data)
            if(response.data.name){
                setName(response.data.name)
                setLoginStatus(true)
                // const user = role.toLowerCase()
                navigate(`/${role.toLowerCase()}`)
            }
            else if(response.data.error){
                setErrors(response.data.error)
            }
        }
    }
    const handleRoleChange = () => {
        setErrors({})
        setValues({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            repeat_pswd: '',
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
    
    return <div className={styles.Signup}>
        <div className={styles.logo}>CourseNexus</div>
        <div className={styles.SignupHeading}>{role} Sign Up</div>
        <div className={styles.SignupForm}>
            <div className={styles.FullName}>
                <div className={styles.FirstName}>
                    <label htmlFor='firstName'>First Name</label>
                    <input className={`${styles.signInInput} ${errors.firstName ? styles.redInput : ''}`} onChange={handleOnChange} onBlur={handleOnBlur} id='firstName' type='text' name='firstName' value={values.firstName}/>
                    {errors.firstName && <ValidationError error={errors.firstName} />}
                </div>
                <div className={styles.LastName}>
                    <label htmlFor='lastName'>Last Name</label>
                    <input className={`${styles.signInInput} ${errors.lastName ? styles.redInput : ''}`} onChange={handleOnChange} onBlur={handleOnBlur} id='lastName' type='text' name='lastName' value={values.lastName}/>
                    {errors.lastName && <ValidationError error={errors.lastName} />}
                </div>
            </div>
            
                <div className={styles.email}>
                    <label htmlFor='email'>Email</label>
                    <input className={`${styles.signInInput} ${errors.email ? styles.redInput : ''}`} onChange={handleOnChange} onBlur={handleOnBlur} id='email' type='email' name='email' value={values.email}/>
                    {errors.email && <ValidationError error={errors.email} />}
                </div>
            
                <div className={styles.password}>
                    <label htmlFor='password'>Password</label>
                    <input className={`${styles.signInInput} ${errors.password ? styles.redInput : ''}`} onChange={handleOnChange} onBlur={handleOnBlur} id='password' type='password' name='password' value={values.password}/>
                    {errors.password && <ValidationError error={errors.password} />}
                    <p>Password should be at least 8 character, should contain at least an uppercase, a lowercase, a number and a special character.</p>
                </div>
            
            
                <div className={styles.repeatPswd}>
                    <label htmlFor='repeat_pswd'>Confirm Password</label>
                    <input className={`${styles.signInInput} ${errors.repeat_pswd ? styles.redInput : ''}`} onChange={handleOnChange} onBlur={handleOnBlur} id='repeat_pswd' type='password' name='repeat_pswd' value={values.repeat_pswd}/>
                    {errors.repeat_pswd && <ValidationError error={errors.repeat_pswd} />}
                </div>
            
            
                <button onClick={handleSubmit}>Create an Account</button>
            
        </div>
        <div className={styles.OtherOption}>Already have an account? <Link to="/authorize/signin">Sign in</Link></div>
        <div className={styles.OtherRole}>Are you {role == 'Admin' ? 'a user' : 'an admin'}? <span onClick={handleRoleChange}> Sign up here</span></div>
    </div>
}

export default Signup