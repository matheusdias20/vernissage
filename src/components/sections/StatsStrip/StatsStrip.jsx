import { useStats } from '../../../hooks/useStats.js'
import { formatNumber } from '../../../utils/formatters.js'
import styles from './StatsStrip.module.css'

const ITEMS = [
  { key: 'totalArtworks', label: 'obras no acervo' },
  { key: 'totalWithImage', label: 'com imagem em domínio público' },
  { key: 'totalPaintings', label: 'pinturas' },
]

function StatsStrip() {
  const stats = useStats()

  return (
    <section className={styles.strip}>
      <div className={`container ${styles.grid}`}>
        {ITEMS.map((item) => {
          const display = stats.loading ? '...' : stats.error ? 'n/d' : formatNumber(stats[item.key])

          return (
            <div key={item.key} className={styles.item}>
              <p className={styles.number}>{display}</p>
              <p className={styles.label}>{item.label}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default StatsStrip
