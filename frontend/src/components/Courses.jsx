import { useRecoilValue } from 'recoil'
import styles from './Courses.module.css'
import { allCoureIdListAtom, userPurchasedCoureIdListAtom } from '../store/userCourseList'
import { useState } from 'react'
import CourseCard from './CourseCard'
import Pagination from './Pagination'

const Courses = () => {
    const courseIdList = useRecoilValue(allCoureIdListAtom)
    const userPurchasedList = useRecoilValue(userPurchasedCoureIdListAtom)
    const userPurchases = new Set(userPurchasedList)
    console.log(userPurchasedList)
    // console.log(courseIdList)
    const totalPages = (courseIdList.length + 7) / 8
    const [currPage, setCurrPage] = useState(1)
    return <div className={styles.Courses}>
        <div className={styles.heading}>All Courses</div>
        {(() => {
            let updateCourseIdList = courseIdList.slice((currPage - 1) * 8, currPage * 8)
            console.log(updateCourseIdList)
            return <div className={styles.allCoursesContainer}>
                {updateCourseIdList.map((id, index) => {
                    let isPurchased = userPurchases.has(id)
                    console.log(isPurchased)
                    return <CourseCard key={index} variant="all" id={id} purchased={isPurchased} />
                })}
            </div>
        })()}
        <Pagination currPage={currPage} setCurrPage={setCurrPage} totalPages={totalPages} />
    </div>
}

export default Courses