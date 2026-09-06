#!/bin/bash
# 等待 DNS 全球生效（多 DNS 验证）
echo "等待 DNS 全球生效，每 15 秒检查 4 个公共 DNS..."
for i in $(seq 1 40); do
    OK=0
    for DNS in 8.8.8.8 1.1.1.1 9.9.9.9 114.114.114.114; do
        IP=$(dig +short mar14z.xyz "@$DNS" +time=5 +tries=1 2>/dev/null | head -1)
        if [ -n "$IP" ] && [ "$IP" != "" ]; then
            echo "  [$DNS] mar14z.xyz -> $IP"
            OK=$((OK+1))
        else
            echo "  [$DNS] NXDOMAIN"
        fi
    done
    if [ "$OK" -ge 3 ]; then
        echo "[OK] DNS 全球生效（$OK/4 DNS 已解析）"
        exit 0
    fi
    echo "[$i/40] $(date +%H:%M:%S) - 等待..."
    sleep 15
done
echo "TIMEOUT"
exit 1
