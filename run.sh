docker build --build-arg MONGODB_URI_ARG=${MONGO_DATABASE_URL} -t ala-laundry-backend:latest .
docker stop ala-laundry-backend
docker rm ala-laundry-backend
docker run -p 4343:4343 -p 8080:8080 -d --name ala-laundry-backend ala-laundry-backend:latest
