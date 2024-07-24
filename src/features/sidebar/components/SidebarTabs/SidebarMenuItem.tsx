import React from 'react'

import SidebarTabItem, {
  ISidebarTabItemProps,
} from '@/features/sidebar/components/SidebarTabs/SidebarTabItem'

export interface ISidebarMenuItemProps extends ISidebarTabItemProps {}

const SidebarMenuItem: React.FC<ISidebarMenuItemProps> = (props) => {
  return (
    <SidebarTabItem
      {...props}
      sx={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        color: 'text.secondary',
        borderRadius: 2,
        gap: 2,
        p: 1,
        bgcolor: (t) =>
          props.active
            ? t.palette.mode === 'dark'
              ? 'rgba(44, 44, 44, 1)'
              : 'rgba(0, 0, 0, 0.06)'
            : 'transparent',

        '&:hover': {
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(44, 44, 44, 1)'
              : 'rgba(0, 0, 0, 0.06)',
        },
        ...props.sx,
      }}
      labelSx={{ fontSize: 16 }}
    />
  )
}

export default SidebarMenuItem
