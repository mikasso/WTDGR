#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0-buster-slim AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim AS build
WORKDIR /src
COPY Backend.Service/Backend.Service.csproj  ./Backend.Service/ 
COPY Backend.Core/Backend.Core.csproj ./Backend.Core/
COPY Backend.Models/Backend.Models.csproj  ./Backend.Models/
RUN dotnet restore Backend.Service/Backend.Service.csproj
COPY . .
WORKDIR "/src/Backend.Service"
RUN dotnet build "Backend.Service.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Backend.Service.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .