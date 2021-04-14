import React from 'react'
import classnames from 'classnames'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'

import styles from './styles.module.css'

const features = [
  {
    title: 'Our Spreadsheet',
    imageUrl: 'img/apollo-spreadsheet-light.svg',
    description: (
      <>
      Apollo spreadsheet supports table and grids as it’s never been done, 
      built using React hooks, styled-components, plus it’s fully written in Typescript!
      </>
    ),
  },
  {
    title: 'Why Apollo?',
   imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
      Apollo relies on React updates. 
      It’s built using Typescript, it’s developer friendly, 
      offers merge cells, immutability support, 
      plus virtualizes the data at all cost avoiding 
      unnecessary elements in the DOM
      </>
    ),
  },
  {
    title: 'Powered by React',
    imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can be extended while
        reusing the same header and footer.
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
          <h1>{siteConfig.title}</h1>
          <p>{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link to={useBaseUrl('docs/')}>Get Started</Link>
          </div>
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
