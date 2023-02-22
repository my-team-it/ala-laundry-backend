git pull
docker build --build-arg MONGODB_URI=${MONGODB_URI} -t ala-laundry-backend:latest .
docker stop ala-laundry-backend
docker rm ala-laundry-backend
docker run -p 8080:8080 -d --name ala-laundry-backend ala-laundry-backend:latest