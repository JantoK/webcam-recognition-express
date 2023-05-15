# 使用 Node.js 16 作为基础镜像
FROM node:16

# 创建一个名为 /app 的工作目录，并将代码复制到该目录中
WORKDIR /app
COPY . /app

COPY package*.json ./

# 安装项目依赖
RUN npm install

# 暴露 3000 端口以供访问
EXPOSE 3000

# 在启动容器时，运行 npm start 命令
CMD ["npm", "start"]