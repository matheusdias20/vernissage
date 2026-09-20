import { useState } from 'react'
import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'
import Hero from './components/sections/Hero/Hero'
import StatsStrip from './components/sections/StatsStrip/StatsStrip'
import ThemeCarousel from './components/sections/ThemeCarousel/ThemeCarousel'
import StepsList from './components/sections/StepsList/StepsList'
import Gallery from './components/sections/Gallery/Gallery'
import ExhibitionPanel from './components/sections/ExhibitionPanel/ExhibitionPanel'
import ArtworkModal from './components/artwork/ArtworkModal/ArtworkModal'

function scrollToGallery() {
  document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })
}

function App() {
  const [query, setQuery] = useState('')
  const [themeLabel, setThemeLabel] = useState(null)
  const [selectedArtworkId, setSelectedArtworkId] = useState(null)

  function handleSearch(text) {
    setQuery(text)
    setThemeLabel(null)
    scrollToGallery()
  }

  function handleSelectTheme(theme) {
    setQuery(theme.query)
    setThemeLabel(theme.label)
    scrollToGallery()
  }

  function handleQueryChange(text) {
    setQuery(text)
    setThemeLabel(null)
  }

  function handleClearTheme() {
    setQuery('')
    setThemeLabel(null)
  }

  function handleOpenArtwork(id) {
    setSelectedArtworkId(id)
  }

  function handleCloseArtwork() {
    setSelectedArtworkId(null)
  }

  return (
    <>
      <Header />
      <Hero onSearch={handleSearch} onOpenArtwork={handleOpenArtwork} />
      <StatsStrip />
      <ThemeCarousel onSelectTheme={handleSelectTheme} />
      <StepsList />
      <Gallery
        query={query}
        themeLabel={themeLabel}
        onQueryChange={handleQueryChange}
        onClearTheme={handleClearTheme}
        onSelectTheme={handleSelectTheme}
        onOpenArtwork={handleOpenArtwork}
      />
      <ExhibitionPanel onOpenArtwork={handleOpenArtwork} />
      <Footer />
      {selectedArtworkId !== null && <ArtworkModal artworkId={selectedArtworkId} onClose={handleCloseArtwork} />}
    </>
  )
}

export default App
