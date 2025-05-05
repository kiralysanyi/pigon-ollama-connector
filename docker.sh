#/bin/bash

docker build -t pigonbot .

# replace chatbot if you want to rename the container
docker run -d --env-file .env --name chatbot --mount type=bind,source=./data,target=/data pigonbot

