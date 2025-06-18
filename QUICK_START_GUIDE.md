# ⚡ ScaleMate - Quick Start Guide

## 🚀 Get ScaleMate Running in 5 Minutes!

### **Prerequisites**
- Node.js 18+ installed
- npm or yarn package manager
- Git installed

### **Quick Setup**

1. **Clone & Install**
```bash
git clone https://github.com/your-username/scalemate-v3.git
cd scalemate-v3
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Open in Browser**
Navigate to: `http://localhost:3001` (or whatever port Next.js assigns)

### **That's it! 🎉**

ScaleMate is now running with:
- ✅ Full calculator functionality
- ✅ Analytics tracking
- ✅ Lead generation
- ✅ Admin dashboard at `/admin`
- ✅ Pitch deck generator

### **Optional: Add AI Features**
If you want AI-powered implementation plans:

1. **Get Claude API Key** from Anthropic
2. **Create `.env.local`**
```bash
CLAUDE_API_KEY=your_claude_api_key_here
```
3. **Restart the server**
```bash
npm run dev
```

### **Test the Application**

1. **Calculator**: Go through all 5 steps
2. **Admin Dashboard**: Visit `/admin` to see analytics
3. **Lead Generation**: Try to leave the page to trigger exit-intent modal
4. **Pitch Deck**: Complete the calculator to see the 6-slide presentation

### **Key URLs**
- **Main App**: `http://localhost:3001`
- **Admin Dashboard**: `http://localhost:3001/admin`
- **API Endpoints**: 
  - `/api/analytics` - User tracking
  - `/api/leads` - Lead management
  - `/api/implementation-plan` - AI features

### **File Structure Overview**
```
src/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── calculator/         # Calculator components
│   ├── admin/             # Admin dashboard
│   └── ui/                # Reusable UI components
├── types/                 # TypeScript definitions
└── utils/                 # Utility functions

data/                      # JSON storage
├── analytics.json         # User analytics
└── leads.json            # Lead data
```

### **Key Features Working**
- 🧮 **5-Step Calculator** - Complete offshore cost analysis
- 📊 **Pitch Deck Generator** - 6-slide professional presentations
- 📈 **Real-time Analytics** - User tracking and insights
- 🎯 **Lead Generation** - Smart lead capture system
- 👥 **Admin Dashboard** - Comprehensive management interface

### **Troubleshooting**

**Port Issues**: Next.js will automatically find an available port (3001, 3002, etc.)

**Build Issues**: Clear cache and reinstall
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**API Errors**: Check browser console and terminal for error messages

### **Production Deployment**

**Build for Production**
```bash
npm run build
npm start
```

**Deploy to Vercel** (Recommended)
```bash
npx vercel
```

---

## 🎯 **You're Ready to Go!**

ScaleMate is now running with all features working perfectly. The application is production-ready and has been tested with real users successfully!

**Happy Calculating! 🚀** 