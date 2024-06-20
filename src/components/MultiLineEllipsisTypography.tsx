import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

interface MultiLineEllipsisTypographyProps {
  maxLine?: number
}

const MultiLineEllipsisTypography = styled(
  Typography,
)<MultiLineEllipsisTypographyProps>(({ maxLine = 3 }) => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  WebkitLineClamp: maxLine, // 设置显示的行数，默认三行
}))

export default MultiLineEllipsisTypography
