#!/bin/sh

set -eu


Show_Help() {
  cat <<EOF

  DOCKER STACK CLI WRAPPER FOR DEVELOPMENT

  This bash script is a wrapper around docker-compose commands to build and run
  the nodejs server for the the docker-compose service "dev".

  SYNOPSIS:

  $ ./stack [options] <command> [args]


  OPTIONS:

  -h | --help   Shows this help.


  COMMANDS:

  build     Builds the docker image for the given service (defaults to dev):
            $ ./stack build
            $ ./stack build dev

  down      Terminates the running container for development:
            $ ./stack down

  logs      Tails the logs for the development container:
            $ ./stack logs

  reload    Terminates and starts again the development container:
            $ ./stack reload

  up        Starts the nodejs server for the dev service:
            $ ./stack up

  shell     Starts a shell in a running docker container:
            $ ./stack shell

EOF
}

Main() {

    for input in "${@}"; do
        case "${input}" in
            build)
                sudo docker-compose build "${2:-dev}"
                exit $?
                ;;

            down)
                sudo docker-compose down
                exit $?
                ;;

            logs)
                sudo docker-compose logs --follow dev
                exit $?
                ;;

            reload)
                sudo docker-compose down && sudo docker-compose up --detach dev
                exit $?
                ;;

            up)
                sudo docker-compose up --detach dev
                exit $?
                ;;

            shell)
                sudo docker-compose exec dev bash
                exit $?
                ;;

            -h | --help)
                Show_Help
                exit $?
                ;;
        esac
    done

    Show_Help
}

Main "${@}"
