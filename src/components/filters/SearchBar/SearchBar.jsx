import { useId } from 'react'
import styles from './SearchBar.module.css'

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  variant = 'light',
  submitLabel = 'Buscar',
  showSubmit = true,
}) {
  const inputId = useId()
  const className = `${styles.form} ${variant === 'dark' ? styles.dark : styles.light}`

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(value)
  }

  return (
    <form className={className} role="search" onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="visually-hidden">
        {placeholder}
      </label>
      <input
        id={inputId}
        type="search"
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {showSubmit && (
        <button type="submit" className={styles.submit}>
          {submitLabel}
        </button>
      )}
    </form>
  )
}

export default SearchBar
