** DO "npm run seed" in terminal to seed data first.

#### MongoDB Atlas URI


**Get your MongoDB connection string:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. **Database Access**:
   - Click "Add New Database User"
   - Username: `admin` (or your choice)
   - Password: Create a strong password (e.g., `MySecurePass123`)
   - User Privileges: Atlas Admin
   - Click "Add User"

4. **Network Access**:
   - Click "Add IP Address"
   - For testing: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Select "Node.js" driver
   - Copy the connection string
   - Replace `<username>`, `<password>`, and add database name

**Example:**
```env
MONGO_URI=mongodb+srv://admin:MySecurePass123@cluster0.abc123.mongodb.net/clothing-ecommerce?retryWrites=true&w=majority
```

#### Gmail App Password

**Get Gmail App Password for sending emails:**

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Scroll to "2-Step Verification"
   - Click "Get Started" and follow steps
   - Verify with phone number

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Sign in with your Gmail account
   - Select app: **Mail**
   - Select device: **Windows Computer**
   - Click "Generate"
   - **Copy the 16-character password** (format: `abcd efgh ijkl mnop`)
   - **Remove spaces**: `abcdefghijklmnop`

3. **Add to .env:**
```env
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=abcdefghijklmnop
```


---

## 🧪 Verify Setup

After configuration, test your setup:
```bash
# Test MongoDB connection
cd backend
node seedProducts.js
npm run dev

# Expected output:
# ✅ MongoDB Connected
# 🚀 Server running on port 5000


```

---

## 🔐 Security Notes


**Never share your `.env` file with anyone!**

---


### Email Not Sending

**Error:** `Invalid login` or `EAUTH`

**Solution:**
- Verify 2FA is enabled on Gmail
- Use app password (16 chars), not Gmail password
- Remove spaces from app password
- Check EMAIL_USER is correct Gmail address

