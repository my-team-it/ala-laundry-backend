docker pull realsleep/ala-laundry-backend-test:latest
docker stop ala-laundry-backend
docker rm ala-laundry-backend
docker image prune
docker run -p 443:443 -p 80:80 -d --name ala-laundry-backend realsleep/ala-laundry-backend-test:latest