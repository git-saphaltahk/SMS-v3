# AWS 部署指南 — Store Management System

## 架构概览

```
用户浏览器
    │
    ▼
CloudFront CDN (前端静态文件加速)
    │
    ▼
Elastic Beanstalk (Spring Boot 应用)
    │
    ├─── RDS PostgreSQL (数据库)
    ├─── ElastiCache Redis (缓存)
    └─── S3 (商品图片存储)
```

## 第一步：创建 Docker 镜像

```bash
# 1. 先打包后端
cd backend
./mvnw package -DskipTests

# 2. 构建 Docker 镜像
cd ..
docker build -t store-management-system:latest .
```

## 第二步：推送到 ECR（AWS 镜像仓库）

```bash
# 登录 AWS
aws configure

# 创建 ECR 仓库
aws ecr create-repository --repository-name store-management-system

# 登录 ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# 打标签 & 推送
docker tag store-management-system:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/store-management-system:latest

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/store-management-system:latest
```

## 第三步：创建 Elastic Beanstalk 环境

```bash
# 1. 创建 EB 应用
aws elasticbeanstalk create-application \
  --application-name "StoreManagementSystem"

# 2. 创建环境
aws elasticbeanstalk create-environment \
  --application-name "StoreManagementSystem" \
  --environment-name "sms-production" \
  --solution-stack-name "64bit Amazon Linux 2023 v4 running Docker" \
  --option-settings \
    "Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=aws-elasticbeanstalk-ec2-role" \
    "Namespace=aws:elasticbeanstalk:environment,OptionName=EnvironmentType,Value=SingleInstance"
```

## 第四步：创建 RDS 数据库

```bash
# 创建 PostgreSQL 实例（免费层）
aws rds create-db-instance \
  --db-instance-identifier "sms-database" \
  --db-instance-class "db.t3.micro" \
  --engine "postgres" \
  --master-username "storeadmin" \
  --master-user-password "STRONG_PASSWORD_HERE" \
  --allocated-storage 20 \
  --db-name "mystore"
```

## 第五步：创建 S3 存储桶（商品图片）

```bash
aws s3 mb s3://sms-product-images --region us-east-1
```

## 第六步：配置 CloudFront CDN

在 AWS Console → CloudFront → Create Distribution：
- Origin: 选择 Elastic Beanstalk 环境 URL
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Cache Policy: CachingOptimized

## 环境变量配置

在 Elastic Beanstalk → Configuration → Environment Properties 添加：

```
SPRING_DATASOURCE_URL=jdbc:postgresql://<rds-endpoint>:5432/mystore
SPRING_DATASOURCE_USERNAME=storeadmin
SPRING_DATASOURCE_PASSWORD=<password>
SPRING_PROFILES_ACTIVE=prod
STRIPE_API_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
FRONTEND_URL=https://<cloudfront-domain>
```

## 成本估算（最小配置）

| 资源 | 配置 | 月费约 |
|------|------|--------|
| EC2 (EB) | t3.micro 单实例 | ~$10 |
| RDS | db.t3.micro 单AZ | ~$15 |
| S3 | 5GB 存储 | ~$0.15 |
| CloudFront | 50GB 流量 | ~$5 |
| ElastiCache | 可选 | — |
| **合计** | | **~$30/月** |

> 注意：这是一个学生项目，可以全部使用 AWS 免费层，实际费用可控制在 $0。
