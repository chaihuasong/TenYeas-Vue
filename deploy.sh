#!/bin/bash

# 编译
export NODE_OPTIONS=--openssl-legacy-provider
npm run build

# 清空旧文件，保留目录本身
ssh root@39.105.174.143 "rm -rf /var/www/html/tenyears/*"

# 部署到服务器
scp -r dist/* root@39.105.174.143:/var/www/html/tenyears/

echo "部署完成"
