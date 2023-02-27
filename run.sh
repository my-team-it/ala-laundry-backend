git pull
docker build --build-arg MONGODB_URI_ARG=${MONGO_DATABASE_URL} -t ala-laundry-backend:latest .
docker stop ala-laundry-backend
docker rm ala-laundry-backend
docker run -p 443:443 -d --name ala-laundry-backend ala-laundry-backend:latest