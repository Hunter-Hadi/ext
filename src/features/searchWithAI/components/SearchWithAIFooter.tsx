// import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined'
import { FC } from 'react'
import React from 'react'

interface IProps {
  handleAskQuestion: () => void
}

const SearchWithAIFooter: FC<IProps> = ({ handleAskQuestion }) => {
  return <></>

  // if (!currentProvider || !conversationLink) {
  //   return null
  // }

  // const handleOpenChatLink = () => {
  //   chromeExtensionClientOpenPage({
  //     url: conversationLink,
  //   })
  // }

  // return (
  //   <Stack p={2} spacing={1} alignItems="flex-start">
  //     <Button
  //       variant="normalOutlined"
  //       endIcon={<LaunchOutlinedIcon />}
  //       onClick={handleOpenChatLink}
  //     >
  //       Continue in {AI_PROVIDER_NAME_MAP[currentProvider]}
  //     </Button>
  //     {/* <Button
  //       variant="normalOutlined"
  //       endIcon={<LoopOutlinedIcon />}
  //       onClick={handleAskQuestion}
  //     >
  //       Ask again
  //     </Button> */}
  //   </Stack>
}

export default SearchWithAIFooter
