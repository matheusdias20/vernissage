import styles from './SectionHeader.module.css'

function SectionHeader({ eyebrow, title, id, inverted = false }) {
  const className = [styles.header, inverted && styles.inverted].filter(Boolean).join(' ')

  return (
    <div id={id} className={className}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 className={styles.title}>{title}</h2>
    </div>
  )
}

export default SectionHeader
