import { useRecoilState, useRecoilStateLoadable } from 'recoil'
import styles from './CreatedCourses.module.css'
import { creatorCourseIdListAtom } from '../store/creatorCourseList'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import CourseCard from './CourseCard'
import Pagination from './Pagination'

const CreatedCourses = () => {
    const [currPage, setCurrPage] = useState(1)
    const [createdCourseIdList, setCreatedCourseIdList] = useRecoilState(creatorCourseIdListAtom)
    const [loading, setLoading] = useState(true)
    const totalPages = (createdCourseIdList.length + 7)/8

    useEffect(() => {
        const fetch = async () => {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/course/preview`)
            // console.log(response.data.courses)
            setCreatedCourseIdList(response.data.courses)
            setLoading(false)
        }
        fetch()
    },[])
    if(loading)return null
    return <div className={styles.createdCourses}>
        <div className={styles.heading}>My Creations</div>
        {(() => {
            let filteredCreatedCourseIdList = createdCourseIdList.slice((currPage - 1) * 8, currPage * 8)
            return <div className={styles.createdCoursesContainer}>
                {filteredCreatedCourseIdList.map((id, index) => <CourseCard variant="admin" key={index} id={id} />)}
            </div>
        })()}
        <Pagination currPage={currPage} setCurrPage={setCurrPage} totalPages={totalPages} />
    </div>
}

export default CreatedCourses