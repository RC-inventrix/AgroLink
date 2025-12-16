# Stage 1: Build the JAR file
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Skip tests to speed up the build
RUN mvn clean package -DskipTests -Dhttp.keepAlive=false -Dmaven.wagon.http.pool=false -Dmaven.wagon.http.retryHandler.count=3

# Stage 2: Run the application
# CHANGED: Switched from 25-ea to 21-jdk (Stable LTS)
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]