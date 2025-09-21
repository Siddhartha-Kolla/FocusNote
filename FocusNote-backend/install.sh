#!/bin/bash

echo "Installing dependencies for FocusNote Backend..."

# Install Node.js dependencies
echo "Installing Node.js packages..."
npm install

echo "Installing additional required packages..."
npm install form-data@^4.0.0 node-fetch@^2.7.0

echo "✅ Node.js dependencies installed successfully!"

echo ""
echo "Next steps:"
echo "1. Make sure your .env file is configured with DATABASE_URL, JWT_SECRET, and PYTHON_API_URL"
echo "2. Run 'npm run prisma:generate' to generate Prisma client"
echo "3. Make sure the Python API is running on the configured port (default: 8000)"
echo "4. Start the backend with 'npm run dev'"