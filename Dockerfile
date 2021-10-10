FROM node:12.2.0-alpine as build

WORKDIR /app/frontend
ENV PATH /app/frontend/node_modules/.bin:$PATH
COPY /frontend/package.json /app/frontend/package.json
RUN npm install --silent
COPY /frontend /app/frontend
RUN (npm run serve&)

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env
WORKDIR /app

COPY /backend ./
WORKDIR /app/backend
RUN dotnet publish /app/backend/backend.sln -c Release -o out

WORKDIR /app/backend/out
ENTRYPOINT ["dotnet", "Backend.Service.dll"]