---
id: best-practices
title: 最佳实践
sidebar_label: 最佳实践
---

CapRover 设计得易用且直观。话虽如此，仍有一些技巧可以帮助你更充分地使用 CapRover。

### 隐藏根域名

向潜在攻击者隐藏你的技术栈始终是一个好习惯。为了更加安全，你可以把根域名隐藏在 wildcard DNS 设置的更深两级。例如，在你的 DNS 面板中设置

```bash
A RECORD:

*.server.domain.com   >>>>   123.123.123.123
```

然后在设置 CapRover 时，不要输入 `server.domain.com`，而是输入 `something.server.domain.com`。这样，你可以通过 `captain.something.server.domain.com` 访问 dashboard，而不是 `captain.server.domain.com`。随后你可以在应用的 HTTP 设置中把应用域名设置为 `myapp.server.domain.com`，从而隐藏你的根域名。

请记住，这并不是能保护你免受一切攻击的盾牌。它只是一项安全措施，会让一些暴力破解攻击者更难攻击你的 CapRover 基础设施，甚至几乎不可行。

### 自定义默认密码

CapRover 使用 `captain42` 作为默认密码。通常这是安全的，因为服务器安装完成后，你可以立即在本地机器上运行 `caprover serversetup` 来修改密码。不过，这会留下大约 30 秒的小窗口，攻击者可能比你更早修改密码。这种情况极不可能发生，但理论上是可能的。攻击者需要知道某台特定机器上的精确攻击窗口。无论如何，为了降低这个风险，安装 CapRover 时只需在安装脚本中加入 `DEFAULT_PASSWORD` env var，选择一个自定义初始密码即可。例如，下面的脚本会把默认密码从 `captain42` 改为 `myinitialpassword`

```bash
docker run -e ACCEPTED_TERMS=true -e DEFAULT_PASSWORD='myinitialpassword' -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

### 强制 HTTPS

强烈建议你在最开始做的事情之一，就是为 CapRover dashboard 启用 HTTPS，并启用 "Enforce HTTPS"。完成这些之后，你应该修改密码。注意，如果你使用的是 `caprover serversetup` 向导，这个过程会自动完成，设置完成后无需再修改密码。

### 为 Git 使用服务账号

CapRover 最受欢迎的功能之一，是从源代码管理系统自动部署（GitHub、BitBucket、GitLab 等）。如果要让这种方式配合私有仓库工作，你必须输入用户名/密码，它们会以加密内容的形式保存在你的服务器上。更好的做法是在 GitHub 等平台上创建服务账号（bot 账号），并只授予该账号对特定仓库的特定权限（只读）。这样，即使该账号被攻破，你的主 owner 账号仍然不受影响，并且你可以把被攻破的账号从 repo 中移除。

### 构建时内存不足

当你在 Heroku 这类付费服务上构建时，构建过程会运行在 CPU 和 RAM 都比较高的机器上。使用 CapRover 时，构建会在同一台为你的应用提供服务的机器上完成。在应用不太大之前这不是问题；但如果应用变得太大，构建过程需要太多 RAM，就可能崩溃！示例见 [**这里**](https://github.com/caprover/caprover/issues/315)。有几种解决方案：

1- 给 web server 增加 swap space，[**这里**](https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-16-04) 有说明。

2- 在本地机器上构建。例如，针对 Create React App，[**这里**](recipe-deploy-create-react-app.md) 详细说明了这个过程。

3- 不过，**最佳解决方案** 是使用单独的构建系统。你可以查看 [**这里**](ci-cd-integration.md) 的指南。

### 为新应用自定义 NGINX 配置

已移动到 https://caprover.com/docs/nginx-customization.html#customize-and-override-the-nginx-config-for-all-apps

保留本节是为了避免链接失效。
