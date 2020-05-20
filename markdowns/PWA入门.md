# 概念

PWA 是渐进式应用的缩写，全称为：Progressvie web apps。
它是致力于现代应用和增强传统应用的一种解决方案，它具有以下几个优势：

1. 可观察
2. 可安装
3. 独立于网络
4. 渐进式增强
5. 可重新接替
6. 响应式
7. 安全

## 收益

- 它会减少第二次打开的时间，节省了宽带时间
- 可放在屏幕上，微小的改动也可以直接更新应用
- 可以使用通知等功能增加用户体验

# 离线和缓存

在浏览器中注册代码如下：

```js
// main.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

由上面的代码可知，浏览器的`serviceWorker`注册了一个`sw`文件，也就是`serviceWorker`文件。

而`serviceWorker`文件则是处理离线状态的文件：

```js
// sw.js
self.addEventListener('install', (event) => {
  if (!event) return;
  event.waitUnitl(
    caches.open('cache').then((cache) => cahce.add('/cache.html'))
  );
});
self.addEventListener('fetch', (event) => {
  event.responseWith(
    fetch(event.request).catch((cache) => caches.match('/cache.html'))
  );
});
```

观察上面的代码可以看出，service worker 监听了一个 install 事件。

```diff
self.addEventListener('install', (event) => {
  if (!event) return;
  event.waitUnitl(
+    caches.open('cache').then((cache) => cahce.add('/cache.html'))
  );
});
```

然后它又调用了一个 caches 的 API，是指从哪个版本取出缓存，而`add`就是缓存目标了。

其中`cache.html`的代码是：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    Cache page
  </body>
</html>
```

当然，为了添加离线的功能，我们该需要`script`和`stylesheet`的支持。

如果我们写的代码是这样子的：

```css
/* style.css */
.body {
  background-color: red;
  height: 100%;
  width: 100%;
}
```

然后引用到 HTML 文件中：

```diff
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <link rel="stylesheet" href="/style.css" />
    <title>Document</title>
  </head>
  <body>
    Cache page
  </body>
</html>
```

屏幕上就会出现这样红色背景，则代表成功。

## 后台同步

PWA 有一个特别厉害的功能就是，后台数据同步，而这个需要在`main.js`注册：

```js
// main.js
navigator.serviceWorker.ready.then((registeration) => {
  registeration.sync.reigster('sync');
});
```

这样就注册了一个同步信息，然后在 serviceWorker 中接受它：

```js
self.addEventListener('sync', (event) => {
  console.log(event.tag);
});
```

这样，就可以接受后台所传过来的数据了。

## 页面通信

### 监听事件通信

我们可以在多个页面之间进行通信，其用法是：

```js
// main.js
navigator.serviceWorker.addEventListener('message', () => {
  navigator.serviceWorker.client.postMessage('ok');
});
```

接着就可以直接在`sw.js`中直接接收到：

```js
self.addEventListener('message', (event) => {
  console.log(event.data); // ok
});
```

### 使用 MessageChannel 进行通信

直接使用一个事件管道进行通信：

```js
const messageChannel = new MessageChannel();
navigator.serviceWorker.postMessage({ data: 1 }, [messageChannel.port2]);
```

这样就完成了一次消息通道的通信了。

然后在`sw.js`中接受它：

```js
self.addEventListener('message', (event) => {
  console.log(event.data);
});
```

当然，这个还没有发挥出真正的威力。在`sw.js`中添加如下：

```diff
self.addEventListener('message', (event) => {
  console.log(event.data);
+  event.ports[0].postMessage("1");
});
```

这样，就可以直接发送到`main.js`中了，这是子父通信机制：

```diff
const messageChannel = new MessageChannel();
navigator.serviceWorker.postMessage({ data: 1 }, [messageChannel.port2]);
messageChannel.onmessage = (event) =>{
+  console.log(event.data);
}
```

这样`main.js`就可接收到来自`serviceWorker`的数据了。

### 使用`IndexedDB`

IndexedDB 是一种数据库，用于存储数据结构的一种数据库。

- 打开数据库

```js
const request = window.indexedDB('user', 2);
request.onsuccess = (event) => {
  console.log(event);
};
request.onerror = (event) => {
  console.log(event);
};
```

这样就成功开启了一个`indexedDB`了，接着新建一个数据库。

```js
request.onupgradeneeded = function (event) {
  db = event.target.result;
  const objectStore = db.createObjectStore('person', { keyPath: 'id' });
};
```

然后写入一个数据：

```js
const request = db
  .transaction(['person'], 'readwrite')
  .objectStore('person')
  .add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' });
```

查看数据:

```js
const transaction = db.transaction(['person']);
const objectStore = transaction.objectStore('person');
const request = objectStore.get(1);
request.onsuccess = (event) => {
  console.log(event.result);
};
```

更新数据：

```js
const request = db
  .transaction(['person'], 'readwrite')
  .objectStore('person')
  .put({ id: 1, name: '李四', age: 35, email: 'lisi@example.com' });
```


