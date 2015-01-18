# https://registry.hub.docker.com/_/node/
FROM node:0.10.35

# Install apt deps
RUN apt-get update \
    && apt-get install -y wget unzip libelf1

# Get latest Flow binary
RUN wget http://flowtype.org/downloads/flow-linux64-latest.zip
# ...or get a specific version
#COPY flow-linux64-v0.1.4.zip /flow-linux64-latest.zip

# Install Flow to PATH
RUN unzip flow-linux64-latest.zip \
    && mv flow/flow /usr/local/bin
# http://stackoverflow.com/a/27427352
ENV USER=root

# Install flotate
RUN npm install -g flotate@0.1.0

# Mark the volume for source to be analyzed
VOLUME ["/src"]
WORKDIR /src

# Configure the default command
ENTRYPOINT ["flotate"]
CMD ["check"]