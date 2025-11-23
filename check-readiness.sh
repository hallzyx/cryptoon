#!/bin/bash

# Cryptoon Hackathon Readiness Check
# Run this before demo/submission

echo "🚀 Cryptoon Hackathon Readiness Check"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check Node.js version
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
    
    # Extract major version
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ $NODE_MAJOR -lt 18 ]; then
        echo -e "${RED}✗${NC} Node.js version must be 18 or higher"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} Node.js not installed"
    ((ERRORS++))
fi
echo ""

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not installed"
    ((ERRORS++))
fi
echo ""

# Check if root node_modules exists
echo "📁 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Root dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Root dependencies not installed. Run: npm install"
    ((WARNINGS++))
fi

# Check server dependencies
if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Server dependencies installed"
else
    echo -e "${RED}✗${NC} Server dependencies missing. Run: cd server && npm install"
    ((ERRORS++))
fi

# Check client dependencies
if [ -d "client/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Client dependencies installed"
else
    echo -e "${RED}✗${NC} Client dependencies missing. Run: cd client && npm install"
    ((ERRORS++))
fi
echo ""

# Check server .env
echo "🔐 Checking environment configuration..."
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✓${NC} Server .env file exists"
    
    # Check required variables
    if grep -q "RECEIVER_WALLET=0x" server/.env && \
       grep -q "CDP_API_KEY_ID=" server/.env && \
       grep -q "CDP_API_KEY_SECRET=" server/.env && \
       grep -q "CDP_WALLET_SECRET=" server/.env; then
        echo -e "${GREEN}✓${NC} All required environment variables present"
    else
        echo -e "${RED}✗${NC} Missing required environment variables in server/.env"
        echo "  Required: RECEIVER_WALLET, CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} server/.env file missing. Run: cd server && cp .env.example .env"
    ((ERRORS++))
fi

# Check client .env
if [ -f "client/.env.local" ]; then
    echo -e "${GREEN}✓${NC} Client .env.local file exists"
else
    echo -e "${YELLOW}⚠${NC} client/.env.local file missing. Run: cd client && cp .env.example .env.local"
    ((WARNINGS++))
fi
echo ""

# Check critical files
echo "📄 Checking documentation..."
if [ -f "README.md" ]; then
    echo -e "${GREEN}✓${NC} README.md exists"
else
    echo -e "${RED}✗${NC} README.md missing"
    ((ERRORS++))
fi

if [ -f "DEMO.md" ]; then
    echo -e "${GREEN}✓${NC} DEMO.md exists"
else
    echo -e "${YELLOW}⚠${NC} DEMO.md missing"
    ((WARNINGS++))
fi

if [ -f "server/.env.example" ]; then
    echo -e "${GREEN}✓${NC} server/.env.example exists"
else
    echo -e "${YELLOW}⚠${NC} server/.env.example missing"
    ((WARNINGS++))
fi

if [ -f "client/.env.example" ]; then
    echo -e "${GREEN}✓${NC} client/.env.example exists"
else
    echo -e "${YELLOW}⚠${NC} client/.env.example missing"
    ((WARNINGS++))
fi
echo ""

# Check .gitignore
echo "🔒 Checking security..."
if [ -f "server/.gitignore" ]; then
    if grep -q ".env" server/.gitignore && \
       grep -q "agentWalletData.json" server/.gitignore; then
        echo -e "${GREEN}✓${NC} server/.gitignore properly configured"
    else
        echo -e "${RED}✗${NC} server/.gitignore missing critical entries (.env, agentWalletData.json)"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} server/.gitignore missing"
    ((ERRORS++))
fi
echo ""

# Check for sensitive data in git
echo "🔍 Checking for sensitive data..."
if git ls-files | grep -q "server/.env$"; then
    echo -e "${RED}✗${NC} server/.env is tracked by git! Run: git rm --cached server/.env"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} server/.env not tracked by git"
fi

if git ls-files | grep -q "agentWalletData.json"; then
    echo -e "${RED}✗${NC} agentWalletData.json is tracked by git! Run: git rm --cached server/agentWalletData.json"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} agentWalletData.json not tracked by git"
fi
echo ""

# Summary
echo "======================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🎉 You're ready for the hackathon!"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run dev"
    echo "  2. Open: http://localhost:3000"
    echo "  3. Test the demo flow from DEMO.md"
    echo "  4. Record your demo video"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS WARNING(S)${NC}"
    echo ""
    echo "You can proceed, but consider fixing the warnings above."
    exit 0
else
    echo -e "${RED}❌ $ERRORS ERROR(S), $WARNINGS WARNING(S)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    exit 1
fi
