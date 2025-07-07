import styles from './Pagination.module.css'

const Pagination = ({currPage, setCurrPage, totalPages}) => {
    totalPages = parseInt(totalPages)
    return <div className={styles.pagination}>
    {totalPages >= 1 && <button disabled={currPage == 1} className={styles.pageBtn} onClick={() => {setCurrPage(curr => curr - 1)}}>&#60;</button>}
    {totalPages >= 1 && Array.from({length: totalPages}, (_, i) => (
        <button  key={i} className={`${styles.pageBtn} ${currPage == i + 1 ? styles.active : ''}`} onClick={() => setCurrPage(i + 1)}>
            {i + 1}
        </button>
    ))}
    {totalPages >= 1 && <button disabled={currPage == totalPages} className={styles.pageBtn} onClick={() => {setCurrPage(curr => curr + 1)}}>&#62;</button>}
</div>
}

export default Pagination