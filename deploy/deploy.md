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
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

systemctl daemon-reload
systemctl enable nginx
systemctl start nginx
```

6.sudo chown -R hujin:hujin /var/www/html
