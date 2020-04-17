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

```diff
work_processes 1;

events {
  worker_connecitons 1024;
}

http {
+  server / {
+    root /var/html/www/ # 静态服务器文件目录
+  }
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
