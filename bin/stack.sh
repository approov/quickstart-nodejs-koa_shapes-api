#!/bin/sh

set -eu

Show_Help()
{
    echo && cat ./docs/docker-stack-usage-help.txt && echo
}

Main()
{
    local shell_user=node

    for input in  in "${@}"; do
        case "${input}" in

            -h | --help )
                Show_Help
            ;;

            -u | --user )
                local shell_user=${2? Missing user name.}
            ;;

            build )
                sudo docker build --tag approov2/shapes-node-koa .

                exit 0
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
                    --user "${shell_user}" \
                    shapes-node-koa \
                    bash

                exit 0
            ;;
        esac
    done

    Show_Help
}

Main "${@}"
