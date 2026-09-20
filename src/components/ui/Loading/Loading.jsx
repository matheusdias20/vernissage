import styles from './Loading.module.css'

// alterna proporções (3:4, 4:5, 1:1) para imitar a variedade de tamanhos da grade em mural
const RATIOS = [styles.ratio1, styles.ratio2, styles.ratio3]

function Loading({ count = 8 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  return (
    <div className={styles.grid} role="status">
      <span className="visually-hidden">Carregando obras</span>
      {skeletons.map((i) => (
        <div key={i} className={`${styles.skeleton} ${RATIOS[i % RATIOS.length]}`} aria-hidden="true" />
      ))}
    </div>
  )
}

export default Loading
