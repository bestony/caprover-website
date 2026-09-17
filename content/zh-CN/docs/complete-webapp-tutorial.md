---
id: complete-webapp-tutorial
title: 完整 Web 应用教程
sidebar_label: 完整 Web 应用教程
---


<br/>

这是一个简短的通用教程，帮助你了解如何设计包含多个组件的应用。

假设我们想制作 [HOTDOG or NOT HOTDOG](https://www.theverge.com/2017/6/26/15876006/hot-dog-app-android-silicon-valley) 的 Web 应用版本！



## 应用描述
假设我们要创建一个 Web 应用，显示照片列表，并用一行文字说明图片是热狗还是不是热狗，例如：

- `<IMAGE>` 标签：Hotdog，上传日期：2017-11-12
- `<ANOTHER IMAGE>` 标签：NOT Hotdog，上传日期：2017-07-08
- `<ANOTHER IMAGE>` 标签：Hotdog，上传日期：2017-07-07
- ……

任何人都可以上传图片，我们非常智能的 Artificial Intelligence 会为图片添加 HOTDOG 或 NOT-HOTDOG 标签，然后将图片保存到服务器，同时将上传日期和标签保存到数据库中。

## 应用架构
要制作这个应用，假设我们决定使用以下组件：
- NodeJS WebApp：（包括静态资源、前端应用和 API）
- PHP Image Upload app：可以通过 POST 请求将照片保存到磁盘
- MongoDB：存储上传信息（标签、上传日期等）
- PYTHON An Image Recognition service：可以通过 POST 请求判断图片是否为 HOTDOG 或 NOT HOTDOG

```
                        +---------------------+
                        |                     |
                        |   NodeJS Webapp     |
                        |                     |
        +---------------+------------+--------+-----------------+
        |                            |                          |
        |                            |                          |
        |                            |                          |
        |                            |                          |
        |                            |                          |
+-------v-----------+     +----------v----------+   +-----------v---+
|                   |     |                     |   |               |
| PHP File Uploader |     | Python ImageDetector|   |    MongoDB    |
|                   |     |                     |   |               |
+-------------------+     +---------------------+   +---------------+

```

## 是否需要持久化
CapRover 允许你指定应用、数据库或服务是否包含持久化数据。具有持久化的应用可以配置“持久化目录”。如果应用崩溃并且 Captain 启动了该应用的新实例，这些目录会被保留。其他目录会被清除，并在应用崩溃且 Captain 启动新实例时恢复为默认状态。在我们的示例中：
- WebApp：**不需要**任何持久化。
- Image Upload App：需要一个用于将图片保存到磁盘的持久化目录（例如 `/uploaded_files`）。
- MongoDB：当然需要持久化（用于存储信息），我们不希望仅仅因为 MongoDB 崩溃或服务器重启就丢失数据库。
- PYTHON Image Recognition app：不需要在磁盘上保存数据。它只接收图片，执行图像处理，并告诉客户端图片是 HOTDOG 还是 NOT HOTDOG。

## 创建服务：
- NodeJS Web app：编写应用后，只需在 Captain 上创建一个 Web 应用并命名为 `my-webapp`，**不要**勾选持久化复选框，然后部署应用。
- Image Upload app：与上面介绍的 Web 应用类似，但创建应用时要勾选持久化复选框。将应用命名为 `image-uploader`。然后进入应用详情页并添加持久化目录，目录路径就是应用保存图片的位置。这取决于你的应用；在我们的示例中，假设路径为 `/uploaded_files`。
- MongoDB：使用一键应用安装程序创建 MongoDB 实例。将此容器命名为 `my-mongodb`。容器（数据库）创建后，可以进入详情页，会看到 Captain 已自动为该容器分配了一些持久化目录。这些目录就是 MongoDB 保存数据的位置。
- Python Image Recognition app：再次在 Captain 上创建一个新应用。由于该应用不在磁盘上保存任何信息，因此不需要设置持久化。将应用命名为 `image-processor`。


## 内部访问
Web 应用需要与 MongoDB、图片上传应用和图片处理应用通信。同一 CapRover 集群中的应用可以使用目标应用名称作为主机名。例如，在 Node.js 中连接名为 `my-mongodb` 的应用：
```
mongoose.connect("mongodb://my-mongodb/mydatabase");
```
当然，也可以在 URI 中添加用户名和密码，示例请参阅[这里](https://stackoverflow.com/questions/7486623/mongodb-password-with-in-it)。

其他服务也适用相同规则。例如，可以通过 `http://imageuploader` 访问图片上传应用。从 CapRover 1.15 之前版本升级的应用也可以使用旧的 `srv-captain--APP_NAME` 网络别名。
