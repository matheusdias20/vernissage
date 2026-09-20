import SectionHeader from '../../ui/SectionHeader/SectionHeader'
import styles from './StepsList.module.css'

const STEPS = [
  { number: '01', title: 'Explore', description: 'Navegue por temas ou busque por artista, título ou assunto.' },
  { number: '02', title: 'Escolha', description: 'Toque no coração das obras de que você gostou.' },
  { number: '03', title: 'Monte', description: 'Dê um nome à sua exposição e revise a seleção.' },
]

function StepsList() {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader eyebrow="Seu caminho" title="Como funciona" />

        <ol className={styles.list}>
          {STEPS.map((step) => (
            <li key={step.number} className={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {step.number}
              </span>
              <div className={styles.content}>
                <h3 className={styles.title}>{step.title}</h3>
                <p className={styles.description}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default StepsList
