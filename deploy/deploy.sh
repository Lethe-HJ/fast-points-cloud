#!/bin/bash

# 当前路径 获取该文件所在目录
CURRENT_DIR=$(dirname $(readlink -f $0))
echo "CURRENT_DIR: ${CURRENT_DIR}"
cd ${CURRENT_DIR}
pwd

# 没有.env.production.local 则报错
if [ ! -f ${CURRENT_DIR}/.env.production.local ]; then
    echo "Error: .env.production.local not found"
    exit 1
fi
# 读取环境变量
source .env.production.local
cd ${CURRENT_DIR}/../apps/example
pnpm run build
tar -czvf ./dist.tar.gz dist
mv ./dist.tar.gz ${CURRENT_DIR}
cd ${CURRENT_DIR}

scp ${CURRENT_DIR}/dist.tar.gz ${DEPLOY_USER}@${DEPLOY_IP}:${REMOTE_DEPLOY_PATH}
rm ${CURRENT_DIR}/dist.tar.gz

ssh ${DEPLOY_USER}@${DEPLOY_IP} bash <<EOF
set -e
cd ${REMOTE_DEPLOY_PATH}
tar -xzvf dist.tar.gz
rm dist.tar.gz
rm -rf mini-three-example
mv dist mini-three-example
EOF