import { FEATURED_TYPES } from '../../../constants/artworkTypes.js'
import Chip from '../../ui/Chip/Chip'
import styles from './Filters.module.css'

function Filters({ type, onTypeChange }) {
  return (
    <div className={styles.filters}>
      <Chip label="Todos" active={type === null} onClick={() => onTypeChange(null)} />
      {FEATURED_TYPES.map((item) => (
        <Chip
          key={item.value}
          label={item.label}
          active={type === item.value}
          onClick={() => onTypeChange(item.value)}
        />
      ))}
    </div>
  )
}

export default Filters
