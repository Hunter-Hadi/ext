# MaxAI Chrome Extension
> MaxAI 浏览器插件

## 项目结构

```
├── build                        // 构建脚本
├── dist                         // 构建内容
├── releases                     // 可发布的压缩包
├── src                          // 项目代码，多项目的话是公共代码
│    ├── assets                 // 公共资源
│    ├── background             // background进程的代码 
│    ├── components             // 公共组件
│    ├── constants              // 公共常量
│    ├── features               // 业务模块，模块下的目录结构和src一致
│    │    ├── module1           // 模块1
│    │    └── module2           // 模块1 
│    ├── hooks                  // 公共hook
│    ├── i18n                   // 国际化
│    ├── lib                    // 第三方依赖
│    ├── minimum                // 页面上侧边栏按钮
│    ├── pages                  // 页面文件
│    ├── rules                  // 页面文件
│    ├── stores                 // 全局共享状态
│    ├── styles                 // 样式
│    ├── utils                  // 公共方法
│    ├── background.ts          // background入口文件
│    ├── check_status.ts        // 登录状态检测以及和web app通信
│    ├── content.tsx            // content入口文件
│    ├── manifest.json          // 插件配置文件
├── README.md                   // 项目说明
└── package.json
```

## 运行项目

统一用pnpm/nvm

1. 在.zshrc中加入以下代码
```shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# place this after nvm initialization!
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

2. 运行
```shell
source ~/.zshrc
```

3. 回到项目文件夹
```shell
pnpm install
```
```shell
pnpm run dev
```

4. 到chrome浏览器扩展设置里将dist文件夹拖入

## 构建项目

```shell
pnpm run release
```

## 发布项目

1. 修改src/manifest.json里的插件版本
2. 项目构建完成后将releases/MaxAI[production]-x.x.x.zip发到群里测试
3. 测试通过无误后@发布人员验收发布
4. 发布完成后合并到prod分支并修改package.json的版本添加release: x.x.x的commit

## 注意事项

1. 需要添加插件新的权限时要确认该权限是否是敏感权限
   > 如果为敏感权限需要调研有无其他可替代的方案
   > https://developer.chrome.com/docs/extensions/reference/permissions-list
2. 确保每次content_scripts运行脚本运行时不要频繁请求maxai api
   > 如需必要，可以缓存某些接口数据，设置一个缓存时间。
   > 避免安装插件的用户每次打开新的tab请求maxai api造成服务端压力
