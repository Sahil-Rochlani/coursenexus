const { default: axios } = require('axios')
const { z } = require('zod')
// const axios = require('axios')
const signUpfirstnameSchema = z.string({required_error: 'First Name is required'})
                     .trim()
                     .min(1, 'First Name cant be empty')
                     .max(50,'First Name cant exceed 50 characters')
                     .regex(/^[A-Za-z]+$/, { message: 'First Name must only contain letters'})

const signUplastnameSchema = z.string({required_error: 'Last Name is required'})
                     .trim()
                     .min(1, 'Last Name cant be empty')
                     .max(50,'Last Name cant exceed 50 characters')
                     .regex(/^[A-Za-z]+$/, { message: 'Last Name must only contain letters'})

const signUpemailSchema = z.string({required_error: 'Email is required'})
                            .trim()
                            .min(1,'Email cant be empty')
                            .email('Please enter a valid email address')
                            .max(320, 'Email is too long')

const passwordSchema = z.string()
                         .min(8, 'Password must be at least 8 characters')
                         .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letters'} )
                         .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letters'} )
                         .regex(/[0-9]/, { message: 'Password must contain at least one number'} )
                         .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character (!, @, #, $, %, ^, &, *, (, ), ., ?, ", :, {, }, |, <, >)' })

const signupPasswordSchema = z.string({required_error: 'Password is required'})
                               .trim()
                               .min(1, 'Password Cannot be empty')
                               .superRefine((value, ctx) => {
                                    const passwordValidation = passwordSchema.safeParse(value)
                                    if(!passwordValidation.success){
                                        ctx.addIssue({
                                            code: 'custom',
                                            message:'Password doesnt meet the required criteria'
                                        })
                                    }
                               })

const signupSchema = z.object({
    firstName: signUpfirstnameSchema,
    lastName: signUplastnameSchema,
    email:signUpemailSchema,
    password: signupPasswordSchema
})

const signinEmailSchema = z.string({required_error: 'Email is required'})
                            .trim()
                            .min(1,'Email cant be empty')
                            .email('Please enter a valid email address')
                            .max(320, 'Email is too long')

const signinPasswordSchema = z.string({required_error: 'Password is required'})
                               .trim()
                               .min(1, 'Password cannot be empty')


const signinSchema = z.object({
    email:signinEmailSchema,
    password: signinPasswordSchema
})


const validateImageUrl = async (url) => {
    return new Promise(async (resolve, reject) => {
        const response = await axios.get(url, { responseType: 'stream' });
        const contentType = response.headers['content-type'];

        if (!contentType || !contentType.startsWith('image/')) {
          reject(false)
        }
        else{
            resolve(true)
        }
    })
}
const titleSchema = z.string({required_error: 'Title is required.'})
                      .trim()
                      .min(5, 'Title must be at least 5 characters long.')
                      .max(100, 'Title cannot exceed 100 characters')
                      .regex(/^[A-Za-z0-9 .,:;!'"\-()&]+$/, 'Title can only contain letter, numbers, spaces and basic punctuation.')

const descriptionSchema = z.string({required_error: 'Description is required.'})
                            .trim()
                            .min(20, 'Description must be at least 20 characters long.')
                            .max(1000, 'Description cannot exceed 1000 characters.')
                            .regex(/^[A-Za-z0-9 .,:;!'"\-()&\n\r]+$/, 'Description contains invalid letters. Only letters, numbers, spaces and basic punctuation are allowed.')

const priceSchema = z.string({required_error: 'Price is required.'})
                      .nonempty('Price is required.')
                      .refine((val) => !isNaN(Number(val)), {message:'Price must be a valid number.'})
                      .transform((val) => Number(val))
                      .refine((val) => val >= 0,{message: 'Price cannot  be negative.'})
                      .refine((val) => val <= 99999, {message: 'Price cannot exceed ₹99,999.'})

const imageUrlSchema = z.string({required_error: 'Image URL is required.'})
                         .url('Please enter a valid URL.')
                         .superRefine(async (url, ctx) => {
                            try{
                                // console.log(url)
                                await validateImageUrl(url)
                            }
                            catch(error){
                                // console.log(error)
                                ctx.addIssue({
                                    code:'custom',
                                    message:'Please provide a valid image URL.'
                                })
                            }
                         })

const courseCreateFormSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    price: priceSchema,
    imageUrl: imageUrlSchema

})

module.exports = {
    signupSchema,
    signinSchema,
    courseCreateFormSchema
}

