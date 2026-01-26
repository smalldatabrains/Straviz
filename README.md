# Straviz : Everywhere you've been!

## Setup  
Create a .env file at the root of the projet and populate it with your information

Launch the application with docker

docker compose up --build

Populate the database with your Strava database

docker exec -it straviz-backend-1 scripts/sync_db.py  

```
```

## Navigation

Just paste your strava access token in the /backend/.env file and you're good to go! (rename the file to .env)

![alt text](image.png)

![alt text](image-1.png)
