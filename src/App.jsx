import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'
import Hero from './components/sections/Hero/Hero'
import StatsStrip from './components/sections/StatsStrip/StatsStrip'
import ThemeCarousel from './components/sections/ThemeCarousel/ThemeCarousel'
import StepsList from './components/sections/StepsList/StepsList'
import Gallery from './components/sections/Gallery/Gallery'
import ExhibitionPanel from './components/sections/ExhibitionPanel/ExhibitionPanel'

function App() {
  return (
    <>
      <Header />
      <Hero />
      <StatsStrip />
      <ThemeCarousel />
      <StepsList />
      <Gallery />
      <ExhibitionPanel />
      <Footer />
    </>
  )
}

export default App
