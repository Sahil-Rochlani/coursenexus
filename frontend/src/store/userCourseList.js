import axios from "axios"
import { atom, atomFamily, selectorFamily } from "recoil"

export const allCoureIdListAtom = atom({
    key: 'allCoureIdListAtom',
    default: []
})

export const userPurchasedCoureIdListAtom = atom({
    key: 'userPurchasedCoureIdListAtom',
    default: []
})

export const courseAtomFamily = atomFamily({
    key:'courseAtomFamily',
    default: selectorFamily({
        key:'courseSelectorFamily',
        get:(id) => async () => {
            try{
                const response = await axios.get(`http://localhost:3000/course/preview/${id}`)
                // console.log(response.data.course)
                return {...response.data.course, purchased:false}
            }
            catch(err){
                console.log(err)
                return null
            }
        }
    })
})