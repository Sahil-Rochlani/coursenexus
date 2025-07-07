import { z } from "zod"


export const signupValidate = ({field = null, err_obj = null} = {}, values) => {
    const firstName = z.string({required_error: 'First Name is required'})
                        .trim()
                        .min(2, 'First Name must be atleast 2 characters')
                        .max(50,'First Name cannot exceed 50 characters')
                        .regex(/^[A-Za-z]+$/, { message: 'First Name must only contain letters'})

    const lastName = z.string({required_error: 'Last Name is required'})
                        .trim()
                        .min(2, 'Last Name  must be atleast 2 characters')
                        .max(50,'Last Name cannot exceed 50 characters')
                        .regex(/^[A-Za-z]+$/, { message: 'Last Name must only contain letters'})

    const email = z.string({required_error: 'Email is required'})
                                .trim()
                                .min(1,'Email cannot be empty')
                                .email('Please enter a valid email address')
                                .max(320, 'Email is too long')

    const passwordSchema = z.string()
                            .min(8, 'Password must be at least 8 characters')
                            .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letters'} )
                            .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letters'} )
                            .regex(/[0-9]/, { message: 'Password must contain at least one number'} )
                            .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character (!, @, #, $, %, ^, &, *, (, ), ., ?, ", :, {, }, |, <, >)' })

    const password = z.string({required_error: 'Password is required'})
                                .trim()
                                .min(1, 'Password cannot be empty')
                                .superRefine((value, ctx) => {
                                        const passwordValidation = passwordSchema.safeParse(value)
                                        if(!passwordValidation.success){
                                            ctx.addIssue({
                                                code: 'custom',
                                                message:'Password doesnt meet the required criteria'
                                            })
                                        }
                                })

    const repeat_pswd = z.string()
                        .trim()
                        .min(1, 'Paassword cannot be empty')
                        .superRefine((password, ctx) => {
                            if(password != values.password){
                                ctx.addIssue({
                                    code:'custom',
                                    message: 'Passwords do not match'
                                })
                            }
                        })
    const validation_schemas = {
        firstName,
        lastName,
        email, 
        password,
        repeat_pswd
    }
    if(field != null && err_obj != null){
        // console.log(field, err_obj)
        const validation = validation_schemas[field].safeParse(values[field])
        // console.log(validation.error.format()._errors[0])
        if(!validation.success){
            // console.log('hi')
            const error = validation.error.format()._errors[0]
            // console.log(error)
            return ({...err_obj, [field]: error})
        }
        else {
            delete err_obj[field]
            return err_obj
        }
    }
    else{
        let new_err_obj = {}
        for(let [key, value] of Object.entries(validation_schemas)){
            const validation = value.safeParse(values[key])
            if(!validation.success){
                new_err_obj[key] = validation.error.format()._errors[0]
            }
        }
        return new_err_obj
    }
}

export const signinValidate = ({field = null, err_obj = null} = {}, values) => {
    const email = z.string({required_error: 'Email is required'})
                                .trim()
                                .min(1,'Email cant be empty')
                                .email('Please enter a valid email address')
                                .max(320, 'Email is too long')

    const password = z.string({required_error: 'Password is required'})
                                .trim()
                                .min(1, 'Password cannot be empty')

    const validation_schemas = {
        email,
        password
    }
    if(field != null && err_obj != null){
        const validation =  validation_schemas[field].safeParse(values[field])
        if(!validation.success){
            const error = validation.error.format()._errors[0]
            return ({...err_obj, [field]: error})
        }
        else{
            delete err_obj[field]
            return err_obj
        }
    }
    else{
        let new_err_obj = {}
        for(let [key, value] of Object.entries(validation_schemas)){
            const validation = value.safeParse(values[key])
            if(!validation.success){
                new_err_obj[key] = validation.error.format()._errors[0]
            }
        }
        return new_err_obj
    }
}

const validateImageUrl = (url) => {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => {
            resolve(true)}
        image.onerror = () => {
            reject(false)}
        image.src = url
    })
}
export const CourseCreationValidate = async ({field = null, err_obj = null} = {}, values) => {
    const title = z.string({required_error: 'Title is required.'})
                    .trim()
                    .min(5, 'Title must be at least 5 character long.')
                    .max(100, 'Title cannot be more than 100 characters.')
                    .regex(/^[A-Za-z0-9 .,:;!'"\-()&]+$/, 'Title can only contain letters, numbers, spaces, and basic punctuation.')

    const description = z.string({required_error: 'Description is required.'})
                          .trim()
                          .min(20, 'Description must be at least 20 characters long.')
                          .max(1000, 'Description cannot exceed 1000 characters.')
                          .regex(/^[A-Za-z0-9 .,:;!'"\-()&\n\r]+$/,'Description contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed.')

    const price = z.string({required_error: 'Price is required.'})
                    .nonempty('Price is required.')
                    .refine((val) => !isNaN(Number(val)), {message: 'Price must be a valid number.'})
                    .transform((val) => Number(val))
                    .refine((val) => val >= 0, {message:'Price cannot be negative.'})
                    .refine((val) => val <= 99999, {message: 'Price cannot exceed ₹99,999.'})

    const imageUrl = z.string({required_error: 'Image URL is required.'})
                        .url('Please enter a valid URL.')
                        .superRefine(async (url, ctx) => {
                            try{
                                await validateImageUrl(url)
                                
                            }
                            catch(err){
                                // console.log(err)
                                ctx.addIssue({
                                    code:'custom',
                                    message:'Please provide a valid image URL.'
                                })
                            }
                        })

    const courseFormValidationSchemas = {
        title,
        description,
        price,
        imageUrl
    }
    if(field != null && err_obj != null){
        try{
            const validation = await courseFormValidationSchemas[field].spa(values[field])
            if(!validation.success){
                let error = validation.error.format()._errors[0]
                
                return ({...err_obj, [field]: error})
            }
            else{
                delete err_obj[field]
                return err_obj
            }
        }
        catch(err){
            console.log(err)
        }
        
    }
    else{
        try{
            let new_err_obj = {}
            for(let [key, value] of Object.entries(courseFormValidationSchemas)){
                const validation = await value.spa(values[key])
                if(!validation.success){
                    let error = validation.error.format()._errors[0]
                    
                    new_err_obj[key] = error
                }
            }
            return new_err_obj
        }
        catch(err){
            console.log(err)
        }
    }
}