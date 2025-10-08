# Public URL Access Guide

## 🌐 Exposing Your Local Server to the Internet

Your TICKETr app is now set up with **Localtunnel** for easy public access.

---

## 🚀 Quick Start

### **Step 1: Make Sure Your Dev Server is Running**

In one terminal window:
```powershell
cd ticketr-app
npm run dev
```

Keep this running!

### **Step 2: Start Localtunnel (In a NEW Terminal)**

Open a **second terminal** and run:
```powershell
npx localtunnel --port 3000
```

You'll see output like:
```
your url is: https://random-name-abc.loca.lt
```

---

## 🔗 **Using Your Public URL**

Your app is now accessible at: `https://random-name-abc.loca.lt`

**Important Notes:**
- ⚠️ The URL changes every time you restart localtunnel
- ✅ Anyone with the URL can access your app
- ✅ Works on any device (mobile, tablet, other computers)
- ✅ Perfect for testing and sharing

---

## 🔐 **For Google OAuth to Work:**

### **Option 1: Update NEXTAUTH_URL (Recommended)**

When localtunnel starts, it gives you a URL like: `https://abc-123.loca.lt`

1. Copy that URL
2. Update `.env.local`:
   ```env
   NEXTAUTH_URL=https://your-localtunnel-url.loca.lt
   ```
3. Restart your dev server (`npm run dev`)

### **Option 2: Add to Google OAuth Redirect URIs**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   https://your-localtunnel-url.loca.lt
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://your-localtunnel-url.loca.lt/api/auth/callback/google
   ```

---

## 📱 **Perfect For:**

- ✅ Testing on your phone/tablet
- ✅ Sharing with friends/clients
- ✅ Testing Google OAuth
- ✅ Testing Razorpay payments
- ✅ Testing SMS/OTP (when integrated)
- ✅ Remote collaboration

---

## 🛠️ **Common Commands**

### Start Tunnel:
```powershell
npx localtunnel --port 3000
```

### Start Tunnel with Custom Subdomain (if available):
```powershell
npx localtunnel --port 3000 --subdomain ticketr-demo
```

### Stop Tunnel:
Press `Ctrl+C` in the localtunnel terminal

---

## 🔄 **Workflow**

**Terminal 1 (Dev Server):**
```powershell
cd ticketr-app
npm run dev
```

**Terminal 2 (Localtunnel):**
```powershell
npx localtunnel --port 3000
```

Now you have:
- 🏠 Local access: `http://localhost:3000`
- 🌍 Public access: `https://your-url.loca.lt`

---

## ⚠️ **First Visit Warning**

When someone visits your localtunnel URL for the first time, they'll see a warning page:

**"Friendly Reminder"**

Just click **"Click to Continue"** - this is normal for localtunnel's free tier.

---

## 🆚 **Alternatives**

If you need more features:

### **Ngrok** (More features, requires sign-up):
```powershell
# Install
winget install ngrok

# Configure
ngrok config add-authtoken YOUR_TOKEN

# Start
ngrok http 3000
```

### **Cloudflare Tunnel** (Enterprise-grade, free):
```powershell
# Install
winget install Cloudflare.cloudflared

# Start
cloudflared tunnel --url http://localhost:3000
```

---

## 📊 **Monitoring**

While localtunnel is running, you can see all requests in the terminal.

For more detailed monitoring:
- Ngrok has a web interface at `http://localhost:4040`
- Cloudflare has a dashboard

---

## 🔒 **Security Notes**

- ⚠️ Your local server is now publicly accessible
- ⚠️ Don't share sensitive data or credentials
- ⚠️ Use only for development/testing
- ⚠️ Stop the tunnel when not in use
- ✅ Each tunnel session is temporary
- ✅ URL changes when you restart

---

## 💡 **Pro Tips**

1. **Keep Tunnels Separate**: Run dev server and tunnel in separate terminals
2. **Save URLs**: Copy the tunnel URL immediately (it changes on restart)
3. **Restart Together**: If you restart dev server, you might need to restart tunnel
4. **Test Mobile**: Use the public URL on your phone to test mobile experience
5. **Share with Team**: Send the URL to teammates for quick reviews

---

## 🎯 **Quick Test**

1. Start dev server: `npm run dev`
2. Start tunnel: `npx localtunnel --port 3000`
3. Copy the URL shown (e.g., `https://abc-123.loca.lt`)
4. Open it in your browser
5. Click "Click to Continue" on the warning page
6. You should see your TICKETr app! 🎉

---

**Your app is now accessible from anywhere in the world!** 🌍

