#/bin/bash

docker build -t pigonbot .

# replace chatbot if you want to rename the container
docker run --env-file .env --name chatbot --mount type=bind,src=.,dst=/data,rw pigonbot
