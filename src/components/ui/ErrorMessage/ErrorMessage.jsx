import Button from '../Button/Button'
import styles from './ErrorMessage.module.css'

function AlertIcon() {
  return (
    <svg className={styles.icon} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path d="M16 4L30 27H2L16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="16" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="23" r="1" fill="currentColor" />
    </svg>
  )
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className={styles.errorMessage} role="alert">
      <AlertIcon />
      <p className={styles.message}>{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}

export default ErrorMessage
