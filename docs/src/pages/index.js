import React from 'react'
import classnames from 'classnames'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'

import styles from './styles.module.css'

const features = [
  {
    title: 'Our Spreadsheet',
    imageUrl: 'img/apollo-spreadsheet.svg',
    description: (
      <>
        Apollo spreadsheet supports table and grids as it’s never been done, built using React
        hooks, styled-components, plus it’s fully written in Typescript!
      </>
    ),
  },
  {
    title: 'Why Apollo?',
    imageUrl: 'img/react-ts.svg',
    description: (
      <>
        Apollo relies on React updates. It’s built using Typescript, it’s developer friendly, offers
        merge cells, immutability support, plus virtualizes the data at all cost avoiding
        unnecessary elements in the DOM
      </>
    ),
  },
  {
    title: 'Virtualization in Mind',
    imageUrl: 'img/react-virtualized.svg',
    description: (
      <>
        With Apollo, you can have hundreds and thousend of rows without suffering any performance
        loss or unnecessary rendering
      </>
    ),
  },
]

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl)
  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context

  return (
    <Layout
      // title={`Hello from ${siteConfig.title}`}
      title={siteConfig.title}
      description="Description will go into a meta tag in <head />"
    >
      <div className={styles.hero}>
        <header>
          <h1 className={styles.title}>{siteConfig.title}</h1>
          <p className={styles.subtitle}>{siteConfig.tagline}</p>
          <a className={styles.buttons} href="/docs">
            Get Started
          </a>
        </header>
        <main>
          {features && features.length > 0 && (
            <section className={styles.section}>
              <div className={styles.features}>
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </Layout>
  )
}

export default Home
