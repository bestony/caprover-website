---
id: play-with-docker
title: 体验 CapRover
sidebar_label: 体验 CapRover
---

<br/>

## 只读 Demo

如果你只想查看只读 demo，请前往 [home page](https://caprover.com/) 并点击 **Live Demo**

<br/>

## 可操作 Demo

如果你想创建一个可操作的 CapRover 实例，可以使用 Play-with-Docker 网站。这个网站允许你在几秒钟内创建 Virtual Servers，并在其上安装 Docker images。这是体验 CapRover 的最佳 playground。


![](/img/pwd-caprover.gif)


按以下步骤操作：
- 确保你有 [Docker Hub](https://hub.docker.com/) 账号。如果没有，创建一个，它是 100% 免费的。
- 前往 [play-with-docker.com](http://play-with-docker.com/)
- 点击 Start，并使用你的 Docker Hub username/password 登录
- session 启动后，你会看到一个带 timer 的页面
- 你可以点击左侧菜单栏中的 **+ADD NEW INSTANCE** 来创建一个 Virtual Server
- 服务器创建完成后，复制并粘贴这个命令：
```bash
 curl -L https://pwd.caprover.com | bash
```

- 安装过程大约需要 2 分钟，并且完全自动化。
- 安装过程结束后，你会看到类似这样的消息：
```
===================================
===================================
 **** Installation is done! *****  
CapRover is available at http://captain.ip123456789123456.direct.labs.play-with-docker.com
Default password is: captain42
===================================
===================================
```

只需复制 URL，并使用 `captain42` 作为密码登录 CapRover！

**重要：** 你无法使用 play-with-docker 启用 https，但其他功能应该可以正常工作。
