---
id: cli-commands
title: CLI 命令
sidebar_label: CLI 命令
---

<br/>

可以使用此 CLI 工具部署应用。首先使用 npm 安装 CLI 工具：
```
npm install -g caprover
```

### 服务器设置

首先需要设置 Captain 服务器。可以在浏览器中访问 `HTTP://IP_ADDRESS_OF_SERVER:3000` 完成设置，也可以使用推荐的命令行工具。只需运行：
```
caprover serversetup
```

按照提示操作，输入服务器 IP 地址，并输入此 Captain 实例要使用的根域名。如果不知道 Captain 根域名是什么，请访问 www.caprover.com 查看文档。这是非常关键的一步。之后，系统会要求输入电子邮件地址。该地址必须有效，因为它会用于 SSL 证书。启用 HTTPS 后，系统会要求你修改密码。然后……就完成了！请转到下面的“部署”部分，进一步了解应用部署。


### 登录

*如果你已经通过命令行完成“服务器设置”流程，可以跳过“登录”步骤，因为“服务器设置”会在最后一步自动登录。*

首先需要登录 Captain 服务器。此时建议你已经设置好 HTTPS。不建议通过不安全的纯 HTTP 登录。

要登录服务器，只需运行以下命令并回答问题。

```bash
caprover login
```

如果操作成功完成，系统会显示成功消息。

注意：可以同时登录多个 Captain 服务器。当你有独立的预发布和生产服务器时，这尤其有用。

### 部署

要部署应用，首先需要创建一个 captain-definition 文件，并将其放在项目文件夹的根目录中。对于 Node.js 应用，该文件应与 package.json 位于同一目录。

Node.js 应用的简单 captain-definition 文件如下：

```
 {
  "schemaVersion": 2,
  "templateId": "node/24"
 }
```

有关 Captain Definition 文件的更多详情，请参阅 [Captain Definition File](captain-definition-file.md)。

确认该文件存在后，运行以下命令并回答提示中的问题：

```bash
caprover deploy
```

随后会看到应用上传，然后进行构建。请注意，构建过程可能需要几分钟，请耐心等待！

若要使用当前目录之前输入过的值而不再重复询问，请使用 `-d` 选项：

```bash
caprover deploy -d
```

也可以使用无状态模式，将 CapRover 服务器信息直接写在命令中：
```bash
caprover deploy -u https://captain.root.domain.com -p password -b branchName -a app-name
```

如果希望集成 CI/CD 流水线，这会很有用。

#### 选项：
可用参数如下：
- `-d, --default`：使用当前目录之前输入过的值。其他选项不会生效。
- `-c, --configFile <file>`：指定用于部署设置的配置文件。
- `-u, --caproverUrl <url>`：设置要执行部署的 CapRover 机器 URL。该 URL 通常采用 [http[s]://][captain.].your-captain-root.domain 格式。
- `-p, --caproverPassword <password>`：CapRover 机器的密码。提供 URL 且未使用应用令牌时，会提示输入此选项。
- `-n, --caproverName <name>`：要部署到的 CapRover 机器名称。可以从已登录机器列表中选择。
- `-a, --caproverApp <app>`：指定要部署到 CapRover 机器上的应用名称。可以从机器上的可用应用列表中选择。
- `-b, --branch <branch>`：指定要部署的 Git 分支。请注意，未提交的文件和被 Git 忽略的文件不会包含在内。
- `-t, --tarFile <tarFile>`：指定 tar 文件路径，该文件必须包含 captain-definition 文件才能部署。
- `-i, --imageName <image>`：指定要部署的 Docker 镜像。该镜像必须已存在于服务器上，或位于 CapRover 可以访问的公共或私有仓库中。
- `--appToken <token>`：可选的应用级身份验证令牌（如有需要）。


### 列出已登录的服务器

要查看当前已登录的服务器列表，请运行：

```bash
caprover list
```

### 登出

运行以下命令：

```bash
caprover logout
```
