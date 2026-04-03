# Use the slim (alpine) Maven image as build
FROM maven:3.5-jdk-8-alpine AS build

# Set the container application directory to /code
WORKDIR /code
# ~~~ Installation des dépendances ~~~

# Copy pom.xml from the current folder to /code/pom.xml in the container
COPY pom.xml .
# Execute the following commands in the container :
# mvn dependency:resolve
RUN mvn dependency:resolve
# mvn verify
RUN mvn verify
# ~~~ Installation des sources ~~~

# Copy src/main folder to /code/src/main folder in the container
COPY src src
# Execute the command "mvn package" in the container
RUN mvn package
# ~~~ Exécution de l'application ~~~

# Now change the base Docker image to openjdk 8 (you can use the jre alpine version to improve performance)
FROM eclipse-temurin:21-jre-alpine
# Copy from the 'build' container the produced jar : /code/target/worker-jar-with-dependencies.jar in the root path of this container : /
COPY --from=build /code/target/worker-jar-with-dependencies.jar /worker.jar
# Define the command to be run when launching the container
CMD ["java", "-jar", "worker.jar"]