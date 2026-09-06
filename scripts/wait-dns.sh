#!/bin/bash
# 等待 DNS 解析生效
echo "等待 DNS 解析生效（mar14z.xyz / www.mar14z.xyz -> 161.33.26.40）..."
for i in $(seq 1 30); do
    IP=$(dig +short mar14z.xyz @8.8.8.8 +time=3 +tries=1 2>/dev/null)
    if [ -n "$IP" ]; then
        echo "[OK] 第 $i 次检测，mar14z.xyz -> $IP"
        IP2=$(dig +short www.mar14z.xyz @8.8.8.8 +time=3 +tries=1 2>/dev/null)
        echo "www.mar14z.xyz -> ${IP2:-未解析}"
        if [ -n "$IP2" ]; then
            exit 0
        fi
    fi
    echo "[$i/30] 等待中... $(date +%H:%M:%S)"
    sleep 10
done
echo "TIMEOUT: 5 分钟内 DNS 未生效"
exit 1
