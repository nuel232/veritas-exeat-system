# AWS Elastic Beanstalk Deployment Checklist

## ✅ **Pre-Deployment Requirements**

### 1. **Environment Variables (CRITICAL)**
Before deploying, you MUST set these environment variables in your Elastic Beanstalk environment:

```bash
# Required for database connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exeat_system

# Required for JWT authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Already configured in .ebextensions/app-config.config
NODE_ENV=production
PORT=8081
```

### 2. **Set Environment Variables via AWS Console:**
1. Go to AWS Elastic Beanstalk Console
2. Select your application → Environment
3. Go to Configuration → Software
4. Add environment properties:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing

### 3. **MongoDB Setup:**
- Ensure MongoDB Atlas cluster is running
- Whitelist Elastic Beanstalk IP addresses (or use 0.0.0.0/0 for testing)
- Create database user with read/write permissions

## 🔧 **Fixed Issues**

### ✅ **Port Configuration**
- Fixed server.js to properly use `process.env.PORT`
- Configured Elastic Beanstalk to set `PORT=8081`

### ✅ **Server Startup Logic**
- Server now starts even if database connection fails
- Added graceful database connection handling
- Added health check endpoint at `/health`

### ✅ **Configuration Cleanup**
- Removed duplicate .ebextensions files
- Consolidated all settings in `app-config.config`

## 🚀 **Deploy Commands**

```bash
# 1. Commit your changes
git add .
git commit -m "Fix deployment issues"

# 2. Deploy to Elastic Beanstalk
eb deploy

# 3. Check health after deployment
eb health
eb logs
```

## 🔍 **Health Check URLs**

After deployment, test these endpoints:
- Health check: `https://your-app-url.elasticbeanstalk.com/health`
- API test: `https://your-app-url.elasticbeanstalk.com/api/test`
- DB test: `https://your-app-url.elasticbeanstalk.com/api/test/db`

## ⚠️ **Common Issues & Solutions**

### If deployment still fails:
1. **Check EB logs**: `eb logs`
2. **Verify environment variables are set**
3. **Check MongoDB connection string format**
4. **Ensure MongoDB Atlas allows connections from AWS**

### If getting 5xx errors:
1. Check if `MONGODB_URI` and `JWT_SECRET` are set
2. Verify MongoDB Atlas IP whitelist
3. Check application logs for database connection errors 