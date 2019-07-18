#!/bin/sh

set -eu

Main()
{
    for input in  in "${@}"; do
        case "${input}" in
            build )
                sudo docker build --tag approov2/shapes-node-koa .
            ;;

            up )
                sudo docker run \
                    --rm \
                    -it \
                    --name shapes-node-koa \
                    --publish  5000:5000 \
                    --publish  8003:8003 \
                    --volume $PWD/.env:/home/node/app/.env \
                    --volume $PWD/server:/home/node/app/server \
                    approov2/shapes-node-koa

                exit 0
            ;;

            shell )
                sudo docker exec \
                    -it \
                    shapes-node-koa \
                    bash
            ;;
        esac
    done
}

Main "${@}"
