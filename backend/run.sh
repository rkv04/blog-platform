#! /bin/sh

echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done

echo "Running migrations..."
npm run db:migrate 

echo "Starting server..."
npm run dev