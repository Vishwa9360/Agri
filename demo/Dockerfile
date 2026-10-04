# Build Stage
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper and dependencies specification
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Download dependencies in offline layer
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B || true

# Copy source code and build runnable fat JAR
COPY src src
RUN ./mvnw clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Non-root user for security best practice
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
