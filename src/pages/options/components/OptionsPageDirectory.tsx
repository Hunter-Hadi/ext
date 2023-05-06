import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-scroll'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import throttle from 'lodash-es/throttle'

interface Props {
  containerId: string // 目录容器的 id
}
type Heading = {
  id: string
  text: string
}

const offset = 104 // 滚动偏移量

const OptionsPageDirectory: React.FC<Props> = ({ containerId }) => {
  const [headings, setHeadings] = useState<Heading[]>([]) // 目录项的 id 列表
  const [activeIndex, setActiveIndex] = useState<number>(0) // 当前高亮的目录项索引
  const containerRef = useRef<HTMLDivElement | null>(null) // 目录容器的引用

  // 监听页面滚动事件，更新当前高亮的目录项索引
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (containerRef.current) {
        let newActiveIndex = 0
        for (let i = 0; i < headings.length; i++) {
          const heading = document.getElementById(headings[i].id)
          if (heading) {
            const headingRect = heading.getBoundingClientRect()
            if (headingRect.top > 0) {
              newActiveIndex = i
              break
            }
            if (headingRect.top < 0 && i === headings.length - 1) {
              newActiveIndex = i
              break
            }
          }
        }
        setActiveIndex(newActiveIndex)
      }
    }, 100)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])
  useEffect(() => {
    let times = 5
    const timer = setInterval(() => {
      if (times > 0) {
        containerRef.current = document.getElementById(
          containerId,
        ) as HTMLDivElement
        const headings = Array.from(
          document.querySelectorAll(`#${containerId} h1, #${containerId} h2`),
        ).map((heading) => ({
          id: heading.id,
          text:
            heading.childNodes?.[0]?.textContent || heading.textContent || '',
        }))
        setHeadings(headings)
        times--
      } else {
        clearInterval(timer)
      }
      return () => {
        clearInterval(timer)
      }
    }, 300)
  }, [containerId])
  return (
    <Box
      sx={{
        position: 'sticky',
        width: 'fit-content',
        top: offset,
        maxHeight: `calc(100vh - ${offset}px)`,
      }}
    >
      <List>
        {headings.map((heading, index) => (
          <Link
            key={index}
            offset={-offset}
            to={headings[index].id}
            smooth={true}
            duration={500}
            onClick={() => {
              // set url hash
              setTimeout(() => {
                window.location.hash = headings[index].id
              }, 500)
            }}
          >
            <ListItemButton selected={activeIndex === index}>
              <ListItemText primary={heading.text} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Box>
  )
}

export default OptionsPageDirectory
