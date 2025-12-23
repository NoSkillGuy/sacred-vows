FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        wget && \
    # Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    # Clean up apt cache
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install firebase-tools globally
RUN npm install -g firebase-tools

# Default command - project will be set via GCLOUD_PROJECT environment variable
CMD ["sh", "-c", "firebase emulators:start --only firestore,ui --project $GCLOUD_PROJECT"]

