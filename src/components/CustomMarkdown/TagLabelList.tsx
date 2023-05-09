import { Typography } from '@mui/material'
import React, { FC } from 'react'

interface IProps {
  tags: string[]
}

const TagLabelList: FC<IProps> = ({ tags }) => {
  return (
    <p>
      {tags.map((tag) => (
        <Typography
          key={tag}
          variant={'body1'}
          component={'span'}
          color={'text.primary'}
        >
          {tag}{' '}
        </Typography>
      ))}
    </p>
  )
}

export const isTagLabelListCheck = (str: string) => {
  const tagRegex = /^(?:#[\u4e00-\u9fff\w]+(?: #[\u4e00-\u9fff\w]+){1,})/
  return typeof str === 'string' && str[0] !== ' ' && tagRegex.test(`${str}`)
}

export default TagLabelList
