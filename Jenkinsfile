pipeline {
    agent any

    environment {
        PROJECT_DIR = '.'                                 // Proyecto en la raíz
        NETWORK_NAME = 'alcaldiafetch_network'            // Red compartida con backend
        BUILD_DIR = 'dist'                                // Carpeta de salida del build Angular
    }

    stages {

        // ===============================
        // 1️⃣ CHECKOUT
        // ===============================
        stage('Checkout código fuente') {
            steps {
                echo "📥 Clonando repositorio PALERMO-PORTAL..."
                checkout scm
                sh 'ls -R DevOps || true'
            }
        }

        // ===============================
        // 2️⃣ DETECTAR ENTORNO
        // ===============================
        stage('Detectar entorno') {
            steps {
                script {
                    // Detección de entorno por rama
                    switch (env.BRANCH_NAME) {
                        case 'main':     env.ENVIRONMENT = 'prod'; break
                        case 'staging':  env.ENVIRONMENT = 'staging'; break
                        case 'qa':       env.ENVIRONMENT = 'qa'; break
                        default:         env.ENVIRONMENT = 'develop'; break
                    }

                    // Revisión de archivo .env global (si existe)
                    def globalEnvFile = "${env.PROJECT_DIR}/.env"
                    if (fileExists(globalEnvFile)) {
                        echo "📄 Detectado archivo .env global en ${globalEnvFile}"
                        def forcedEnv = sh(script: "grep '^ENVIRONMENT=' ${globalEnvFile} | cut -d '=' -f2", returnStdout: true).trim()
                        if (forcedEnv) {
                            env.ENVIRONMENT = forcedEnv
                            echo "⚙️ Entorno forzado desde .env global: ${env.ENVIRONMENT}"
                        }
                    }

                    // Variables derivadas del entorno
                    env.ENV_DIR = "DevOps/${env.ENVIRONMENT}"
                    env.COMPOSE_FILE = "${env.ENV_DIR}/docker-compose.yml"
                    env.ENV_FILE = "${env.ENV_DIR}/.env"

                    echo """
                    ✅ Rama detectada: ${env.BRANCH_NAME}
                    🌎 Entorno asignado: ${env.ENVIRONMENT}
                    📄 Compose file: ${env.COMPOSE_FILE}
                    📁 Env file: ${env.ENV_FILE}
                    """

                    if (!fileExists(env.COMPOSE_FILE)) {
                        error "❌ No se encontró el archivo ${env.COMPOSE_FILE}"
                    }
                }
            }
        }

        // ===============================
        // 3️⃣ VERIFICAR RED DOCKER
        // ===============================
        stage('Verificar red Docker') {
            steps {
                sh '''
                    if ! docker network inspect ${NETWORK_NAME} >/dev/null 2>&1; then
                        echo "⚙️ Creando red ${NETWORK_NAME}..."
                        docker network create ${NETWORK_NAME}
                    else
                        echo "✅ Red ${NETWORK_NAME} ya existente."
                    fi
                '''
            }
        }

        // ===============================
        // 4️⃣ CONSTRUIR IMAGEN DOCKER FRONTEND
        // ===============================
        stage('Construir imagen Docker Frontend') {
            steps {
                dir(env.PROJECT_DIR) {
                    script {
                        // Selecciona Dockerfile según entorno
                        def dockerfileToUse = (env.ENVIRONMENT == 'develop') ? : 'Dockerfile'

                        echo "🐳 Construyendo imagen Docker para PALERMO-PORTAL (${ENVIRONMENT}) usando ${dockerfileToUse}..."

                        sh """
                            docker build \
                                -t palermo-portal-front-${ENVIRONMENT}:latest \
                                -f ${dockerfileToUse} \
                                --build-arg NG_ENV=${ENVIRONMENT} .
                        """
                    }
                }
            }
        }

        // ===============================
        // 5️⃣ DESPLEGAR CON DOCKER COMPOSE
        // ===============================
        stage('Desplegar PALERMO-PORTAL Frontend') {
            steps {
                dir(env.PROJECT_DIR) {
                    sh '''
                        echo "🚀 Desplegando entorno Frontend: ${ENVIRONMENT}"
                        docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE} up -d --build
                    '''
                }
            }
        }
    }

    // ===============================
    // 🎯 POST ACTIONS
    // ===============================
    post {
        success {
            echo "✅ Despliegue exitoso: PALERMO-PORTAL Frontend (${env.ENVIRONMENT})"
        }
        failure {
            echo "💥 Error en el despliegue del Frontend (${env.ENVIRONMENT})"
        }
        always {
            echo "🧹 Pipeline finalizado para entorno: ${env.ENVIRONMENT}"
        }
    }
}
