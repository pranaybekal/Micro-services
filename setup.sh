#!/bin/bash

echo "🚀 Setting up E-Commerce Microservices Platform..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create .env files from examples
echo -e "${YELLOW}Creating environment files...${NC}"

services=("user-service" "product-service" "cart-service" "order-service" "inventory-service")

for service in "${services[@]}"; do
  if [ ! -f "services/$service/.env" ]; then
    cp "services/$service/.env.example" "services/$service/.env"
    echo "✓ Created services/$service/.env"
  fi
done

if [ ! -f "api-gateway/.env" ]; then
  cp "api-gateway/.env.example" "api-gateway/.env"
  echo "✓ Created api-gateway/.env"
fi

if [ ! -f "frontend/.env" ]; then
  cp "frontend/.env.example" "frontend/.env"
  echo "✓ Created frontend/.env"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"

echo "Installing API Gateway dependencies..."
cd api-gateway && npm install && cd ..

for service in "${services[@]}"; do
  echo "Installing $service dependencies..."
  cd "services/$service" && npm install && cd ../..
done

echo "Installing Frontend dependencies..."
cd frontend && npm install && cd ..

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Make sure PostgreSQL is running on localhost:5432"
echo "2. Make sure Redis is running on localhost:6379"
echo "3. Create databases:"
echo "   psql -U postgres -c \"CREATE DATABASE ecommerce_users;\""
echo "   psql -U postgres -c \"CREATE DATABASE ecommerce_products;\""
echo "   psql -U postgres -c \"CREATE DATABASE ecommerce_orders;\""
echo "   psql -U postgres -c \"CREATE DATABASE ecommerce_inventory;\""
echo "4. Start services in separate terminals:"
echo "   Terminal 1: cd api-gateway && npm run dev"
echo "   Terminal 2: cd services/user-service && npm run dev"
echo "   Terminal 3: cd services/product-service && npm run dev"
echo "   Terminal 4: cd services/cart-service && npm run dev"
echo "   Terminal 5: cd services/order-service && npm run dev"
echo "   Terminal 6: cd services/inventory-service && npm run dev"
echo "   Terminal 7: cd frontend && npm run dev"
echo ""
echo "Or use Docker: docker-compose up"
