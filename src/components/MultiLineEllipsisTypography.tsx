import Typography from '@mui/material/Typography'
import { styled } from '@mui/system'

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
