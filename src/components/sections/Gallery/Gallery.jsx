import { useRef, useState } from 'react'
import { useDebounce } from '../../../hooks/useDebounce.js'
import { useArtworks } from '../../../hooks/useArtworks.js'
import { useMediaQuery } from '../../../hooks/useMediaQuery.js'
import { THEMES } from '../../../constants/themes.js'
import { formatNumber } from '../../../utils/formatters.js'
import SectionHeader from '../../ui/SectionHeader/SectionHeader'
import Chip from '../../ui/Chip/Chip'
import Button from '../../ui/Button/Button'
import Pagination from '../../ui/Pagination/Pagination'
import Loading from '../../ui/Loading/Loading'
import EmptyState from '../../ui/EmptyState/EmptyState'
import ErrorMessage from '../../ui/ErrorMessage/ErrorMessage'
import SearchBar from '../../filters/SearchBar/SearchBar'
import Filters from '../../filters/Filters/Filters'
import ArtworkGrid from '../../artwork/ArtworkGrid/ArtworkGrid'
import styles from './Gallery.module.css'

function Gallery({ query, themeLabel, onQueryChange, onClearTheme, onSelectTheme, onOpenArtwork }) {
  const sectionRef = useRef(null)
  const [page, setPage] = useState(1)
  const [type, setType] = useState(null)
  // guarda a chave de filtros junto com a página válida para ela; sem efeito para reiniciar
  const [pageFiltersKey, setPageFiltersKey] = useState(null)

  const debouncedQuery = useDebounce(query, 400)
  const isMobile = useMediaQuery('(max-width: 640px)')

  const filtersKey = JSON.stringify({ query: debouncedQuery, type })
  const effectivePage = pageFiltersKey === filtersKey ? page : 1

  const { artworks, pagination, loading, error, retry } = useArtworks({
    query: debouncedQuery,
    page: effectivePage,
    type,
    append: isMobile,
  })

  function handleTypeChange(nextType) {
    setType(nextType)
  }

  function handlePageChange(nextPage) {
    setPage(nextPage)
    setPageFiltersKey(filtersKey)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleLoadMore() {
    setPage(effectivePage + 1)
    setPageFiltersKey(filtersKey)
  }

  function handleSuggestionClick(label) {
    const theme = THEMES.find((item) => item.label === label)
    if (theme) onSelectTheme(theme)
  }

  const countText = pagination.total === 1 ? '1 resultado' : `${formatNumber(pagination.total)} resultados`

  function renderContent() {
    if (loading && artworks.length === 0) {
      return <Loading count={12} />
    }

    if (!loading && error) {
      return <ErrorMessage message={error} onRetry={retry} />
    }

    if (!loading && artworks.length === 0) {
      return (
        <EmptyState
          title="Nada encontrado"
          message="Tente outro termo ou escolha um tema."
          suggestions={THEMES.map((theme) => theme.label)}
          onSuggestionClick={handleSuggestionClick}
        />
      )
    }

    return (
      <div className={styles.gridWrapper} aria-busy={loading}>
        <ArtworkGrid artworks={artworks} onOpen={onOpenArtwork} />
      </div>
    )
  }

  return (
    <section id="galeria" ref={sectionRef} className={styles.section}>
      <div className="container">
        <SectionHeader eyebrow="Acervo" title="Galeria" />

        <div className={styles.controls}>
          <SearchBar
            value={query}
            onChange={onQueryChange}
            onSubmit={onQueryChange}
            placeholder="Buscar por título, artista ou tema"
            variant="light"
            showSubmit={false}
          />

          <Filters type={type} onTypeChange={handleTypeChange} />

          <div className={styles.metaRow}>
            {themeLabel && <Chip label={`Tema: ${themeLabel}`} removable onRemove={onClearTheme} />}
            <p className={styles.count}>{countText}</p>
          </div>
        </div>

        <div className={styles.content}>{renderContent()}</div>

        {artworks.length > 0 && (
          <div className={styles.pager}>
            {isMobile ? (
              effectivePage < pagination.totalPages && (
                <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                  {loading ? 'Carregando...' : 'Carregar mais'}
                </Button>
              )
            ) : (
              <Pagination page={effectivePage} totalPages={pagination.totalPages} onChange={handlePageChange} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery
