#!/bin/bash

# Quick Start Script for Women in STEM Network Platform

echo "🚀 Starting Women in STEM Network Platform..."
echo ""

# Check if .env files exist
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Frontend .env.local not found. Copying from example..."
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local - Please add your Supabase credentials"
fi

if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env not found. Copying from example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please add your Supabase credentials"
fi

echo ""
echo "📝 Before starting, make sure you have:"
echo "   1. Created a Supabase project"
echo "   2. Run the SQL migrations (see SUPABASE_SETUP.md)"
echo "   3. Created the 'resumes' storage bucket"
echo "   4. Added your Supabase credentials to .env files"
echo ""

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    cd ..
    echo "✅ Backend setup complete"
    echo ""
fi

# Start backend
echo "🔥 Starting Flask backend on http://localhost:5001..."
cd backend
source venv/bin/activate
python run.py &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Start frontend
echo "⚛️  Starting React frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Platform is starting!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
