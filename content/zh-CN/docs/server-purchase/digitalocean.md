---
id: digitalocean
title: 使用 DigitalOcean 设置 CapRover
sidebar_label: DigitalOcean
---


如果这是你第一次设置服务器，DigitalOcean 可能是最简单的方案。另外，你可以使用这个链接获得 $100 credit！
https://m.do.co/c/6410aa23d3f3

DigitalOcean 把他们的服务器称为 “Droplets”。注册后，进入 Droplets 区域并点击 “Create Droplet”。在 choose an image 下，点击 One-Click Apps，然后选择 Docker。这样，Docker 会随服务器预装。如果你有 SSH key，请在这个 Droplet Create 页面底部输入你的 SSH key；如果没有，也不用担心，它只是密码的替代方式。Droplet 创建后，你会收到一封邮件，里面包含服务器的 IP address、user 和 pass。如果你知道如何 SSH，那很好，直接 SSH 到服务器即可。如果不知道，也不用担心！DigitalOcean 对新手非常友好。只需进入你的 DigitalOcean account 中的 Droplets 区域，点击刚创建的 Droplet。从左侧菜单选择 ACCESS 并启动 console。要求 login 时输入 `root`，然后输入邮件中收到的密码。如果没有在邮件中收到密码，点击 Launch Console 按钮下方的 Reset Root Password。注意，你必须手动输入很长的密码。DigitalOcean 提供的 web interface 不支持 Copy/Paste ctrl+c ctrl+v。

此时你已经登录到服务器，可以按照 Getting Started section 中的说明运行 captain installer。
