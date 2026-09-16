# Build the Java source with a JDK. No Maven, npm or extra libraries are required.
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY src/ ./src/
COPY tests/StudentStoreTest.java ./tests/StudentStoreTest.java
RUN mkdir -p build \
    && javac --release 17 --add-modules jdk.httpserver -encoding UTF-8 -Xlint:all -d build src/*.java tests/StudentStoreTest.java \
    && java -cp build StudentStoreTest \
    && rm -f build/StudentStoreTest*.class

# Only compiled code and public web files are copied into the runtime image.
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN groupadd --system scoredesk && useradd --system --gid scoredesk --no-create-home scoredesk
COPY --from=builder /app/build/ ./build/
COPY web/ ./web/
ENV PORT=10000 BIND_ADDRESS=0.0.0.0
USER scoredesk
EXPOSE 10000
CMD ["java", "-Xms32m", "-Xmx256m", "--add-modules", "jdk.httpserver", "-cp", "build", "StudentServer"]
