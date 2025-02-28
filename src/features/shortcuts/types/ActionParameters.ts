import {
  IAskChatGPTActionQuestionType,
  IChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import { ActionSetVariablesModalConfig } from '@/features/shortcuts/components/ActionSetVariablesModal'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { AskChatGPTActionType } from '@/features/shortcuts/types/Extra/AskChatGPTActionType'
import { MaxAIDocumentActionConfig } from '@/features/shortcuts/types/Extra/MaxAIDocumentActionConfig'
import { MaxAIPromptActionConfig } from '@/features/shortcuts/types/Extra/MaxAIPromptActionConfig'
import { OperationElementConfigType } from '@/features/shortcuts/types/Extra/OperationElementConfigType'
import SliceTextActionType from '@/features/shortcuts/types/Extra/SliceTextActionType'
import SummarizeActionType from '@/features/shortcuts/types/Extra/SummarizeActionType'
import URLSearchEngine from '@/features/shortcuts/types/IOS_WF/URLSearchEngine'
import { ICommentData } from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'
import { ITextHandlerParameters } from '@/features/shortcuts/utils/textHelper'
import { IWebsiteContext } from '@/features/websiteContext/background'

import AssertionType from './IOS_WF/AssertionType'
import FaceTimeType from './IOS_WF/FaceTimeType'
import WFArchiveFormat from './IOS_WF/WFArchiveFormat'
import WFAskActionDateGranularity from './IOS_WF/WFAskActionDateGranularity'
import WFBase64LineBreakMode from './IOS_WF/WFBase64LineBreakMode'
import WFCondition from './IOS_WF/WFCondition'
import WFCountType from './IOS_WF/WFCountType'
import WFDateActionMode from './IOS_WF/WFDateActionMode'
import WFDateFormatStyle from './IOS_WF/WFDateFormatStyle'
import WFDeviceDetail from './IOS_WF/WFDeviceDetail'
import WFEncodeMode from './IOS_WF/WFEncodeMode'
import WFFlashlightSetting from './IOS_WF/WFFlashlightSetting'
import WFFrequency from './IOS_WF/WFFrequency'
import WFGetDictionaryValueType from './IOS_WF/WFGetDictionaryValueType'
import WFHashType from './IOS_WF/WFHashType'
import WFHTTPBodyType from './IOS_WF/WFHTTPBodyType'
import WFHTTPMethod from './IOS_WF/WFHTTPMethod'
import WFInputType from './IOS_WF/WFInputType'
import WFIPAddressSourceOption from './IOS_WF/WFIPAddressSourceOption'
import WFIPAddressTypeOption from './IOS_WF/WFIPAddressTypeOption'
import WFMapsApps from './IOS_WF/WFMapsApps'
import WFMathOperation from './IOS_WF/WFMathOperation'
import WFNetworkDetailsNetwork from './IOS_WF/WFNetworkDetailsNetwork'
import WFRelativeDateFormatStyle from './IOS_WF/WFRelativeDateFormatStyle'
import WFScientificMathOperation from './IOS_WF/WFScientificMathOperation'
import WFSerialization from './IOS_WF/WFSerialization'
import WFSkipBackBehavior from './IOS_WF/WFSkipBackBehavior'
import WFStatisticsOperation from './IOS_WF/WFStatisticsOperation'
import WFTimeFormatStyle from './IOS_WF/WFTimeFormatStyle'
import WFTimeUntilReferenceDate from './IOS_WF/WFTimeUntilReferenceDate'
import WFTimeUntilUnit from './IOS_WF/WFTimeUntilUnit'

interface ActionParameters {
  // TODO 即将废弃
  template?: string
  compliedTemplate?: string
  outputTemplate?: string
  GMAIL_EMAIL_CONTEXT?: string
  GMAIL_DRAFT_CONTEXT?: string
  LAST_ACTION_OUTPUT?: string
  LAST_AI_OUTPUT?: string
  USER_INPUT?: string
  SELECTED_TEXT?: string
  SELECTED_HTML?: string
  CURRENT_WEBSITE_DOMAIN?: string
  CURRENT_WEBPAGE_URL?: string
  CURRENT_WEBPAGE_TITLE?: string
  AI_RESPONSE_LANGUAGE?: string
  AI_RESPONSE_TONE?: string
  AI_RESPONSE_WRITING_STYLE?: string
  ACTION_OUTPUT?: string
  AUTO_LANGUAGE_NAME?: string
  VARIABLE_MODAL_KEY?: 'Sidebar' | 'SidebarRewrite'
  // TODO 需要实现
  // 用于处理suggestion的AI model
  MAXAI_SUGGESTION_AI_MODEL?: string
  Advanced?: boolean
  AssertionType?: AssertionType
  CustomOutputName?: string
  Enabled?: boolean
  Event?: WFSerialization | string
  GroupingIdentifier?: string
  InstagramCaption?: string
  OnValue?: boolean
  PythonistaScript?: WFSerialization | string
  ShowHeaders?: boolean
  Text?: WFSerialization | string
  Time?: string
  UUID?: string
  WFAlertActionCancelButtonShown?: boolean
  WFAlertActionMessage?: WFSerialization | string
  WFAlertActionTitle?: WFSerialization | string
  WFAppIdentifier?: string
  WFArchiveFormat?: WFArchiveFormat
  WFAskActionDateGranularity?: WFAskActionDateGranularity
  WFAskActionDefaultAnswer?: WFSerialization | string
  WFAskActionPrompt?: WFSerialization | string
  WFBase64LineBreakMode?: WFSerialization | WFBase64LineBreakMode
  WFBrightness?: number
  WFCaseType?: WFSerialization | string
  WFCommentActionText?: string
  WFCondition?: WFCondition
  WFConditionalActionString?: string
  WFConditionalIfTrueActions?: ISetActionsType
  WFConditionalIfFalseActions?: ISetActionsType
  WFControlFlowMode?: number
  WFCountType?: WFCountType
  DateActionDate?: WFSerialization | string
  DateActionMode?: WFSerialization | WFDateActionMode
  DateFormat?: WFSerialization | string
  DateFormatStyle?: WFSerialization | WFDateFormatStyle
  WFDelayTime?: number
  WFDeviceDetail?: WFSerialization | WFDeviceDetail
  WFDictionaryKey?: string
  WFDictionaryValue?: string
  WFDontIncludeFileExtension?: boolean
  WFEncodeMode?: WFEncodeMode
  WFFaceTimeType?: WFSerialization | FaceTimeType
  WFFlashlightSetting?: WFFlashlightSetting
  WFFrequency?: WFFrequency[]
  WFFormValues?: WFSerialization
  WFGetDictionaryValueType?: WFGetDictionaryValueType
  WFGetLatestPhotoCount?: number
  WFHashType?: WFSerialization | WFHashType
  WFHomeName?: WFSerialization | string
  WFHomeSceneName?: WFSerialization | string
  WFHTTPBodyType?: WFHTTPBodyType
  WFHTTPHeaders?: WFSerialization
  WFHTTPMethod?: WFHTTPMethod
  WFInputType?: WFInputType
  WFIPAddressSourceOption?: WFIPAddressSourceOption
  WFIPAddressTypeOption?: WFIPAddressTypeOption
  WFISO8601IncludeTime?: WFSerialization | boolean
  WFItems?: WFSerialization | string[]
  WFJavaScript?: WFSerialization | string
  WFJSONValues?: WFSerialization
  WFLabel?: WFSerialization | string
  // 区分大小写
  WFMatchTextCaseSensitive?: boolean
  WFMatchTextPattern?: WFSerialization | string
  WFMathOperand?: number
  WFMathOperation?: WFMathOperation
  WFMenuItems?: string[]
  WFMenuItemTitle?: string
  WFMenuPrompt?: string
  WFName?: string
  WFNetworkDetailsNetwork?: WFNetworkDetailsNetwork
  WFNotificationActionBody?: string
  WFNotificationActionSound?: boolean
  WFNotificationActionTitle?: string
  WFNumberActionNumber?: number
  WFNumberValue?: number
  WFRandomNumberMaximum?: WFSerialization | number
  WFRandomNumberMinimum?: WFSerialization | number
  WFRepeatCount?: WFSerialization | number
  WFRelativeDateFormatStyle?: WFSerialization | WFRelativeDateFormatStyle
  WFScientificMathOperand?: number
  WFScientificMathOperation?: WFScientificMathOperation
  WFSearchMapsActionApp?: WFMapsApps | string
  WFShowWorkflow?: boolean
  WFSSHHost?: WFSerialization | string
  WFSSHPassword?: WFSerialization | string
  WFSSHPort?: WFSerialization | string
  WFSSHScript?: WFSerialization | string
  WFSSHUser?: WFSerialization | string
  WFSkipBackBehavior?: WFSkipBackBehavior
  WFSpeakTextLanguage?: string
  WFSpeakTextPitch?: number
  WFSpeakTextRate?: number
  WFSpeakTextVoice?: string
  WFSpeakTextWait?: boolean
  WFStatisticsOperation?: WFSerialization | WFStatisticsOperation
  WFText?: WFSerialization | string
  WFTextActionText?: WFSerialization | string
  WFTime?: WFSerialization | string
  WFTimeFormatStyle?: WFSerialization | WFTimeFormatStyle
  WFTimeUntilCustomDate?: WFSerialization | string
  WFTimeUntilReferenceDate?: WFTimeUntilReferenceDate
  WFTimeUntilUnit?: WFSerialization | WFTimeUntilUnit
  URLActionURL?: string | 'current_page'
  URLActionActiveTab?: boolean
  URLSearchEngine?: URLSearchEngine | string
  URLSearchEngineParams?: {
    [key in string]: string
  }
  Variable?: IShortCutsParameter | string
  VariableName?: string
  VariableLabel?: string
  VariableMap?: {
    [key in string]: string | number | boolean | IShortCutsParameter | undefined
  }
  WFVolume?: number
  WFWorkflowName?: string
  WFZIPName?: WFSerialization | string
  // Extra
  SummarizeActionType?: SummarizeActionType | string
  SliceTextActionLength?: number
  SliceTextActionTokens?: number
  SliceTextActionType?: SliceTextActionType | string
  AskChatGPTActionType?: AskChatGPTActionType
  AskChatGPTActionQuestion?: IAskChatGPTActionQuestionType
  // 设置AskChatGPTAction输出的内容，输出ai response还是整个message对象
  AskChatGPTActionOutput?: 'text' | 'message'
  // 是否受到用户设置的AI response language的影响
  isEnabledDetectAIResponseLanguage?: boolean
  // Operation Element
  OperationElementSelector?: string
  OperationElementTabID?: number
  OperationElementConfig?: OperationElementConfigType
  AnalyzeChatFileName?: string
  AnalyzeChatFileImmediateUpdateConversation?: boolean
  // 客户端systemPrompt的tokens上限, 如果超过这个阈值，就说明要上传到后端用docId来chat_with_document
  AnalyzeChatFileSystemPromptTokenLimit?: number
  // set variable modal
  SetVariablesModalConfig?: ActionSetVariablesModalConfig
  CreateWebsiteContextConfig?: Partial<IWebsiteContext>
  // 处理文本
  ActionTextHandleParameters?: ITextHandlerParameters
  // contextWindow是否需要携带history
  ActionFetchActionsWithHistory?: boolean
  // 消息
  ActionChatMessageType?: IChatMessage['type']
  ActionChatMessageOperationType?: 'add' | 'update' | 'delete' | 'replace'
  ActionChatMessageConfig?: IChatMessage
  // 是否需要Action产生的变量进行MiddleOut:GET_EMAIL_CONTENTS_OF_WEBPAGE\GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE
  isVariableMiddleOutEnabled?: boolean
  SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS?: ICommentData[] | undefined
  // 后端调用Action需要的参数
  MaxAIPromptActionConfig?: MaxAIPromptActionConfig
  // 创建上传document需要的参数
  MaxAIDocumentActionConfig?: MaxAIDocumentActionConfig
  // dictionary
  ActionDictionary?: Record<string, any>
  ActionGetDictionaryKey?: 'value' | 'allKeys' | 'allValues'
  ActionGetDictionaryValue?: string
  ActionSetDictionaryKey?: string
  ActionSetDictionaryValue?: any
  // list
  ActionGetItemFromListType?:
    | 'first'
    | 'last'
    | 'random'
    | 'index'
    | 'range'
    | 'matchEqual'
    | 'matchContains'
  ActionGetItemFromListIndex?: number
  ActionGetItemFromListRangeStart?: number
  ActionGetItemFromListRangeEnd?: number
  ActionGetItemFromMatchKey?: string
  ActionGetItemFromMatchValue?: any
  // repeat
  ActionRepeatWithEachActions?: ISetActionsType
  // repeat with each concurrent limit - 最大并发数默认为1
  ActionRepeatWithEachConcurrentLimit?: number
  ActionRepeatCount?: number
  isCopilot?: boolean
}

export default ActionParameters
