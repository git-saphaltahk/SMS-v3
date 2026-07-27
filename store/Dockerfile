# ---- Backend Build Stage ----
FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace
COPY backend/pom.xml ./pom.xml
RUN mvn -q -DskipTests dependency:go-offline
COPY backend/src ./src
RUN mvn -q -DskipTests package

# ---- Frontend Build Stage ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Package Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /workspace/backend/target/mystore-0.0.1-SNAPSHOT.jar /app/app.jar
COPY --from=frontend-build /app/frontend/dist /app/static

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.profiles.active=h2"]
