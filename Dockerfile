FROM ubuntu:latest
LABEL authors="nikolai"

ENTRYPOINT ["top", "-b"]
