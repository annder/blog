# 在 ubuntu 系统下安装并使用 Nginx

## 安装

打开终端，然后输入：

```bash
sudo apt-install nginx
```

## 启动、重启、停止

启动：

```bash
service nginx start
```

重启

```bash
service nginx reload
```

停止

```bash
service nginx stop
```

一般而言，在/var/www/html 这个文件夹内可以编写 nginx 的 html 文件。

有四个路径极为关键：

- /usr/sbin/nginx：主程序

- /etc/nginx：存放配置文件

- /usr/share/nginx：存放静态文件

- /var/log/nginx：存放日志

# 编写 Nginx 文件

## 设置静态 HTTP 服务器

设置静态 HTTP 服务器只需要在 http 模块下直接添加 server 即可。

```nginx
work_processes 1;

events {
  worker_connecitons 1024;
}

http {
  server / {
    root /var/html/www/ # 静态服务器文件目录
  }
}
```

##　设置反向代理与负载均衡

直接在它的基础上添加 proxy_pass 即可：

```diff
work_processes 1; # CUP核心数

events {
  worker_connecitons 1024;
}

http {
  server / {
-    root /var/html/www/ # 静态服务器文件目录
+    proxy_pass http://192.168.1.1
  }
}
```

上面的一个代理是远远不够的，如果一个代理的挂掉了之后，那么这个服务器就无法使用，进而挂掉 HTTP 服务器。

既然如此，我们可以使用多个代理来解决这个问题：

```diff
work_processes 1; # CUP核心数

events {
  worker_connecitons 1024;
}

http {
+  upstream proxys {
+    server 123.123.123.1
+    server 123.124.123.2
+  }
  server / {
-    proxy_pass http://192.168.1.1
+    proxy_pass http://proxys
  }
}
```

这样就完成了负载均衡的配置。

## 设置页面缓存

首先，如果设置页面缓存，需要从 nginx 的两个层面入手：`HTTP`和`Server`。

### HTTP

HTTP 层面考虑两个事情：`timeout`和`cache chuncks`.

#### timeout 代理超时

timeout 分为三种：连接时超时设置、连接前超时设置、连接后超时设置。

```diff
http {
+ proxy_connect_timeout 500;  # 连接时超时
+ proxy_read_timeout 500; # 连接前与服务器端连接的超时设置
+ proxy_send_timeout 500; # 连接后与服务器端响应的设置
  server / {
    proxy_pass 192.168.1.1:200
  }
}
```

这样就完成了超时设置。

#### 设置缓存文件

使用`proxy_buffer_size`和`proxy_buffers`配置缓存区。

- proxy_buffer_size 是指代理缓存大小
- proxy_buffers 代理请求缓存区的块

添加到 http 模块中：

```diff
http {
 proxy_connect_timeout 500;  # 连接时超时
 proxy_read_timeout 500; # 连接前与服务器端连接的超时设置
 proxy_send_timeout 500; # 连接后与服务器端响应的设置
+ proxy_buffer_size 128k;
+ proxy_buffers 4 128k; # 4块，每128k划分为一块
}
```

指定缓存文件，以及开辟缓存文件路径：

```diff
http {
 proxy_connect_timeout 500;  # 连接时超时
 proxy_read_timeout 500; # 连接前与服务器端连接的超时设置
 proxy_send_timeout 500; # 连接后与服务器端响应的设置
 proxy_buffer_size 128k;
 proxy_buffers 4 128k; # 4块，每128k划分为一块
+  proxy_temp_path /path/to/temp;
+  proxy_cache_path /path/to/cache levels=1:2 keys_zone=cache_one:200m inactive=1d max_size=30g;
}
```

最后在`localtion`层面上设置 cache 的选项，这一步是主要设置缓存时间：

```nginx
localtion ~ \.html$ {
  proxy_cache cache_one;
  proxy_cache_valid 200 304 2m;
  proxy_cache_valid 301 302 1d;
  expires 30d;
}
```

- proxy_cache 是指代理缓存的名字
- proxy_cache_valid 是指代理缓存的设置时间，200,304 等是指 HTTP 状态码。而后面 2m 是指缓存 2 分钟。
- expires 是指其余缓存的设置

另外要注意的是，开启代理缓存发现无法访问静态文件。

为了解决这个问题，你可以用这样的方法来解决：

```nginx
location ~* \.(jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|css|js) {
  root /path/to/static;
}
```

## 开启 Gzip

开启 gzip，只需要开启在 http 层面开启`gzip on`：

```
http {
  gzip on;
}
```

### gzip_buffers gzip 压缩缓存

但是这样却有一个问题，如果并发高了的话，那么就会直接导致因为压缩文件时，CPU 的压力过高。

所以需要缓存这些`gzip`，如果没有设置的话，**会直接向内存申请 Gzip 的压缩结果。**

如果设置过后的话，它会以设置的数据大小的 4 倍单位，而进行申请内存。

所以设置缓存只需要写成这样子就可以：

```diff
http {
  gzip on;
+  gizp_buffers 4 4k;
}
```

### gzip_min_lenght 最小压缩长度

除了使用 buffer 做缓存以外，我们还可以规定文件的指定大小进行压缩。

```diff
http {
  gzip on;
  gizp_buffers 4 4k;
+ gzip_min_lenght 1k;
}
```

**建议大于或者等于 1k 进行压缩，因为小于 1k 会增加 CPU 加密的负担，从而增加 TCP 的连接时间。**

## gzip_type 压缩类型

我们可以指定压缩的类型，以达到速度更快的访问。

另外，我们开启一些文件类型压缩，因为这些的文件的收益比较大。

```diff
http {
    gzip on;
    gizp_buffers 4 4k;
    gzip_min_lenght 1k;
+   gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php  application/vnd.ms-fontobject font/ttf font/opentype font/x-woff;
}
```

上面的`gzip`类型分别是：

- text/plain - 纯文本类型
- application/javascript - javascript 类型
- text/css - css 类型
- application/xml xml 类型
- application/vnd.ms-fontonject 微软的字体文件
- font/ttf 字体文件
- font/opentype 微软和 adobe 公司开发的字体文件
- font/x-woff woff2 字体文件

## gzip_http_version http 版本设置

最后别忘了使用 http_version，因为这个会决定是否存在真正的 gzip。

因为 upstream 之间的通信是按照 HTTP 1.0 进行通信的，所以避免没有开启 gzip，那么就得添加 http_version。

```diff
http {
    gzip on;
    gizp_buffers 4 4k;
    gzip_min_lenght 1k;
+    gzip_http_version 1.0;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php  application/vnd.ms-fontobject font/ttf font/opentype font/x-woff;
}
```

所以最后配置是：

```
http {
    gzip  on;
    gzip_vary on; # 开启gzip标识
    gzip_http_version 1.0; # gzip的http版本
    gzip_min_length 1k;
    gzip_buffers 32 4k;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php  application/vnd.ms-fontobject font/ttf font/opentype font/x-woff;
}
```
