docker pull realsleep/ala-laundry-backend:latest
docker stop ala-laundry-backend
docker rm ala-laundry-backend
docker run -p 443:443 -p 80:80 -e MONGO_DATABASE_URL=${MONGO_DATABASE_URL} -d --name ala-laundry-backend realsleep/ala-laundry-backend:latest