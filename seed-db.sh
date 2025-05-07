#!/bin/bash
# Script to seed the database with initial data

echo "Seeding database with initial data..."
npx tsx server/scripts/seed-db.ts

echo "Seed script execution complete."