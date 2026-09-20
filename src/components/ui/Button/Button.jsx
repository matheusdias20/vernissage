import styles from './Button.module.css'

function ArrowIcon() {
  return (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Button({ variant = 'primary', onClick, children, icon, type = 'button', disabled = false, inverted = false }) {
  const className = [styles.button, styles[variant], inverted && styles.inverted].filter(Boolean).join(' ')

  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
      {icon === 'arrow' && <ArrowIcon />}
    </button>
  )
}

export default Button
