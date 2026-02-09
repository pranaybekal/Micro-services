# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### npm install fails
**Problem**: Dependency installation errors

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Or use specific Node version
nvm use 18
npm install
```

---

### Database Issues

#### Cannot connect to PostgreSQL
**Problem**: `ECONNREFUSED` error or connection timeout

**Solutions**:
1. **Check if PostgreSQL is running**:
   ```bash
   # Windows
   Get-Service -Name postgresql*
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. **Verify credentials in .env files**:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dbname
   ```

3. **Check PostgreSQL is listening**:
   ```bash
   netstat -an | findstr 5432
   ```

4. **Test connection**:
   ```bash
   psql -U postgres -h localhost
   ```

#### Database does not exist
**Problem**: `database "ecommerce_users" does not exist`

**Solution**: Create the databases:
```bash
psql -U postgres
CREATE DATABASE ecommerce_users;
CREATE DATABASE ecommerce_products;
CREATE DATABASE ecommerce_orders;
CREATE DATABASE ecommerce_inventory;
\q
```

#### Permission denied for database
**Problem**: User doesn't have permission

**Solution**:
```bash
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE ecommerce_users TO postgres;
# Repeat for other databases
```

---

### Redis Issues

#### Cannot connect to Redis
**Problem**: `ECONNREFUSED 127.0.0.1:6379`

**Solutions**:
1. **Check if Redis is running**:
   ```bash
   # Windows (if using WSL)
   wsl redis-server
   
   # Linux/Mac
   sudo systemctl status redis
   ```

2. **Start Redis**:
   ```bash
   # Windows (WSL)
   redis-server
   
   # Linux/Mac
   sudo systemctl start redis
   
   # Docker
   docker run -d -p 6379:6379 redis:7-alpine
   ```

3. **Test connection**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

---

### Port Already in Use

#### Error: Port 3000 (or other) already in use

**Solutions**:

**Windows**:
```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use stop-all.ps1
.\stop-all.ps1
```

**Linux/Mac**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

---

### Service Not Starting

#### Service crashes immediately

**Check 1**: Environment variables
```bash
# Make sure .env file exists
ls services/user-service/.env

# Verify content
cat services/user-service/.env
```

**Check 2**: Dependencies installed
```bash
cd services/user-service
npm install
```

**Check 3**: Database connection
- Ensure PostgreSQL is running
- Verify connection string
- Check if database exists

**Check 4**: View error logs
```powershell
# If using start-all.ps1
Receive-Job -Id <JobId>
```

---

### Frontend Issues

#### Blank page / White screen

**Solutions**:
1. **Check console for errors** (F12)
2. **Verify API Gateway is running**:
   ```bash
   curl http://localhost:3000/health
   ```
3. **Check .env file**:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. **Rebuild**:
   ```bash
   cd frontend
   rm -rf node_modules dist
   npm install
   npm run dev
   ```

#### CORS errors

**Problem**: `Access-Control-Allow-Origin` error

**Solution**: Check CORS settings in services:
```javascript
app.use(cors()); // Should be present in all services
```

#### API calls failing

**Solutions**:
1. **Check Network tab** (F12)
2. **Verify API Gateway is running**
3. **Check service endpoints**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   ```

---

### Authentication Issues

#### "Invalid token" or "No token provided"

**Solutions**:
1. **Clear localStorage**:
   ```javascript
   // In browser console (F12)
   localStorage.clear()
   ```
2. **Login again**
3. **Check JWT_SECRET** matches in `.env`

#### Cannot login after registration

**Solutions**:
1. **Check user service logs**
2. **Verify password hashing**:
   ```bash
   # Check user service is running
   curl http://localhost:3001/health
   ```
3. **Check database**:
   ```sql
   SELECT * FROM users WHERE email = 'your@email.com';
   ```

---

### Cart Issues

#### Cart not updating

**Solutions**:
1. **Check Redis is running**:
   ```bash
   redis-cli ping
   ```
2. **Check cart service**:
   ```bash
   curl http://localhost:3003/health
   ```
3. **Clear cart**:
   ```bash
   redis-cli
   KEYS cart:*
   DEL cart:1
   ```

#### Cart items missing details

**Solution**: Ensure Product Service is running:
```bash
curl http://localhost:3002/health
```

---

### Order Issues

#### Order creation fails

**Check**:
1. Cart has items
2. Shipping address provided
3. Inventory service running
4. Order service logs for errors

**Debug**:
```bash
# Check order service logs
Receive-Job -Id <OrderServiceJobId>

# Check database
psql -U postgres -d ecommerce_orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
```

---

### Inventory Issues

#### Cannot add products

**Solutions**:
1. **Check you're logged in**
2. **Check user role** (should be 'admin' or 'customer')
3. **Verify category exists**:
   ```bash
   curl http://localhost:3002/api/categories
   ```

---

### Docker Issues

#### docker-compose up fails

**Solutions**:
1. **Check Docker is running**:
   ```bash
   docker --version
   docker ps
   ```

2. **Remove old containers**:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

3. **Check logs**:
   ```bash
   docker-compose logs -f
   ```

#### Container keeps restarting

**Check logs**:
```bash
docker-compose logs service-name
```

**Common causes**:
- Database not ready
- Environment variables missing
- Port conflicts

---

### Performance Issues

#### Slow page loads

**Solutions**:
1. **Check network tab** (F12)
2. **Optimize database queries**
3. **Add indexes**:
   ```sql
   CREATE INDEX idx_products_category ON products(category_id);
   ```
4. **Enable Redis caching**

#### High memory usage

**Solutions**:
1. **Limit database connections**
2. **Close unused terminals**
3. **Restart services**:
   ```powershell
   .\stop-all.ps1
   .\start-all.ps1
   ```

---

### Build/Production Issues

#### Frontend build fails

**Solutions**:
```bash
cd frontend
rm -rf node_modules dist .vite
npm install
npm run build
```

#### Environment variables not working in production

**Solution**: Ensure .env files are loaded:
```javascript
require('dotenv').config();
```

---

## Debug Checklist

When something doesn't work, check in this order:

1. ✅ All services running (`Get-Job`)
2. ✅ PostgreSQL running (`psql -U postgres`)
3. ✅ Redis running (`redis-cli ping`)
4. ✅ All `.env` files exist
5. ✅ Databases created
6. ✅ No port conflicts
7. ✅ Dependencies installed (`npm install`)
8. ✅ Browser console for errors (F12)
9. ✅ Network tab for API calls (F12)
10. ✅ Service logs (`Receive-Job`)

---

## Useful Commands

### Check Service Status
```powershell
# List all jobs
Get-Job | Format-Table

# Check specific job
Get-Job -Name "API-Gateway"

# View logs
Receive-Job -Id 1 -Keep
```

### Database Commands
```bash
# Connect to database
psql -U postgres -d ecommerce_users

# List tables
\dt

# View data
SELECT * FROM users;

# Exit
\q
```

### Redis Commands
```bash
# Connect to Redis
redis-cli

# List all keys
KEYS *

# Get value
GET cart:1

# Delete key
DEL cart:1

# Clear all
FLUSHALL

# Exit
exit
```

### Network Commands
```powershell
# Check what's running on ports
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Test endpoint
curl http://localhost:3000/health
```

---

## Still Having Issues?

### 1. Check Logs
Every service logs errors. Check them:
```powershell
Get-Job | Receive-Job
```

### 2. Restart Everything
```powershell
.\stop-all.ps1
.\start-all.ps1
```

### 3. Clean Start
```bash
# Stop all
.\stop-all.ps1

# Kill all Node processes
taskkill /F /IM node.exe

# Restart
.\start-all.ps1
```

### 4. Use Docker Instead
```bash
docker-compose down -v
docker-compose up --build
```

### 5. Check Documentation
- [QUICKSTART.md](QUICKSTART.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [API_EXAMPLES.md](API_EXAMPLES.md)

---

## Emergency Reset

If everything is broken:

```bash
# 1. Stop all services
.\stop-all.ps1

# 2. Drop databases
psql -U postgres
DROP DATABASE IF EXISTS ecommerce_users;
DROP DATABASE IF EXISTS ecommerce_products;
DROP DATABASE IF EXISTS ecommerce_orders;
DROP DATABASE IF EXISTS ecommerce_inventory;

# 3. Recreate databases
CREATE DATABASE ecommerce_users;
CREATE DATABASE ecommerce_products;
CREATE DATABASE ecommerce_orders;
CREATE DATABASE ecommerce_inventory;
\q

# 4. Clear Redis
redis-cli FLUSHALL

# 5. Clean install
cd frontend && rm -rf node_modules && npm install && cd ..
cd api-gateway && rm -rf node_modules && npm install && cd ..
# Repeat for all services

# 6. Start fresh
.\start-all.ps1
```

---

## Getting Help

If you're still stuck:
1. Check the error message carefully
2. Search for the error online
3. Review the code comments
4. Check service health endpoints
5. Verify all prerequisites are installed

---

Most issues are caused by:
- Missing dependencies
- Database not running
- Redis not running
- Port conflicts
- Missing .env files
- Wrong database credentials

Check these first! 🔍
