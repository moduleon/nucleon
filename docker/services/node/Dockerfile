#
# For the webserver, we choose to use Nginx (pronounced "en-jay-nix") based
# on Alpine kernel.
#
FROM        node:8-alpine
MAINTAINER  Kevin Marcachi <kevin.marcachi@gmail.com>

#
# Here, we create working directory that will host application files.
#
RUN         mkdir -p /app/node_modules
COPY        . /app
RUN         chmod -R 755 /app/node_modules

#
# Finally, we setup working directory and volumes.
#
VOLUME      /app
WORKDIR     /app
