---
id: deployment-methods
title: 部署方式
sidebar_label: 部署方式
---

<br/>
`captain-definition` 文件会告诉 CapRover 如何构建源代码或要部署哪个镜像。源代码归档和仓库部署需要此文件。CLI 也可以使用 `caprover deploy --imageName IMAGE` 直接部署预构建镜像。可用的源代码和镜像格式请参阅 [Captain Definition](captain-definition-file.md)。

## 通过 CLI 部署
在 Git 仓库中运行 `caprover deploy` 并按照提示操作。CLI 会持续显示上传、构建和部署进度。控制面板和自动部署日志中也可以查看构建输出。更多信息请阅读：
[开始使用 - 第 5 步](get-started.md#第-5-步部署测试应用)。

## 通过 Web 控制面板部署
将项目内容转换为 tarball（`.tar`），进入 Captain Web 控制面板并上传 tar 文件。这种部署方式通常仅用于测试。

对于不需要源代码的 captain-definition 文件，例如[这个文件](captain-definition-file.md#使用镜像名称)，可以直接在 Web 控制面板中复制并粘贴 captain-definition 内容。

![deployapp](/img/docs/app-deploy.png)

## 一键回滚

假设你部署了应用的新版本，但发现它存在问题。你没有时间回退、更改代码或修复错误，这时该怎么办？很简单！只需前往部署标签页，点击想要回滚到的版本旁边的回退图标。CapRover 会自动重新构建并部署该版本！请注意，这**不会**回退你对环境变量及其他应用配置（例如持久化目录等）所做的更改。它只会回退镜像（已部署的源代码）。

## 使用 Github、Bitbucket 等自动部署

当你向已配置的分支推送代码时，此方法会自动使用 `captain-definition` 文件触发构建。要设置它，请打开应用设置并填写仓库信息：
- repo：仓库的主要 HTTPS 地址；对于 Github，格式为 `github.com/someone/something`。请确保不包含 `https://` 前缀和 `.git` 后缀。
- branch：要跟踪的分支，例如 `master`、`staging` 或 `release`……
- github/bitbucket username(email address)：Captain 下载仓库时使用的用户名。
- github/bitbucket password：对于公开项目，可以输入任意非空文本，例如 `123456`。
- 或者使用 SSH Key 代替用户名/密码：请确保使用 PEM 格式，因为其他格式可能无法工作。如不确定，请使用以下命令：
 ```
ssh-keygen -m PEM -t ed25519 -C "yourname@example.com" -f ./deploykey -q -N ""
```

输入这些信息后，保存配置并再次进入应用页面。现在会看到一个名为 webhook 的新字段。只需将此 webhook 复制到 Github/Bitbucket 仓库的 webhooks 中（见下文）。Captain 会监听此链接上的 POST 请求并触发构建。

#### Github
在这里创建 webhook：
- Project > Settings > Add Webhook > URL：应用页面中的 Captain Webhook；Content Type：`application/json`；
Secret：`<Leave empty>`，仅选择 `push` 事件。
此外，将生成的公钥内容添加到仓库的部署密钥中。

#### Bitbucket
可以在这里添加 Webhook：
- Project > Settings > Webhooks > Add Webhook > Title：Captain Server；URL：应用页面中的 Captain Webhook。

#### GitLab 和其他平台
可以用类似方式添加 Webhook。只要 webhook 发出 POST 请求，CapRover 就能接收它，并从指定分支的最新 commit 开始构建。
