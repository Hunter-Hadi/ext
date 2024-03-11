import React, { useEffect, useMemo, useState } from "react"
import { Button, ButtonGroup, Tooltip } from "@mui/material"

import { ContextMenuIcon } from "@/components/ContextMenuIcon"
import useClientChat from "@/features/chatgpt/hooks/useClientChat"
import { IAIResponseMessage } from "@/features/chatgpt/types"
import { ISetActionsType } from "@/features/shortcuts/types/Action"
import useSidebarSettings from "@/features/sidebar/hooks/useSidebarSettings"
import {getPageSummaryType, getSummaryNavActions, allSummaryNavList } from "@/features/sidebar/utils/pageSummaryHelper"
import { summaryGetPromptObj } from "@/features/sidebar/utils/pageSummaryNavPrompt"
import { getChromeExtensionLocalStorage, setChromeExtensionLocalStorage } from "@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage"

const useSwitchSummaryAction = (message: IAIResponseMessage, loading: boolean,order:number) => {
    const [actionKey, setActionKey] = useState('all')
    const { askAIWIthShortcuts } = useClientChat()
    const summaryType = useMemo(() => getPageSummaryType(), [])
    const {
        currentSidebarConversationType,
    } = useSidebarSettings()
    useEffect(() => {
        setSwitchSummaryDefault()
    }, [])
    const setSwitchSummaryDefault = async () => {
        const chromeExtensionData = await getChromeExtensionLocalStorage()
        const smmaryNavKey = chromeExtensionData.sidebarSettings?.summary?.currentNavType?.[summaryType] || 'all'
        setActionKey(smmaryNavKey)
    }
    const isShowSummaryNavDom = useMemo(() => {
        return currentSidebarConversationType === 'Summary'&&order===1
    }, [currentSidebarConversationType])
    const clickNavTriggerActionChange = async (navItem: {
        title: string;
        titleIcon: string;
        key: string;
    }) => {
        if (loading) return
        setActionKey(navItem.key)
        const promptText = summaryGetPromptObj[summaryType]((navItem.key as 'all'))//as假过判断ts，实际不是all
        await setChromeExtensionLocalStorage({
            sidebarSettings: {
                summary: {
                    currentNavType: { [summaryType]: navItem.key }
                }
            }
        })
        const actions = getSummaryNavActions({ type: summaryType, messageId: message.messageId, prompt: promptText, title: navItem.title })
        askAIWIthShortcuts((actions as ISetActionsType))
    }
    const switchSummaryNavDom = () => {
        if (!isShowSummaryNavDom) return null
        return <ButtonGroup variant="outlined" aria-label="Basic button group" >
            {
                allSummaryNavList[summaryType].map(navItem => (
                    <Tooltip title={navItem.title}>
                        <Button disabled={loading} variant={actionKey === navItem.key ? "contained" : "outlined"} onClick={() => clickNavTriggerActionChange(navItem)}>
                            <ContextMenuIcon
                                sx={{
                                    color: actionKey === navItem.key ? '#fff' : 'primary.main',
                                    fontSize: 18,
                                }}
                                icon={navItem.titleIcon}
                            />
                        </Button>
                    </Tooltip>
                ))
            }
        </ButtonGroup >

    }
    return { switchSummaryNavDom }
}
export default useSwitchSummaryAction