import { useRecoilState, useRecoilStateLoadable, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from 'recoil'
import styles from './CourseCard.module.css'
import { creatorCourseAtomFamily, editModalAtom, modalCourseIdAtom, modalValuesAtom } from '../store/creatorCourseList'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseAtomFamily, userPurchasedCoureIdListAtom } from '../store/userCourseList'
import axios from 'axios'
const CourseCard = ({variant, id, purchased}) => {
    // console.log(variant, id, purchased)
    
    const setModalCourseId = useSetRecoilState(modalCourseIdAtom)
    const setModalVisible = useSetRecoilState(editModalAtom)
    const setModalValues = useSetRecoilState(modalValuesAtom)
    const [view, setView] = useState(false)
    const setUserPurchasedList = useSetRecoilState(userPurchasedCoureIdListAtom)
    let courseDetails, setCourseDetails
    if(variant == 'admin'){
        courseDetails = useRecoilValueLoadable(creatorCourseAtomFamily(id))
        setCourseDetails = useSetRecoilState(creatorCourseAtomFamily(id))

    }
    else{
        courseDetails = useRecoilValueLoadable(courseAtomFamily(id))
        setCourseDetails = useSetRecoilState(courseAtomFamily(id))

    }
    
    // console.log(courseDetails)
    useEffect(() => {
        if(purchased && courseDetails.state == 'hasValue')
        setCourseDetails(prev => ({...prev, purchased: purchased}))
    },[])

    


    const handleViewChange = () => {
        setView(x => !x)
    }
    const handleEditClick = () => {
        setModalValues({
            title:courseDetails.contents.title,
            description:courseDetails.contents.description,
            price:courseDetails.contents.price.toString(),
            imageUrl:courseDetails.contents.imageUrl,
        })
        setModalCourseId(id)
        setModalVisible(true)

    }
    const handleCoursePurchase = async () => {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/course/purchase/${id}`)
        if(response.data.purchase){
            setCourseDetails(prev => ({...prev, purchased: true}))
            setUserPurchasedList(prev => {
                if(!prev.some(cid => cid == id)){
                    return [...prev, id]
                }
                return prev
            })
        }

    }
    const handleCourseDelete = async () => {
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/course/refund/${id}`)
        if(response.data.deletedCourse){
            setCourseDetails(prev => ({...prev, purchased: false}))
            setUserPurchasedList(prev => prev.filter(cid => cid !== id))
        }
    }

    let actionButton = null;

    if (variant === 'admin') {
        actionButton = (
            <div onClick={handleEditClick} className={styles.Btn}>
            Edit Course
            </div>
        );
    } else if (variant === 'all') {
        if(purchased){
            actionButton = (
                <Link to="../purchases">
                    <div onClick={handleCoursePurchase} className={styles.Btn}>
                        View All Courses
                    </div>
                </Link>
            );
        }
        else{
            actionButton = (
                <div onClick={handleCoursePurchase} className={styles.Btn}>
                Purchase
                </div>
            );
        }
    } else if (variant === 'user') {
        actionButton = (
            <div onClick={handleCourseDelete} className={styles.Btn}>
            Delete Course
            </div>
        );
    }
   if(courseDetails.state == 'loading')return null
   if(courseDetails.state == 'hasValue'){
    return <div id={id} className={styles.CourseCard}>
        <img className={styles.thumbnail} src={courseDetails.contents.imageUrl} />
        <div className={styles.CourseDetails}>
            <div className={styles.courseTitle}>{courseDetails.contents.title}</div>
            <div className={styles.descWrapper}>
                <div className={`${styles.courseDesc} ${view ? styles.expanded : styles.collapsed}`}>{courseDetails.contents.description + ' '}{view && <span className={styles.viewChanger2} onClick={handleViewChange}>see less</span>}</div>
                {!view && <div className={styles.viewChanger} onClick={handleViewChange}>see more</div>}
            </div>
            <div className={styles.coursePrice}><span>&#8377;</span>{courseDetails.contents.price}</div>
        </div>
        {actionButton}
    </div>
   }
}
export default CourseCard