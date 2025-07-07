import { atom } from "recoil";

export const isLoggedInAtom = atom({
    key:'LoginStatus',
    default: false
})

export const roleAtom = atom({
    key:"RoleStatus",
    default:null
})
export const nameAtom = atom({
    key:'nameAtoms',
    default:null
})