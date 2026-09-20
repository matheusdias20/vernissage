import ArtworkCard from '../ArtworkCard/ArtworkCard'
import styles from './ArtworkGrid.module.css'

function ArtworkGrid({ artworks, onOpen }) {
  return (
    <div className={styles.grid}>
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} onOpen={onOpen} />
      ))}
    </div>
  )
}

export default ArtworkGrid
