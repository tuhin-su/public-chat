FROM node:lts-alpine

ARG HOST_UID

ENV CHROME_BIN='/usr/bin/chromium-browser'

RUN deluser --remove-home node \
  && addgroup -S vscode -g 1000 \
  && adduser -S -G vscode -u 1000 vscode

WORKDIR /app

USER vscode

CMD ["sleep", "infinity"]