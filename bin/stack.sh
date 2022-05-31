#!/bin/sh

set -eu

Show_Help() {
    echo && cat ./docs/docker-stack-usage-help.txt && echo
}

Build_Docker_Image() {
  sudo docker build --network host -t "${DOCKER_IMAGE:-approov2/shapes-node-koa:dev}" .
}

Create_Docker_Container() {

    local _command="${1:-zsh}"
    local _user="${2? Missing user name or uid for the container we want to stop!!!}"
    local _port="${3? Missing http port for the container we want to stop!!!}"
    local _container_name="nodejs-koa-dev"

    sudo docker run \
        -it \
        --rm \
        --user "${_user}" \
        --env-file .env \
        --env "HTTP_PORT=${_port}" \
        --name "${_container_name}" \
        --publish "127.0.0.1:${_port}:${_port}" \
        --workdir "/home/node/app" \
        --volume "$PWD:/home/node/app" \
        "${DOCKER_IMAGE:-approov2/shapes-node-koa:dev}" ${_command}
}

Stop_Docker_Container() {
    local _user="${1? Missing user name or uid for the container we want to stop!!!}"
    local _port="${2? Missing http port for the container we want to stop!!!}"
    local _container_name="nodejs-koa-dev"

    sudo docker container stop "${_container_name}"
}

Main() {
    local CONTAINER_USER="$(id -u)"

    local HTTP_PORT=8002

    local shell_user=node

    if [ ! -f ./.env ]; then
        printf "\n---> Missing the .env file. Please follow the instructions at:\n\nhttps://github.com/approov/quickstart-nodejs-koa_shapes-api#configure-the-environment\n\n"
        exit 1
    fi

    # source all the environment variables to be available in the script
    . ./.env

    if [ -z "${DOCKER_IMAGE+x}" ]; then
        printf "\n---> Missing value for DOCKER_IMAGE env var.\n\n"
        exit 1
    fi

    for input in "${@}"; do
        case "${input}" in
            build)
                Build_Docker_Image
                exit 0
                ;;
            -p | --port)
                HTTP_PORT="${2? Missing HTTP port to access the container in localhost}"
                shift 2
                ;;
            -u | --user)
                CONTAINER_USER="${2? Missing user name or uid to use inside the container}"
                shift 2
                ;;
            up)
                Create_Docker_Container "npm start" "${CONTAINER_USER}" "${HTTP_PORT}"
                exit 0
                ;;
            stop)
                Stop_Docker_Container "${CONTAINER_USER}" "${HTTP_PORT}"
                exit 0
                ;;
            shell)
                Create_Docker_Container "${2:-bash}" "${CONTAINER_USER}" "${HTTP_PORT}"
                exit 0
                ;;
            -h | --help)
                Show_Help
                exit 0
                ;;
        esac
    done

    Show_Help
}

Main "${@}"
