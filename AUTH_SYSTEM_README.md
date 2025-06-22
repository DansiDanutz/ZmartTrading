# ZmartTrading SuperAdmin & Admin Auth System

## Overview

This implementation provides a complete SuperAdmin and Admin authentication system for the ZmartTrading platform, featuring email verification, password management, and role-based access control.

## Features

### 🔐 SuperAdmin Features (seme@kryptostack.com)
- **Password Change**: Secure password change with email verification
- **Admin Management**: Create, confirm, and delete admin accounts
- **Settings Access**: Exclusive access to the Settings tab
- **Full System Control**: Complete administrative privileges

### 👤 Admin Features
- **Secure Login**: Only after SuperAdmin confirmation
- **Password Reset**: Forgot password functionality with email verification
- **Dashboard Access**: View and interact with trading dashboard
- **Limited Permissions**: Restricted to dashboard functionality

### 📧 Email Verification System
- **10-minute expiration**: All verification codes expire after 10 minutes
- **Multiple purposes**: Password reset, admin creation, admin confirmation
- **Secure delivery**: Codes sent via email with proper validation

## System Architecture

### Backend (Flask)
- **Database Models**: User, VerificationCode, APIKey
- **Authentication**: Session-based with secure cookies
- **Email Service**: Flask-Mail integration
- **Password Security**: bcrypt hashing
- **Role Management**: SuperAdmin, Admin, User roles

### Frontend (React)
- **Settings Component**: SuperAdmin control panel
- **Login Component**: Authentication with forgot password
- **Sidebar**: Dynamic menu based on user role
- **App Router**: Protected routes and authentication state

## Installation & Setup

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python create_admin_flask.py
python app.py
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```

### 3. Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
FERNET_KEY=your-encryption-key
```

## Usage Guide

### Initial Login
1. Start both backend and frontend servers
2. Navigate to the application
3. Login with SuperAdmin credentials:
   - **Email**: seme@kryptostack.com
   - **Password**: Seme0504

### SuperAdmin Operations

#### Change Password
1. Go to **Settings** tab (only visible to SuperAdmin)
2. Click **"Change Password"**
3. Click **"Send Verification Code"**
4. Check email for 6-digit code
5. Enter code and new password
6. Click **"Change Password"**

#### Create Admin Account
1. In **Settings**, click **"Create Admin"**
2. Fill in admin details:
   - Email address
   - Admin name
   - Temporary password
3. Click **"Create Admin"**
4. Check SuperAdmin email for confirmation code

#### Confirm Admin Account
1. In **Settings**, click **"Confirm Admin"**
2. Select the pending admin from dropdown
3. Enter the confirmation code from email
4. Click **"Confirm Admin"**
5. Admin will receive activation email

#### Delete Admin Account
1. In **Settings**, view the **Admin List**
2. Click **"Delete"** next to the admin
3. Confirm deletion

### Admin Operations

#### Login
1. Use the email and temporary password provided by SuperAdmin
2. Account must be confirmed by SuperAdmin first

#### Forgot Password
1. On login page, click **"Forgot your password?"**
2. Enter admin email address
3. Click **"Send Reset Code"**
4. Check email for 6-digit reset code
5. Enter code and new password
6. Click **"Reset Password"**

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/session` - Get current session

### SuperAdmin Only
- `POST /api/auth/request-password-change` - Request password change code
- `POST /api/auth/change-password` - Change SuperAdmin password
- `POST /api/auth/create-admin` - Create new admin account
- `POST /api/auth/confirm-admin` - Confirm admin account
- `DELETE /api/auth/delete-admin` - Delete admin account
- `GET /api/auth/list-admins` - List all admins

### Admin Password Reset
- `POST /api/auth/request-reset-code` - Request password reset code
- `POST /api/auth/verify-reset-code` - Reset password with code

## Security Features

### Password Security
- **bcrypt hashing**: All passwords are securely hashed
- **Minimum length**: 6 characters required
- **Verification**: Email codes required for password changes

### Session Management
- **Secure cookies**: Session data stored in encrypted cookies
- **Automatic cleanup**: Expired verification codes are removed
- **Role validation**: All endpoints validate user permissions

### Email Verification
- **10-minute expiration**: Codes expire automatically
- **Single use**: Codes can only be used once
- **Purpose-specific**: Different codes for different operations

## Database Schema

### User Table
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(120),
    password_hash VARCHAR(256) NOT NULL,
    is_superadmin BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    totp_secret VARCHAR(32),
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### VerificationCode Table
```sql
CREATE TABLE verification_code (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE
);
```

## Testing

Run the test script to verify the system:
```bash
python test_auth_system.py
```

This will test:
- SuperAdmin login
- Session management
- Admin creation
- Admin listing
- Password change requests
- Logout functionality
- Admin login blocking
- Forgot password functionality

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP settings in `.env`
   - Verify Gmail app password
   - Check firewall/network settings

2. **Login not working**
   - Ensure database is initialized
   - Check if SuperAdmin exists
   - Verify session cookies are enabled

3. **Settings tab not visible**
   - Confirm user is SuperAdmin
   - Check session is valid
   - Refresh the page

4. **Admin creation fails**
   - Verify SuperAdmin is logged in
   - Check email format
   - Ensure all fields are filled

### Debug Mode
Enable debug logging in the backend:
```python
app.run(debug=True, port=5000)
```

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure both backend and frontend are running
4. Test with the provided test script

## Security Notes

- **Change default password**: Always change the SuperAdmin password after first login
- **Secure email**: Use a secure email account for verification codes
- **Environment variables**: Never commit sensitive data to version control
- **Regular updates**: Keep dependencies updated for security patches 