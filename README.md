# WTDGR
Współdzielona tablica do rysowania grafów - serwis działający na asp.net core z vue.js

# Docker setup
## Requirements
1. Install docker https://docs.docker.com/engine/install/ubuntu/
2. Install docker-compose `sudo apt-get install docker-compose` https://docs.docker.com/compose/install/

## Build and run
1. Go to root folder
2. Run `docker-compose build`
3. Run `docker-compose down`
4. Run `docker-compose up -d`
5. Frontend app will be available on http://localhost/ , backend on  http://localhost:5000

## Changing configuration
App can be lauched in two configuration modes: development and production. In order to set the production mode:
1. In <i>@\frontend\Dockerfile</i> change the value of "NODE_ENV" variable to "production"
2. In <i>@\docker-compose.yml</i> change the value of "ASPNETCORE_ENVIRONMENT" variable to "Production"
3. In <i>@\backend\Backend.Service\Properties\launchSettings.json</i> change the "applicationUrl" value to the address of production server
