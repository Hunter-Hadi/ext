import AssertionType from './AssertionType'
import FaceTimeType from './FaceTimeType'
import WFArchiveFormat from './WFArchiveFormat'
import WFAskActionDateGranularity from './WFAskActionDateGranularity'
import WFBase64LineBreakMode from './WFBase64LineBreakMode'
import WFCondition from './WFCondition'
import WFCountType from './WFCountType'
import WFDateActionMode from './WFDateActionMode'
import WFDateFormatStyle from './WFDateFormatStyle'
import WFDeviceDetail from './WFDeviceDetail'
import WFEncodeMode from './WFEncodeMode'
import WFFlashlightSetting from './WFFlashlightSetting'
import WFFrequency from './WFFrequency'
import WFGetDictionaryValueType from './WFGetDictionaryValueType'
import WFHashType from './WFHashType'
import WFHTTPBodyType from './WFHTTPBodyType'
import WFHTTPMethod from './WFHTTPMethod'
import WFInputType from './WFInputType'
import WFIPAddressSourceOption from './WFIPAddressSourceOption'
import WFIPAddressTypeOption from './WFIPAddressTypeOption'
import WFMapsApps from './WFMapsApps'
import WFMathOperation from './WFMathOperation'
import WFNetworkDetailsNetwork from './WFNetworkDetailsNetwork'
import WFRelativeDateFormatStyle from './WFRelativeDateFormatStyle'
import WFScientificMathOperation from './WFScientificMathOperation'
import WFSerialization from './WFSerialization'
import WFSkipBackBehavior from './WFSkipBackBehavior'
import WFStatisticsOperation from './WFStatisticsOperation'
import WFTimeFormatStyle from './WFTimeFormatStyle'
import WFTimeUntilReferenceDate from './WFTimeUntilReferenceDate'
import WFTimeUntilUnit from './WFTimeUntilUnit'

interface WFWorkflowActionParameters {
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
  WFControlFlowMode?: number
  WFCountType?: WFCountType
  WFDateActionDate?: WFSerialization | string
  WFDateActionMode?: WFSerialization | WFDateActionMode
  WFDateFormat?: WFSerialization | string
  WFDateFormatStyle?: WFSerialization | WFDateFormatStyle
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
  WFURLActionURL?: string
  WFVariable?: WFSerialization | string
  WFVariableName?: string
  WFVolume?: number
  WFWorkflowName?: string
  WFZIPName?: WFSerialization | string
}

export default WFWorkflowActionParameters
