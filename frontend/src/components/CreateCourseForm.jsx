import { useState } from 'react'
import styles from './CreateCourseForm.module.css'
import { CourseCreationValidate } from '../../validation/input_validation'
import ValidationError from './ValidationError'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CreateCourseForm = () => {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        title:'',
        description:'',
        price:'',
        imageUrl:''
    })
    const [errors, setErrors] = useState({})
    // console.log(errors)
    const handleOnChange = (e) => {
        const field = e.target.id
        const value = e.target.value
        setValues(prev => ({...prev, [field] : value}))
    }
    const handleOnBlur = async (e) => {
        const field = e.target.id
        const err_obj = {...errors}
        const errorR = await CourseCreationValidate({field, err_obj}, values)
        setErrors(errorR)
    }
    const handleSubmit = async () => {
        const err_obj = await CourseCreationValidate({}, values)
        setErrors(err_obj)
        if(Object.values(err_obj).length == 0){
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/course`, {
                title:values.title,
                description:values.description,
                price:values.price,
                imageUrl:values.imageUrl
            })
            // console.log(response.data)
            if(response.data.erorrs){
                // console.log(response.data)
                setErrors(response.data.errors)
                return
            }
            if(response.data.course){
                navigate('../mycreations')
            }
        }
    }
    return <div className={styles.CreateCourseForm}>
        <div className={styles.heading}>Create a Course</div>
        <div className={styles.formDiv}>
            <div className={styles.title}>
                <label htmlFor='title'>Title</label>
                <input id='title' type='text' name='text' value={values.title} onChange={handleOnChange} onBlur={handleOnBlur} className={errors.title ? styles.redInput : ''}/>
                {errors.title && <ValidationError error={errors.title} />}
            </div>
            <div className={styles.description}>
                <label htmlFor='description'>Description</label>
                <textarea id='description' name='description' rows={4} cols={70}  value={values.description} onChange={handleOnChange} onBlur={handleOnBlur} className={errors.description ? styles.redInput : ''}/>
                {errors.description && <ValidationError error={errors.description} />}
            </div>
            <div className={styles.price}>
                <label htmlFor='price'>Price</label>
                <input id='price' type='text' name='price' value={values.price} onChange={handleOnChange} onBlur={handleOnBlur} className={errors.price ? styles.redInput : ''}/>
                {errors.price && <ValidationError error={errors.price} />}
            </div>
            <div className={styles.imageUrl}>
                <label htmlFor='imageUrl'>Image URL</label>
                <input id='imageUrl' type='text' name='imageUrl' value={values.imageUrl} onChange={handleOnChange} onBlur={handleOnBlur} className={errors.imageUrl ? styles.redInput : ''}/>
                {errors.imageUrl && <ValidationError error={errors.imageUrl} />}
            </div>
            <button onClick={handleSubmit}>Create a course</button>
        </div>
    </div>
}

export default CreateCourseForm