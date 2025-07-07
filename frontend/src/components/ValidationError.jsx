import styles from './ValidationError.module.css'

const ValidationError = ({ error }) =>{
    return <p className={styles.errDiv}><svg className={styles.errIcon} xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 451.429 451.429">
    <g transform="translate(-2887.5916 -192.36151)">
      <path fill="#d33" d="M3339.02061728 418.07602803a225.71451193 225.71451193 0 0 1-225.71457045 225.71450023 225.71451193 225.71451193 0 0 1-225.71446512-225.71450023 225.71451193 225.71451193 0 0 1 225.71446512-225.71451193 225.71451193 225.71451193 0 0 1 225.71457045 225.71451193Z"/>
      <g fill="#fff" fontFamily="College Slab" fontSize="144" fontWeight="700" letterSpacing="0" style={{lineHeight: '125%'}} transform="rotate(180 5463.0805 -69.24581) scale(3.14355)">
        <path d="M2494.2863-197.59079v73.872h-17.856v-73.872h17.856" fontFamily="Lato" style={{fontWeight: 'bold'}}/>
        <circle cx="139.73659" cy="101.28652" r="35.067654" transform="translate(2440.9065 -251.44719) scale(.31811)"/>
      </g>
    </g>
  </svg>
  {error}</p>
}

export default ValidationError