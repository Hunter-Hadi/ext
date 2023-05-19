# ShortCuts

## 参考
- https://zachary7829.github.io/blog/shortcuts/fileformat.html
- https://github.com/sebj/iOS-Shortcuts-Reference/blob/main/README.md
- https://support.apple.com/it-it/guide/shortcuts/welcome/ios
- https://github.com/joshfarrant/shortcuts-js

## Action ios 示例
```
<dict>
    <key>WFWorkflowActionIdentifier</key>
    <string>is.workflow.actions.gettext</string>
    <key>WFWorkflowActionParameters</key>
    <dict>
        <key>WFTextActionText</key>
        <dict>
            <key>Value</key>
            <dict>
                <key>attachmentsByRange</key>
                <dict>
                    <key>{15, 1}</key>
                    <dict>
                        <key>Aggrandizements</key>
                        <array/>
                        <key>Type</key>
                        <string>ExtensionInput</string>
                    </dict>
                </dict>
                <key>string</key>
                <string>Shortcut Input (INVISIBLE CHARACTER)</string>
            </dict>
            <key>WFSerializationType</key>
            <string>WFTextTokenString</string>
        </dict>
    </dict>
</dict>
```
### 计算器
```json
{
  "WFWorkflowClientVersion": "724",
  "WFWorkflowClientRelease": "2.1",
  "WFWorkflowIcon": {
    "WFWorkflowIconStartColor": 4274264319,
    "WFWorkflowIconGlyphNumber": 59446
  },
  "WFWorkflowImportQuestions": [],
  "WFWorkflowTypes": [
    "WatchKit",
    "NCWidget"
  ],
  "WFWorkflowInputContentItemClasses": [
    "WFAppStoreAppContentItem",
    "WFArticleContentItem",
    "WFContactContentItem",
    "WFDateContentItem",
    "WFEmailAddressContentItem",
    "WFGenericFileContentItem",
    "WFImageContentItem",
    "WFiTunesProductContentItem",
    "WFLocationContentItem",
    "WFDCMapsLinkContentItem",
    "WFAVAssetContentItem",
    "WFPDFContentItem",
    "WFPhoneNumberContentItem",
    "WFRichTextContentItem",
    "WFSafariWebPageContentItem",
    "WFStringContentItem",
    "WFURLContentItem"
  ],
  "WFWorkflowActions": [
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.comment",
      "WFWorkflowActionParameters": {
        "WFCommentActionText": "Hello, world!"
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.number",
      "WFWorkflowActionParameters": {
        "WFNumberActionNumber": 42
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.math",
      "WFWorkflowActionParameters": {
        "WFMathOperand": 3,
        "WFMathOperation": "÷",
        "UUID": "3eb9c27b-3f55-49a8-bc20-22e21660f6b9"
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.showresult",
      "WFWorkflowActionParameters": {
        "Text": {
          "WFSerializationType": "WFTextTokenString",
          "Value": {
            "string": "Total is ￼!",
            "attachmentsByRange": {
              "{9, 1}": {
                "OutputUUID": "3eb9c27b-3f55-49a8-bc20-22e21660f6b9",
                "Type": "ActionOutput"
              }
            }
          }
        }
      }
    }
  ]
}

```

### 电池电量检测器，条件动作

```json
{
  "WFWorkflowClientVersion": "724",
  "WFWorkflowClientRelease": "2.1",
  "WFWorkflowIcon": {
    "WFWorkflowIconStartColor": 4274264319,
    "WFWorkflowIconGlyphNumber": 59446
  },
  "WFWorkflowImportQuestions": [],
  "WFWorkflowTypes": [
    "WatchKit",
    "NCWidget"
  ],
  "WFWorkflowInputContentItemClasses": [
    "WFAppStoreAppContentItem",
    "WFArticleContentItem",
    "WFContactContentItem",
    "WFDateContentItem",
    "WFEmailAddressContentItem",
    "WFGenericFileContentItem",
    "WFImageContentItem",
    "WFiTunesProductContentItem",
    "WFLocationContentItem",
    "WFDCMapsLinkContentItem",
    "WFAVAssetContentItem",
    "WFPDFContentItem",
    "WFPhoneNumberContentItem",
    "WFRichTextContentItem",
    "WFSafariWebPageContentItem",
    "WFStringContentItem",
    "WFURLContentItem"
  ],
  "WFWorkflowActions": [
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.getbatterylevel",
      "WFWorkflowActionParameters": {
        "UUID": "21c2b4f0-4241-491d-82d7-2716ca983b9e"
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
      "WFWorkflowActionParameters": {
        "GroupingIdentifier": "b2943a7b-3fac-4758-86e1-87a3ab70d3c4",
        "WFControlFlowMode": 0,
        "WFCondition": "Is Less Than",
        "WFNumberValue": 20
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.lowpowermode.set",
      "WFWorkflowActionParameters": {
        "OnValue": true
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.showresult",
      "WFWorkflowActionParameters": {
        "Text": {
          "WFSerializationType": "WFTextTokenString",
          "Value": {
            "string": "Your battery is at ￼%, you might want to charge it.",
            "attachmentsByRange": {
              "{19, 1}": {
                "OutputUUID": "21c2b4f0-4241-491d-82d7-2716ca983b9e",
                "Type": "ActionOutput"
              }
            }
          }
        }
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
      "WFWorkflowActionParameters": {
        "GroupingIdentifier": "b2943a7b-3fac-4758-86e1-87a3ab70d3c4",
        "WFControlFlowMode": 1
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.showresult",
      "WFWorkflowActionParameters": {
        "Text": {
          "WFSerializationType": "WFTextTokenString",
          "Value": {
            "string": "Your battery is at ￼%, you're probably fine for now.",
            "attachmentsByRange": {
              "{19, 1}": {
                "OutputUUID": "21c2b4f0-4241-491d-82d7-2716ca983b9e",
                "Type": "ActionOutput"
              }
            }
          }
        }
      }
    },
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
      "WFWorkflowActionParameters": {
        "GroupingIdentifier": "b2943a7b-3fac-4758-86e1-87a3ab70d3c4",
        "WFControlFlowMode": 2
      }
    }
  ]
}

```
