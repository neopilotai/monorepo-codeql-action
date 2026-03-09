FROM node:20-alpine

LABEL maintainer="khulnasoft"
LABEL description="Monorepo CodeQL Action - Docker image for running CodeQL analysis on monorepos"

# Install dependencies
RUN apk add --no-cache \
    git \
    curl \
    bash \
    python3 \
    make \
    g++

# Install CodeQL
ENV CODEQL_VERSION=2.14.0
ENV CODEQL_DIR=/opt/codeql
ENV PATH="$CODEQL_DIR:$PATH"

RUN curl -L -o codeql-linux64.zip "https://github.com/github/codeql-action/releases/download/codeql-bundle-${CODEQL_VERSION}/codeql-linux64.zip" && \
    unzip -q codeql-linux64.zip -d /opt/ && \
    mv /opt/codeql $CODEQL_DIR && \
    rm codeql-linux64.zip

# Install action dependencies
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production

# Copy actions
COPY actions/ ./actions/

# Create directories
RUN mkdir -p /app/sarif /app/output

# Set environment
ENV GITHUB_TOKEN=""
ENV ACTIONS_RUNNER_DEBUG=false

# Entry point
ENTRYPOINT ["node", "actions/shared/utilities.js"]

CMD ["node", "--help"]
