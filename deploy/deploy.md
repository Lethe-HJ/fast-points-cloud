1. 用户配置sudo权限
2. 配置免密登录
3. 修改deploy\.env.production.local
4. sudo apt install nginx
5. 配置systemctl

```sh

su root
which nginx # 看看输出的nginx路径替换下面的/usr/sbin/nginx路径
sudo cat > /etc/systemd/system/nginx.service << EOF
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/usr/sbin/nginx -s reload
ExecStop=/usr/sbin/nginx -s stop
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF


sudo cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html/mini-three-example;
    index index.html;
    server_name _;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 5;
    gzip_proxied any;
    gzip_types text/html text/plain text/css text/xml application/javascript application/json application/xml application/xml+rss image/svg+xml font/ttf font/opentype application/vnd.ms-fontobject;

    open_file_cache max=2000 inactive=20s;
    open_file_cache_valid 60s;
    open_file_cache_errors on;

    # Vite 等：带 hash 的 chunk，长期缓存（^~ 优先于下方正则，避免重复匹配）
    location ^~ /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 根目录其它静态后缀（按需缩短无 hash 资源的 expires）
    location ~* \.(?:js|mjs|css|png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files \$uri =404;
    }

    # 入口 HTML：协商缓存（no-cache = 可用缓存，用前须向源站校验，非完全不缓存）
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # 访问 / 时走内部 index，不一定会命中上一段，故单独保证与 /index.html 一致
    location = / {
        add_header Cache-Control "no-cache";
        try_files /index.html =404;
    }

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

systemctl daemon-reload
systemctl enable nginx
systemctl start nginx
```

**缓存策略说明**：`/assets/` 与带 hash 的静态后缀使用 `immutable` 长缓存；入口 `index.html`（及 `/`）使用 `Cache-Control: no-cache`，与 `/assets` 分工——壳子可留在磁盘，但每次使用前要协商（`ETag` / `Last-Modified`，可 304），避免长期钉死旧壳子。若改为 SPA（`try_files $uri $uri/ /index.html`），需保证**最终返回的那份 HTML**仍带 `no-cache`（可保留 `location = /index.html`，并为回退到 `index.html` 的路由增加同级 `add_header`，例如对 `location = /` 或 `location /` 按需合并，避免仅直链 `/index.html` 才协商）。

6.sudo chown -R hujin:hujin /var/www/html
