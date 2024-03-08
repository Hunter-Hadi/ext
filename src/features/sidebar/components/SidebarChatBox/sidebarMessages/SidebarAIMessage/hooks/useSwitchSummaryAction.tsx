import { ContextMenuIcon } from "@/components/ContextMenuIcon"
import useClientChat from "@/features/chatgpt/hooks/useClientChat"
import { IAIResponseMessage } from "@/features/chatgpt/types"
import { ISetActionsType } from "@/features/shortcuts/types/Action"
import useSidebarSettings from "@/features/sidebar/hooks/useSidebarSettings"
import { IPageSummaryType, PAGE_SUMMARY_CONTEXT_MENU_MAP, getPageSummaryType } from "@/features/sidebar/utils/pageSummaryHelper"
import { summaryGetPromptObj } from "@/features/sidebar/utils/pageSummaryPrompt"
import { Button, ButtonGroup, Tooltip } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react"

const actionBtnList: { [key in IPageSummaryType]: { title: string, titleIcon: string, key: string }[] } = {
    'PAGE_SUMMARY': [
        { title: 'Summarize page', titleIcon: 'Summarize', key: 'all' },
        { title: 'Summarize page (TL;DR)', titleIcon: 'AutoStoriesOutlined', key: 'summary' },
        { title: 'Summarize page (Key takeaways)', titleIcon: 'Bulleted', key: 'keyTakeaways' },
    ],
    'PDF_CRX_SUMMARY': [
        { title: 'Summarize PDF', titleIcon: 'Summarize', key: 'all' },
        { title: 'Summarize PDF (TL;DR)', titleIcon: 'AutoStoriesOutlined', key: 'summary' },
        { title: 'Summarize PDF (Key takeaways)', titleIcon: 'Bulleted', key: 'keyTakeaways' },
    ],
    'YOUTUBE_VIDEO_SUMMARY': [
        { title: 'Summarize video', titleIcon: 'Summarize', key: 'all' },
        { title: 'Summarize comments', titleIcon: 'CommentOutlined', key: 'commit' },
        { title: 'Show transcript', titleIcon: 'ClosedCaptionOffOutlined', key: 'transcript' },
    ],
    'DEFAULT_EMAIL_SUMMARY': [
        { title: 'Summarize email', titleIcon: 'Summarize', key: 'all' },
        { title: 'Summarize email (TL;DR)', titleIcon: 'AutoStoriesOutlined', key: 'summary' },
        { title: 'Summarize email (Key takeaways)', titleIcon: 'Bulleted', key: 'keyTakeaways' },
        { title: 'Summarize email (Action items)', titleIcon: 'Bulleted', key: 'actions' },
    ],
}
const summaryActionsObj = (type: IPageSummaryType, messageId: string, prompt: string = '', title: string = '') => {
    console.log('simply title', title)
    let currentActions = PAGE_SUMMARY_CONTEXT_MENU_MAP[type].data.actions || []
    const defAction = [{
        type: 'CHAT_MESSAGE',
        parameters: {
            ActionChatMessageOperationType: 'update',
            ActionChatMessageConfig: {
                type: 'ai',
                messageId: messageId,
                text: '',
                originalMessage: {
                    metadata: {
                        isComplete: false,
                        copilot: {
                            steps: [
                                {
                                    title: 'Analyzing video',
                                    status: 'complete',
                                    icon: 'SmartToy',
                                    value: '{{CURRENT_WEBPAGE_TITLE}}',
                                },
                            ],
                        },
                        title: {
                            title: title || 'Summary',
                        },
                        deepDive: {
                            title: {
                                title: '',
                                titleIcon: '',
                            },
                            value: '',
                        },
                    },
                    content: {
                        title: {
                            title: 'Summary',
                        },
                        text: '',
                        contentType: 'text',
                    },
                    includeHistory: false,
                },
            } as IAIResponseMessage,
        },
    }
        //  {
        //     type: 'CHAT_MESSAGE',
        //     parameters: {
        //         ActionChatMessageOperationType: 'update',
        //         ActionChatMessageConfig: {
        //             type: 'ai',
        //             messageId: messageId,
        //             text: '',
        //             originalMessage: {
        //                 status: 'complete',
        //                 metadata: {
        //                     isComplete: false,
        //                     deepDive: {
        //                         value: '',
        //                     },
        //                 },
        //                 includeHistory: false,
        //             },
        //         } as IAIResponseMessage,
        //     },
        // }
    ]
    currentActions = currentActions?.filter(item => {
        if (item.parameters.ActionChatMessageOperationType === 'add') {
            return false
        }
        return true
    }).map(action => {
        if (action?.parameters?.ActionChatMessageConfig?.messageId) {
            action.parameters.ActionChatMessageConfig.messageId = messageId
        }
        if (action?.parameters?.AskChatGPTActionQuestion?.meta?.outputMessageId) {
            action.parameters.AskChatGPTActionQuestion.meta.outputMessageId = messageId
        }
        if (action.type === 'ASK_CHATGPT' && action.parameters.AskChatGPTActionQuestion) {
            action.parameters.AskChatGPTActionQuestion.text = prompt
        }
        return action
    })
    return [...defAction, ...currentActions]
}
const useSwitchSummaryAction = (message: IAIResponseMessage, loading: boolean) => {
    const [actionKey, setActionKey] = useState('all')
    const { askAIWIthShortcuts } = useClientChat()
    const summaryType = useMemo(() => getPageSummaryType(), [])
    const {
        currentSidebarConversationType,
    } = useSidebarSettings()
    useEffect(() => {
        console.log('simply loading', loading)

        console.log('simply message', message)
        console.log('simply currentSidebarConversationType', currentSidebarConversationType)
        console.log('simply SummaryType', getPageSummaryType())
    }, [message, loading])
    useEffect(() => {
        if (message.originalMessage?.metadata?.title?.title) {
            actionBtnList[summaryType].forEach(action => {
                if (action.title === message.originalMessage?.metadata?.title?.title) {
                    setActionKey(action.key)
                }
            })
        }

    }, [])
    const isShowDom = useMemo(() => {
        return currentSidebarConversationType === 'Summary'
    }, [currentSidebarConversationType])
    const btnClick = async (itemInfo: {
        title: string;
        titleIcon: string;
        key: string;
    }) => {
        if (loading) return
        setActionKey(itemInfo.key)
        console.log('simply summaryType', summaryType)
        console.log('simply key', itemInfo.key)
        const promptText = summaryGetPromptObj[summaryType]((itemInfo.key as 'all'))//as假过判断ts，实际不是all
        console.log('simply promptText', promptText)
        const actions = summaryActionsObj(summaryType, message.messageId, promptText, itemInfo.title)
        askAIWIthShortcuts((actions as ISetActionsType))
    }
    const switchActionDom = () => {
        if (!isShowDom) return null
        return <ButtonGroup variant="outlined" aria-label="Basic button group" >
            {
                actionBtnList[summaryType].map(item => (
                    <Tooltip title={item.title}>
                        <Button disabled={loading} variant={actionKey === item.key ? "contained" : "outlined"} onClick={() => btnClick(item)}>
                            <ContextMenuIcon
                                sx={{
                                    color: actionKey === item.key ? '#fff' : 'primary.main',
                                    fontSize: 18,
                                }}
                                icon={item.titleIcon}
                            />
                        </Button>
                    </Tooltip>


                ))
            }
        </ButtonGroup >

    }
    return { switchActionDom }
}
export default useSwitchSummaryAction