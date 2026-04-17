# MyHotel Backend

Structured Node backend for the hotel booking application.

## Folders

- `config/` - environment and database setup
- `middleware/` - request helpers
- `models/` - hotel, booking, and payment data access
- `routes/` - API route handlers
- `utils/` - PDF and helper utilities

## Run

```powershell
npm install
npm run dev
```

## Database

The backend supports:

- local JSON fallback
- MongoDB Atlas with `.env`

Use `.env.example` as your template.

Create `backend/.env` like this:

```env
MONGODB_URI=mongodb+srv://YOUR_DB_USERNAME:YOUR_DB_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=myhotel
```

## API

- `GET /api/health`
- `GET /api/hotels`
- `POST /api/bookings`
- `POST /api/payments`
- `GET /api/bookings/:id`
- `GET /api/bookings/:id/ticket`
