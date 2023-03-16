echo ${MONGO_DATABASE_URL}
sudo docker build -t ala-laundry-backend:latest .
docker stop ala-laundry-backend
docker rm ala-laundry-backend
docker run -p 4343:4343 -p 8080:8080 -e MONGO_DATABASE_URL=${MONGO_DATABASE_URL} -d --name ala-laundry-backend ala-laundry-backend:latest
