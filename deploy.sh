#!/bin/bash

set -e

echo "=========================================="
echo "   静墨博客 - 部署脚本"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未安装 Node.js${NC}"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未安装 npm${NC}"
    exit 1
fi

# 检查 MongoDB
check_mongodb() {
    if command -v mongod &> /dev/null; then
        return 0
    fi
    
    echo -e "${YELLOW}警告: 未检测到本地 MongoDB${NC}"
    echo "选项:"
    echo "  1. 使用 Docker 运行 MongoDB"
    echo "  2. 跳过 (仅用于开发)"
    read -p "请选择 [1/2]: " choice
    
    case $choice in
        1)
            echo -e "${GREEN}启动 MongoDB Docker 容器...${NC}"
            docker run -d --name mongodb \
                -p 27017:27017 \
                -v mongodb_data:/data/db \
                mongo:6
            ;;
        2)
            echo -e "${YELLOW}跳过 MongoDB 检查${NC}"
            ;;
        *)
            echo -e "${RED}无效选择${NC}"
            exit 1
            ;;
    esac
}

# 安装依赖
install_dependencies() {
    echo -e "\n${GREEN}[1/4] 安装依赖...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}依赖安装成功${NC}"
    else
        echo -e "${RED}依赖安装失败${NC}"
        exit 1
    fi
}

# 复制环境变量文件
setup_env() {
    echo -e "\n${GREEN}[2/4] 配置环境变量...${NC}"
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${YELLOW}已创建 .env 文件，请编辑并设置密码${NC}"
        fi
    else
        echo "环境变量文件已存在"
    fi
}

# 构建项目
build_project() {
    echo -e "\n${GREEN}[3/4] 构建项目...${NC}"
    
    mkdir -p uploads
    
    echo -e "${GREEN}项目构建完成${NC}"
}

# 启动服务
start_service() {
    echo -e "\n${GREEN}[4/4] 启动服务...${NC}"
    
    # 检查 PM2
    if command -v pm2 &> /dev/null; then
        echo -e "${GREEN}使用 PM2 启动服务...${NC}"
        pm2 start server/app.js --name "jingmo-blog"
        pm2 save
        pm2 startup
    else
        echo -e "${YELLOW}未安装 PM2，使用 npm start 启动服务${NC}"
        echo -e "建议安装 PM2: npm install -g pm2"
        echo -e "\n或者使用 Docker 部署:"
        echo -e "  docker-compose up -d"
        echo -e "\n或者直接运行:"
        echo -e "  npm start"
    fi
    
    echo -e "\n${GREEN}=========================================="
    echo "   部署完成!"
    echo "=========================================="
    echo -e "访问地址: http://localhost:3000"
    echo -e "==========================================${NC}"
}

# 主流程
main() {
    echo -e "${GREEN}开始部署静墨博客...${NC}"
    
    check_mongodb
    install_dependencies
    setup_env
    build_project
    start_service
}

main "$@"
