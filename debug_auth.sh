#!/bin/bash

echo "🔍 Testing FocusNote Authentication Flow"
echo "========================================"

# Configuration
BACKEND_URL="http://localhost:4000"
TEST_EMAIL="test@example.com"

echo ""
echo "1. Testing backend connectivity..."
curl -s "$BACKEND_URL/" || {
    echo "❌ Backend not reachable at $BACKEND_URL"
    echo "   Make sure Node.js backend is running: cd FocusNote-backend && npm run dev"
    exit 1
}
echo "✅ Backend is running"

echo ""
echo "2. Testing authentication endpoint..."
curl -s "$BACKEND_URL/auth/me" | grep -q "Not logged in" && {
    echo "✅ Auth endpoint responding correctly (not logged in)"
} || {
    echo "❌ Auth endpoint unexpected response"
    curl -s "$BACKEND_URL/auth/me"
}

echo ""
echo "3. Testing process endpoint (should require auth)..."
curl -s -X POST "$BACKEND_URL/process/scan" \
    -H "Content-Type: multipart/form-data" \
    -F "title=Test" | grep -q "Missing token" && {
    echo "✅ Process endpoint correctly requires authentication"
} || {
    echo "❌ Process endpoint unexpected response"
    curl -s -X POST "$BACKEND_URL/process/scan" -H "Content-Type: multipart/form-data" -F "title=Test"
}

echo ""
echo "🔧 Debugging Steps:"
echo "1. Check browser DevTools > Application > Cookies for 'token' cookie"
echo "2. Check browser DevTools > Network > Request Headers for Authorization header"
echo "3. Verify you're logged in: curl -s $BACKEND_URL/auth/me -H 'Cookie: token=YOUR_TOKEN'"
echo ""
echo "📝 Common Issues:"
echo "- Cookie not set during login (check auth flow)"
echo "- Token expired (cookies expire after 1 hour)"
echo "- CORS issues (check browser console)"
echo "- Wrong cookie name (should be 'token', not 'authToken')"