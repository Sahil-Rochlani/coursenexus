import axios from "axios";
import { atom, atomFamily, selector, selectorFamily } from "recoil";

export const creatorCourseIdListAtom = atom({
    key:'creatorCourseIdListAtom',
    default: []
})

export const creatorCourseAtomFamily = atomFamily({
    key:'CreatorCourseAtegnkejgomFamily',
    default: selectorFamily({
        key:'CreatorCoursjergkjergeSelectorFamily',
        get:(id) => async () => {
            try{    if(id === '')return null
                const response = await axios.get(`http://localhost:3000/admin/course/preview/${id}`)
                return response.data.course
            }
            catch(err){
                return null;
            }
        }
    })
})
export const editModalAtom = atom({
    key:'editModalAtom',
    default: false
})

export const modalValuesAtom = atom({
    key: 'modalValuesAtom',
    default: {
        title:'',
        description:'',
        price:'',
        imageUrl:''
    }
})
export const modalCourseIdAtom = atom({
    key:'modalCourseIdAtom',
    default:''
})

