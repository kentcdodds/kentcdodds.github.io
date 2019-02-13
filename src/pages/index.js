import React from 'react'
import ReactDOM from 'react-dom'
import {graphql} from 'gatsby'
import {css} from '@emotion/core'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import Link from '../components/Link'
import Container from 'components/Container'
import {rhythm, fonts} from '../lib/typography'
import parseQueryString from '../lib/parse-query-string'
import theme from '../../config/theme'
import {bpMaxMD, bpMaxSM} from '../lib/breakpoints'
import Hero from 'components/big-hero'

import workshopsImg from '../images/workshops.svg'
import talksImg from '../images/talks.svg'
import minutesImg from '../images/3-minutes.svg'

const Card = ({backgroundColor = '#E75248', image, title, link}) => (
  <Link
    to={link}
    css={css`
      * {
        color: white;
        margin: 0;
      }
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${backgroundColor};
      overflow: hidden;
      border-radius: 5px;
      h4 {
        padding: 40px 40px 0 40px;
      }
      img {
        margin-top: 20px;
      }
      :hover {
        transform: scale(1.03);
        box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.15);
      }
    `}
  >
    <h4>{title}</h4>
    <img src={image} alt={title} />
  </Link>
)

const PostTitle = styled.h3`
  margin-bottom: ${rhythm(0.3)};
  transition: ${theme.transition.ease};
  font-size: 22px;
  font-family: ${fonts.regular};
  :hover {
    color: ${theme.brand.primary};
    transition: ${theme.transition.ease};
  }
`

const Description = styled.p`
  margin-bottom: 10px;
  display: inline-block;
`

// this component is one big shrug. I didn't have time to get good at animation
// and it's such a simple single-use component hack something I could ship...
function SubscribeConfirmation() {
  const portalContainerRef = React.useRef(null)
  const [showMessage, setShowMessage] = React.useState(false)
  const [animateIn, setAnimateIn] = React.useState(false)
  React.useEffect(() => {
    portalContainerRef.current = document.createElement('div')
    Object.assign(portalContainerRef.current.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 11,
    })
    document.body.append(portalContainerRef.current)
  }, [])

  React.useEffect(() => {
    if (parseQueryString(window.location.search).hasOwnProperty('subscribed')) {
      setTimeout(() => {
        setShowMessage(true)
        setTimeout(() => {
          setShowMessage(false)
        }, 4500)
      }, 200)
    }
  }, [])
  React.useEffect(
    () => {
      if (showMessage) {
        setAnimateIn(true)
        setTimeout(() => setAnimateIn(false), 4000)
      }
    },
    [showMessage],
  )

  if (showMessage) {
    return ReactDOM.createPortal(
      <button
        onClick={() => setAnimateIn(false)}
        css={css`
          border-radius: 0;
          width: 100%;
          padding: 20px;
          display: flex;
          justify-content: center;
          background-color: ${theme.colors.green};
          color: ${theme.colors.primary_light};
          transition: 0.3s;
          transform: translateY(${animateIn ? '0' : '-85'}px);
        `}
      >
        Thanks for subscribing!
      </button>,
      portalContainerRef.current,
    )
  } else {
    return null
  }
}

export default function Index({data: {allMdx}}) {
  return (
    <Layout
      headerColor={theme.colors.white}
      hero={<Hero />}
      pageTitle="Home of Kent C. Dodds"
    >
      <SubscribeConfirmation />
      <Container
        css={css`
          margin-top: -20px;
          position: relative;
          padding-bottom: 0;
          background: white;
          border-radius: 5px;
          padding: 40px 80px 60px 80px;
          ${bpMaxMD} {
            padding: auto;
          }
          ${bpMaxSM} {
            border-radius: 0;
          }
        `}
      >
        <h2>Blog</h2>
        <br />
        {allMdx.edges.map(({node: post}) => (
          <div
            key={post.id}
            css={css`
              margin-bottom: 40px;
            `}
          >
            <Link
              to={post.fields.slug}
              aria-label={`View ${post.frontmatter.title}`}
            >
              <PostTitle>{post.frontmatter.title}</PostTitle>
            </Link>
            <Description>
              {post.excerpt}{' '}
              <Link
                to={post.fields.slug}
                aria-label={`View ${post.frontmatter.title}`}
              >
                Read →
              </Link>
            </Description>
            <span />
          </div>
        ))}
        <Link to="/blog" aria-label="Visit blog page">
          View all articles
        </Link>
      </Container>
      <Container>
        <br />
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(auto-fit, 226px);
            grid-gap: 20px;

            ${bpMaxSM} {
              grid-template-columns: 1fr;
            }
          `}
        >
          <Card
            backgroundColor={theme.colors.red}
            title="Workshops"
            image={workshopsImg}
            link="/workshops"
          />
          <Card
            title="Talks"
            backgroundColor={theme.colors.blue}
            image={talksImg}
            link="/talks"
          />
          <Card
            title="3 Minutes with Kent"
            backgroundColor={theme.colors.yellow}
            image={minutesImg}
            link="https://www.briefs.fm/3-minutes-with-kent"
          />
        </div>
      </Container>
    </Layout>
  )
}

export const pageQuery = graphql`
  query {
    allMdx(
      limit: 5
      sort: {fields: [frontmatter___date], order: DESC}
      filter: {
        frontmatter: {published: {ne: false}}
        fileAbsolutePath: {regex: "//content/blog//"}
      }
    ) {
      edges {
        node {
          excerpt(pruneLength: 190)
          id
          fields {
            title
            slug
            date
          }
          parent {
            ... on File {
              sourceInstanceName
            }
          }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            description
            banner {
              childImageSharp {
                sizes(maxWidth: 720) {
                  ...GatsbyImageSharpSizes
                }
              }
            }
            keywords
          }
        }
      }
    }
  }
`
