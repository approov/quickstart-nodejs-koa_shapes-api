#!/bin/sh

set -eu

Show_Help() {
  cat <<EOF

  A bash script to deploy, via ssh, the Shapes server in a docker container, that
  is then served by Traefik.


  SYNOPSIS:

  $ ./deploy [options]


  OPTIONS:

  --env           Sets the deployment enviroment (defaults to dev):
                  $ ./deploy --env dev
                  $ ./deploy --env staging
                  $ ./deploy --env prod

  --from          Sets the git branch/tag for the release (defaults to master):
                  $ ./deploy --from master
                  $ ./deploy --from 1.0.0

  --from-current  Sets the release to the current git branch/tag:
                  $ ./deploy --from-current


  COMMANDS:

  logs            Tails the logs on the remote server:
                  $ ./deploy logs

EOF
}

SSH_Remote_Execute() {
  ssh \
    -p "${REMOTE_PORT}" \
    "${REMOTE_USER}"@"${REMOTE_ADDRESS}" "${1? Missing command to execute via SSH on the remote server...}"
}

SCP_Copy_To_Remote() {
  scp \
    -P "${REMOTE_PORT}" \
    "${1? Missing the file to copy with SCP to the remote server...}" \
    "${REMOTE_USER}"@"${REMOTE_ADDRESS}":"${REMOTE_APP_DIR}"
}

Docker_Build_Release() {
  sudo docker build \
    --file Dockerfile.prod \
    --build-arg "BUILD_RELEASE_FROM=${BUILD_RELEASE_FROM? Missing value for BUILD_RELEASE_FROM}" \
    --tag "${DOCKER_IMAGE}" \
    "${PWD}"
}

SSH_Remote_Docker_Load() {
  printf "\n---> Loading the docker image ${DOCKER_IMAGE} to ${REMOTE_USER}@${REMOTE_ADDRESS}:${REMOTE_PORT}\n"

  sudo docker \
    save "${DOCKER_IMAGE}" | gzip -6 | \
    ssh \
      -p "${REMOTE_PORT}" "${REMOTE_USER}"@"${REMOTE_ADDRESS}" \
      "gzip -d | sudo docker load"
}

Tail_Remote_Logs() {
  SSH_Remote_Execute "cd /home/ec2-user/staging.shapes.demo.approov.io && sudo docker-compose logs --follow node"
}

Main() {

  local RELEASE_ENV=dev
  local BASE_PUBLIC_DOMAIN=shapes.demo.approov.io
  local BUILD_RELEASE_FROM=master

  if [ -f ./.env ]; then
    . ./.env
  fi

  if [ -f ./.env.deploy ]; then
    . ./.env.deploy
  fi

  for input in "${@}"; do
    case "${input}" in
      --env )
        RELEASE_ENV="${2? Missing release env, e.g dev, staging, or prod}"
        shift 2
      ;;

      --from )
        BUILD_RELEASE_FROM="${2? Missing branch or tag to deploy from, e.g master or 1.0.0}"
        shift 2
      ;;

      --from-current )
        shift 1
        BUILD_RELEASE_FROM=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)
      ;;

      -h | --help )
        Show_Help
        exit $?
      ;;

      logs )
        Tail_Remote_Logs
        exit $?
      ;;

    esac
  done

  case "${RELEASE_ENV}" in
    "dev" | "staging" )
      local PUBLIC_DOMAIN="${RELEASE_ENV}.${BASE_PUBLIC_DOMAIN}"
    ;;

    "prod" )
      local PUBLIC_DOMAIN="${BASE_PUBLIC_DOMAIN},shapes.approov.io"
    ;;

    * )
      printf "\n---> ERROR: Invalid value for --env flag. Please provide one of dev, staging or prod\n\n"
      exit 1
  esac

  local REMOTE_HOME="/home/${REMOTE_USER? Missing env var REMOTE_USER}"

  local DATETIME=$(date +%s)

  local DOCKER_IMAGE="${APP_VENDOR}/${PUBLIC_DOMAIN}:${APP_NAME}-${DATETIME}"
  local REMOTE_APP_DIR="${REMOTE_HOME}/${PUBLIC_DOMAIN}"

  Docker_Build_Release

  SSH_Remote_Execute "mkdir -p ${REMOTE_APP_DIR}"

  SCP_Copy_To_Remote "docker-compose.yml"
  SCP_Copy_To_Remote ".env"
  SCP_Copy_To_Remote ".env.deploy"
  SCP_Copy_To_Remote ".env.default"

  SSH_Remote_Execute "cat ${REMOTE_APP_DIR}/.env.deploy >> ${REMOTE_APP_DIR}/.env"

  # Done this way because the docker image is using a timestamp in the tag.
  SSH_Remote_Execute "echo 'DOCKER_IMAGE=${DOCKER_IMAGE}' >> ${REMOTE_APP_DIR}/.env"
  SSH_Remote_Execute "echo 'PUBLIC_DOMAIN=${PUBLIC_DOMAIN}' >> ${REMOTE_APP_DIR}/.env"

  SSH_Remote_Docker_Load

  SSH_Remote_Execute "cd ${REMOTE_APP_DIR} && sudo docker-compose up --detach node"

  SSH_Remote_Execute "cd ${REMOTE_APP_DIR} && sudo docker-compose logs --tail 100"
}

Main "${@}"
