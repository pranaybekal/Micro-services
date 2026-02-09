# 🚀 Deployment Guide

## Cloud Deployment Options

### Option 1: AWS Deployment

#### Prerequisites
- AWS Account
- AWS CLI installed and configured
- Docker installed

#### Services Mapping

| Service | AWS Service | Alternative |
|---------|-------------|-------------|
| Frontend | S3 + CloudFront | Amplify |
| API Gateway | ECS/EKS | Elastic Beanstalk |
| Microservices | ECS/EKS | Lambda (serverless) |
| PostgreSQL | RDS PostgreSQL | Aurora |
| Redis | ElastiCache | MemoryDB |

#### Deployment Steps

**1. Database Setup**
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier ecommerce-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourPassword123 \
  --allocated-storage 20

# Create ElastiCache Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id ecommerce-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

**2. Container Registry**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create repositories for each service
aws ecr create-repository --repository-name ecommerce/api-gateway
aws ecr create-repository --repository-name ecommerce/user-service
aws ecr create-repository --repository-name ecommerce/product-service
aws ecr create-repository --repository-name ecommerce/cart-service
aws ecr create-repository --repository-name ecommerce/order-service
aws ecr create-repository --repository-name ecommerce/inventory-service

# Build and push images
docker build -t ecommerce/api-gateway ./api-gateway
docker tag ecommerce/api-gateway:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ecommerce/api-gateway:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ecommerce/api-gateway:latest
```

**3. ECS Deployment**
- Create ECS cluster
- Create task definitions for each service
- Create services with load balancers
- Configure environment variables
- Set up auto-scaling

**4. Frontend Deployment**
```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-ecommerce-bucket --delete

# Create CloudFront distribution
# Configure custom domain
```

---

### Option 2: Azure Deployment

#### Services Mapping

| Service | Azure Service |
|---------|--------------|
| Frontend | Azure Static Web Apps |
| API Gateway | Azure Container Instances |
| Microservices | Azure Container Instances / AKS |
| PostgreSQL | Azure Database for PostgreSQL |
| Redis | Azure Cache for Redis |

#### Deployment Steps

**1. Resource Group**
```bash
az group create --name ecommerce-rg --location eastus
```

**2. Database**
```bash
# PostgreSQL
az postgres flexible-server create \
  --resource-group ecommerce-rg \
  --name ecommerce-db \
  --location eastus \
  --admin-user myadmin \
  --admin-password MyPassword123 \
  --sku-name Standard_B1ms

# Redis
az redis create \
  --resource-group ecommerce-rg \
  --name ecommerce-redis \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

**3. Container Registry**
```bash
az acr create \
  --resource-group ecommerce-rg \
  --name ecommerceacr \
  --sku Basic

# Build and push
az acr build \
  --registry ecommerceacr \
  --image api-gateway:latest \
  ./api-gateway
```

**4. Deploy Containers**
```bash
az container create \
  --resource-group ecommerce-rg \
  --name api-gateway \
  --image ecommerceacr.azurecr.io/api-gateway:latest \
  --dns-name-label ecommerce-gateway \
  --ports 3000
```

**5. Frontend**
```bash
cd frontend
npm run build

# Deploy to Static Web Apps
az staticwebapp create \
  --name ecommerce-frontend \
  --resource-group ecommerce-rg \
  --location eastus
```

---

### Option 3: Google Cloud Platform

#### Services Mapping

| Service | GCP Service |
|---------|------------|
| Frontend | Firebase Hosting / Cloud Storage |
| API Gateway | Cloud Run |
| Microservices | Cloud Run / GKE |
| PostgreSQL | Cloud SQL |
| Redis | Memorystore |

#### Deployment Steps

**1. Database**
```bash
# Cloud SQL
gcloud sql instances create ecommerce-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Memorystore
gcloud redis instances create ecommerce-redis \
  --size=1 \
  --region=us-central1
```

**2. Container Registry**
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/api-gateway ./api-gateway
```

**3. Cloud Run Deployment**
```bash
gcloud run deploy api-gateway \
  --image gcr.io/PROJECT_ID/api-gateway \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**4. Frontend**
```bash
cd frontend
npm run build

# Deploy to Firebase
firebase init hosting
firebase deploy
```

---

### Option 4: Heroku (Simple Deployment)

**1. Prepare Services**
```bash
# Each service needs a Procfile
echo "web: npm start" > api-gateway/Procfile
```

**2. Deploy Services**
```bash
# API Gateway
cd api-gateway
heroku create ecommerce-gateway
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# Repeat for each service
```

**3. Frontend**
```bash
cd frontend
heroku create ecommerce-frontend --buildpack mars/create-react-app
git push heroku main
```

---

### Option 5: DigitalOcean

**1. Droplets or App Platform**
```bash
# Using doctl CLI
doctl apps create --spec .do/app.yaml
```

**2. Managed Databases**
- Create PostgreSQL cluster
- Create Redis cluster

**3. Container Registry**
```bash
doctl registry create ecommerce
docker tag api-gateway registry.digitalocean.com/ecommerce/api-gateway
docker push registry.digitalocean.com/ecommerce/api-gateway
```

---

## Environment Variables for Production

Update these in each service:

**API Gateway**
```env
NODE_ENV=production
PORT=3000
USER_SERVICE_URL=https://user-service.your-domain.com
PRODUCT_SERVICE_URL=https://product-service.your-domain.com
CART_SERVICE_URL=https://cart-service.your-domain.com
ORDER_SERVICE_URL=https://order-service.your-domain.com
INVENTORY_SERVICE_URL=https://inventory-service.your-domain.com
```

**Services**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db-host:5432/dbname
REDIS_URL=redis://prod-redis-host:6379
JWT_SECRET=your-very-secure-production-secret-key
```

**Frontend**
```env
VITE_API_URL=https://api.your-domain.com
```

---

## CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push API Gateway
      run: |
        docker build -t api-gateway ./api-gateway
        docker tag api-gateway:latest $ECR_REGISTRY/api-gateway:latest
        docker push $ECR_REGISTRY/api-gateway:latest
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster ecommerce --service api-gateway --force-new-deployment
```

---

## Production Checklist

### Security
- [ ] Use HTTPS/SSL certificates
- [ ] Enable CORS properly
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable database encryption
- [ ] Use VPC/Private networks
- [ ] Implement proper authentication
- [ ] Add API key management

### Performance
- [ ] Enable database connection pooling
- [ ] Implement caching strategies
- [ ] Add CDN for static assets
- [ ] Enable gzip compression
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Implement pagination
- [ ] Use load balancers

### Monitoring
- [ ] Set up logging (CloudWatch, Stackdriver, etc.)
- [ ] Add application monitoring (DataDog, New Relic)
- [ ] Set up error tracking (Sentry)
- [ ] Configure alerts
- [ ] Add health check endpoints
- [ ] Monitor database performance
- [ ] Track API usage

### Backup & Recovery
- [ ] Enable database automated backups
- [ ] Create disaster recovery plan
- [ ] Test backup restoration
- [ ] Version control all code
- [ ] Document recovery procedures

### Scalability
- [ ] Enable auto-scaling
- [ ] Use managed services where possible
- [ ] Implement horizontal scaling
- [ ] Add read replicas for databases
- [ ] Use message queues for async tasks
- [ ] Implement circuit breakers

---

## Cost Optimization Tips

1. **Use Free Tiers**: Most cloud providers offer free tiers
2. **Right-size Instances**: Start small, scale as needed
3. **Use Spot Instances**: For non-critical workloads
4. **Enable Auto-scaling**: Scale down during low traffic
5. **Use CDN**: Reduce bandwidth costs
6. **Optimize Images**: Use compressed images
7. **Cache Aggressively**: Reduce database queries

---

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and optimize database queries
- Monitor error logs
- Review security advisories
- Update SSL certificates
- Database maintenance (VACUUM, ANALYZE)
- Clear old logs and data

### Backups
- Daily automated database backups
- Weekly full system backups
- Test restore procedures quarterly
- Store backups in multiple regions

---

Ready to go live! 🚀
