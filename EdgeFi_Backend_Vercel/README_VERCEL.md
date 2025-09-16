EdgeFi Backend for Vercel - Quick Start

1. Deploy a MySQL database accessible from Vercel (PlanetScale, DigitalOcean, AWS RDS)
2. Push this project to GitHub
3. In Vercel, import the repo and deploy
4. Set environment variables in Vercel project settings using values from .env.example
5. Run the SQL in sql/edgefi_schema.sql against your cloud DB
6. Use /api/payments to create mocked payments and /api/webhook/mpesa to mark them completed

Notes:
- Serverless functions are stateless; use external DB and storage.
- For production STK Push, implement Daraja call in a secure server or cloud function.
