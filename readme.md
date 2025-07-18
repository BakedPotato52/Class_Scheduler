# Class Scheduler

A comprehensive class scheduling application for educational institutions.

## Overview

Class Scheduler is designed to help schools, colleges, and universities efficiently manage and organize class schedules, room assignments, and teacher allocations.

## Features

- **Schedule Management**: Create and manage class schedules
- **Room Assignment**: Allocate classrooms and resources
- **Teacher Management**: Assign instructors to classes
- **Conflict Detection**: Automatically detect scheduling conflicts
- **Calendar Integration**: Export schedules to popular calendar formats
- **Reporting**: Generate detailed reports and analytics

## Installation

```bash
# Clone the repository
git clone https://github.com/BakedPotato52/Class_Scheduler.git

# Navigate to project directory
cd Class_Scheduler

# Install dependencies
npm install
```

## Usage

```bash
# Start the application
npm start

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Configuration

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY= 
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN =
NEXT_PUBLIC_FIREBASE_PROJECT_ID =
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 
NEXT_PUBLIC_FIREBASE_APP_ID = 
NEXT_PUBLIC_FIREBASE_VAPID_KEY= 

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## API Documentation

### Endpoints

- `DELETE /api/delete` - Delete schedule

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue on GitHub or contact [support@example.com](mailto:support@example.com).