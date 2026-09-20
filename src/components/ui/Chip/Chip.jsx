import styles from './Chip.module.css'

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" focusable="false">
      <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Chip({ label, active = false, onClick, removable = false, onRemove }) {
  const className = [styles.chip, active && styles.active].filter(Boolean).join(' ')

  return (
    <span className={className}>
      <button type="button" className={styles.label} aria-pressed={active} onClick={onClick}>
        {label}
      </button>
      {removable && (
        <button type="button" className={styles.remove} aria-label={`Remover filtro ${label}`} onClick={onRemove}>
          <CloseIcon />
        </button>
      )}
    </span>
  )
}

export default Chip
