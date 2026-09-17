---
id: pre-deploy-script
title: 预部署脚本
sidebar_label: 预部署脚本
---

<br/>
这是一个非常高级的操作，需要谨慎处理，否则可能导致应用部署失败。

当配置发生变化或部署应用导致容器（即应用）更新时，该脚本会在更新前立即运行。在此脚本中，你可以修改 Docker 服务对象、调用 HTTP 请求，实际上几乎可以执行任何操作。脚本模板如下：
```
var preDeployFunction = function (captainAppObj, dockerUpdateObject) {
	return Promise.resolve()
		.then(function(){

		    // Do something in a Promise form

		    // In the end, return the "possibly-modified" dockerUpdateObject
		    return dockerUpdateObject;
		});
};

```

请注意，`captainAppObj` 是保存在 `/captain/data/config-captain.json` 文件中的应用对象，`dockerUpdateObject` 是传递给 Docker 以更新服务的服务更新对象（环境变量、镜像版本等）。该对象遵循 [Docker 文档](https://docs.docker.com/engine/api/v1.30/#operation/ServiceUpdate)中的定义。

由于此脚本会在 CapRover 进程中执行，因此你可以访问 CapRover 所拥有的所有 Node 依赖项，参见 [Caprover/caprover/package.json](https://github.com/caprover/caprover/blob/master/package.json)。例如，以下脚本会在每次更新时，向服务标签注入一个映射到部署版本的 UUID：

```
var { v4: uuid } = require('uuid');

var preDeployFunction = function (captainAppObj, dockerUpdateObject) {
	return Promise.resolve()
		.then(function(){

		    dockerUpdateObject.TaskTemplate.ContainerSpec.Labels[uuid()] =
                                                         captainAppObj.deployedVersion+ '';
		    return dockerUpdateObject;
		});
};

```

请注意，这个预部署脚本，尤其是 Docker 服务更新对象，非常复杂。因此，强烈建议只有专家用户才使用此预部署方法。例如，请注意下面这行代码中为什么要给部署版本添加一个空字符串：

```
dockerUpdateObject.TaskTemplate.ContainerSpec.Labels[uuid()] = captainAppObj.deployedVersion+ '';
```

移除这个简单的处理方式会导致应用部署时报错。要查看日志，需要运行 `docker service logs captain-captain --follow`。即使是 Docker 返回的错误信息也不够清晰。总之，这是一个高级功能，不建议初学者和中级用户使用。
