#!/bin/bash
# 十年持志网页发版。只替换 /var/www/html/tenyears/，不发布黄庭书院 App。
# 连接被重置时立刻重试，中间不要 sleep。线上目录必须等包校验通过后再替换。
set -u
cd "$(dirname "$0")"

export NODE_OPTIONS=--openssl-legacy-provider
npm run build

APP_JS=$(grep -o 'js/app\.[a-z0-9]*\.js' dist/index.html | head -1)
test -n "$APP_JS"
test -f "dist/$APP_JS"
test -f dist/index.html
LOCAL_JS_MD5=$(md5 -q "dist/$APP_JS")

COPYFILE_DISABLE=1 tar czf /tmp/tenyears.tgz -C dist .
LOCAL_TGZ_MD5=$(md5 -q /tmp/tenyears.tgz)
echo "LOCAL_TGZ $LOCAL_TGZ_MD5"
echo "LOCAL_JS $LOCAL_JS_MD5"
echo "APP $APP_JS"

HOST=root@39.105.174.143
OPTS=(-o IPQoS=none -o BatchMode=yes -o ConnectTimeout=8 -o ServerAliveInterval=5)
ok=0
for i in $(seq 1 40); do
  echo "===== $i $(date '+%H:%M:%S') ====="
  if ssh "${OPTS[@]}" "$HOST" "cat > /tmp/tenyears.tgz && md5sum /tmp/tenyears.tgz && rm -rf /tmp/tenyears-release && mkdir -p /tmp/tenyears-release && tar xzf /tmp/tenyears.tgz -C /tmp/tenyears-release && test -f /tmp/tenyears-release/$APP_JS && test -f /tmp/tenyears-release/index.html && rm -rf /var/www/html/tenyears/* && cp -a /tmp/tenyears-release/. /var/www/html/tenyears/ && md5sum /var/www/html/tenyears/$APP_JS && grep -o 'js/app\\.[a-z0-9]*\\.js' /var/www/html/tenyears/index.html && echo DEPLOY_OK" < /tmp/tenyears.tgz; then
    ok=1
    break
  fi
  echo "FAIL $i"
done

if [ "$ok" != 1 ]; then
  echo SSH_GAVE_UP
  exit 1
fi

echo "EXPECT_TGZ $LOCAL_TGZ_MD5"
echo "EXPECT_JS $LOCAL_JS_MD5"
echo "线上页面：http://app.htzchina.org/tenyears/"
