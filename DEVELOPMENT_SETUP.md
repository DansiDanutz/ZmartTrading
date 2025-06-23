# ZmartTrading Development Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ ✅
- Node.js 18+ ✅
- npm 8+ ✅

### Installation Complete ✅

All dependencies have been installed successfully:

#### Frontend Dependencies
- React 18.3.1
- Vite 5.4.19
- Tailwind CSS 3.4.17
- Material-UI 5.17.1
- Axios 1.10.0
- Recharts 2.15.4
- Framer Motion 11.18.2

#### Backend Dependencies
- Flask 3.1.1
- Flask-SQLAlchemy 3.1.1
- Flask-Mail 0.10.0
- Flask-CORS 3.0.10
- pyotp 2.9.0
- cryptography 45.0.3
- python-dotenv 0.19.0

#### Trading & Data Analysis
- requests 2.31.0
- pandas 1.5.3
- numpy 1.24.2
- matplotlib 3.9.4
- seaborn 0.13.2
- plotly 6.1.2
- ccxt 4.2.15
- websocket-client 1.5.1
- python-binance 1.0.19
- kucoin-futures-python 1.0.14

#### Development Tools
- ESLint 8.57.1
- Prettier 3.6.0
- Nodemon 3.1.10
- pytest 8.4.1
- Black 25.1.0
- Flake8 7.3.0
- MyPy 1.16.1

## 🛠️ Available Commands

### Development
```bash
# Start both frontend and backend
npm run start

# Start frontend only (Vite dev server)
npm run dev

# Start backend only (Flask server)
npm run backend

# Build for production
npm run build
```

### Code Quality
```bash
# Format code with Prettier
npm run format

# Lint JavaScript/React code
npm run lint

# Run Python tests
npm run test

# Run frontend tests
npm run test:frontend
```

### Setup
```bash
# Install all dependencies
npm run setup
```

## 📁 Project Structure

```
zmarttrading/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── assets/            # Static assets
├── backend/               # Flask backend
│   ├── app.py            # Main Flask application
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Environment variables
├── public/               # Public static files
└── instance/             # Instance-specific files
```

## 🔧 Environment Configuration

The environment file has been copied from `backend/ZBot.env` to `backend/.env`.

### Required Environment Variables
- `SECRET_KEY`: Flask secret key
- `MAIL_SERVER`: SMTP server for email
- `MAIL_PORT`: SMTP port
- `MAIL_USERNAME`: Email username
- `MAIL_PASSWORD`: Email password
- `CRYPTOMETER_API_KEY`: Cryptometer API key (k77U187e08zGf4I3SLz3sYzTEyM2KNoJ9i1N4xg2)

## 🎯 Next Steps

1. **Configure Environment Variables**: Update `backend/.env` with your specific values
2. **Start Development**: Run `npm run start` to start both servers
3. **Access Application**: Frontend at `http://localhost:5173`, Backend at `http://localhost:5000`
4. **Review Documentation**: Check the comprehensive guides in the project root

## 📚 Key Documentation

- `README.md` - Project overview
- `STARTUP_GUIDE.md` - Detailed startup instructions
- `ROADMAP.md` - Development roadmap
- `AUTH_SYSTEM_README.md` - Authentication system
- `VERSION_AUTOMATION_README.md` - Version control
- `Zmart Trading Bot Dashboard - Complete Implementation Guide for Cursor AI.md` - Complete implementation guide

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**: Change ports in `vite.config.js` or Flask app
2. **Python Path Issues**: Ensure Python 3.9+ is in your PATH
3. **Permission Errors**: Use `pip3 install --user` for Python packages
4. **Node Modules Issues**: Delete `node_modules` and run `npm install`

### Getting Help

- Check the test files in the project root for examples
- Review the comprehensive implementation guide
- Use the provided test scripts for validation

## 🎉 Ready to Develop!

Your ZmartTrading development environment is now fully configured and ready for development. The sophisticated cryptocurrency trading bot system with KingFisher liquidation analysis, RiskMetric scoring, and Cryptometer API integration is ready for your contributions. 