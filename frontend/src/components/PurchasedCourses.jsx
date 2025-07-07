import { useRecoilState } from 'recoil'
import styles from './PurchasedCourses.module.css'
import { userPurchasedCoureIdListAtom } from '../store/userCourseList'
import { useState } from 'react'
import CourseCard from './CourseCard'
import Pagination from './Pagination'
// import { set } from 'zod'

const PurchasedCourses = () => {
    const [userPurchasedList, setUserPurchasedList] = useRecoilState(userPurchasedCoureIdListAtom)
    const [currPage, setCurrPage] = useState(1)
    const totalPages = parseInt((userPurchasedList.length + 7) / 8)
    // console.log(currPage)
    if(totalPages < currPage){
        if(totalPages == 0)setCurrPage(1)
        else{
            setCurrPage(totalPages)
        }
    }
    // console.log
    return <div className={styles.PurchasedCourses}>
        <div className={styles.heading}>My Purchases</div>
        {(() => {
            const updatedUserPurchasedIdList = userPurchasedList.slice((currPage - 1) * 8, currPage * 8)
            return <div className={styles.PurchasedCoursesContainer}>
                {updatedUserPurchasedIdList.map((id, index) => <CourseCard key={index} variant="user" id={id} />)}
            </div>
        })()}
        <Pagination currPage={currPage} setCurrPage={setCurrPage} totalPages={totalPages} />
    </div>
}

export default PurchasedCourses