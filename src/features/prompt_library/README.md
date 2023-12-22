# MaxAI Prompt Library

## 注意事项

### 网页端

### 1. 初始化
```typescript jsx

 const {
    initPromptLibrary,
  } = usePromptLibrary()
 // 初始化一系列字段默认值
 // initPromptLibrary({
 //   activeTab?: IPromptListType
 //   query?: string
 //   category?: string
 //   use_case?: string
 //   page?: number
 //   page_size?: number
 //   total?: number
 // })
```
### 2. 配置CheckInstall的方法, 例如www.maxai.me在没安装插件的时候会有个弹窗

```typescript jsx
  const {
  checkMaxAIChromeExtensionInstall,
  setMaxAIChromeExtensionInstallHandler,
} = usePromptLibraryAuth();
  const { checkIsInstalled } = useRecoilValue(ChromeExtensionDetectorState);
  useEffect(() => {
    setMaxAIChromeExtensionInstallHandler(async () => {
      return checkIsInstalled();
    });
  }, [checkIsInstalled]);
```


### 2. 删除prompt library的 `<PromptLibraryCardEditForm />`

> features/prompt_library/components/PromptLibrary/index.tsx

### 3. 配置`usePromptLibraryAuth`，因为各个项目对于登陆的判断都不一样，需要配置登陆的状态取自于哪里和如果没登录的处理方法

> features/prompt_library/hooks/usePromptLibraryAuth
