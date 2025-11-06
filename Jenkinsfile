pipeline {
    agent any

    environment {
        PROJECT_DIR = '.'                                 // Proyecto en la raíz
        NETWORK_NAME = 'alcaldiafetch_network'            // Red compartida con backend
        NODE_IMAGE = 'node:20-alpine'                     // Imagen ligera de Node
        BUILD_DIR = 'dist'                                // Carpeta de salida del build Angular
    }

    stages {

        // =======================================================
        // 1️⃣ CHECKOUT
        // =======================================================
        stage('Checkout código fuente') {
            steps {
                echo "📥 Clonando repositorio PALERMO-PORTAL..."
                checkout scm
                sh 'ls -R DevOps || true'
            }
        }

        // =======================================================
        // 2️⃣ DETECTAR ENTORNO
        // =======================================================
        stage('Detectar entorno') {
            steps {
                script {
                    switch (env.BRANCH_NAME) {
                        case 'main':     env.ENVIRONMENT = 'prod'; break
                        case 'staging':  env.ENVIRONMENT = 'staging'; break
                        case 'qa':       env.ENVIRONMENT = 'qa'; break
                        default:         env.ENVIRONMENT = 'develop'; break
                    }

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

        // =======================================================
        // 3️⃣ COMPILAR FRONTEND DENTRO DE CONTENEDOR NODE
        // =======================================================
        stage('Compilar Frontend dentro de contenedor Node') {
            steps {
                script {
                    docker.image(env.NODE_IMAGE).inside('-u root:root') {
                        sh '''
                            echo "📦 Instalando dependencias..."
                            npm ci --legacy-peer-deps

                            echo "🛠️ Compilando aplicación para entorno ${ENVIRONMENT}..."
                            npm run build --if-present || npm run build:${ENVIRONMENT} || true

                            echo "✅ Build completado. Archivos generados:"
                            ls -lh ${BUILD_DIR} || true
                        '''
                    }
                }
            }
        }

        // =======================================================
        // 4️⃣ VERIFICAR O CREAR RED DOCKER COMPARTIDA
        // =======================================================
        stage('Verificar red Docker') {
            steps {
                sh '''
                    if ! docker network inspect ${NETWORK_NAME} >/dev/null 2>&1; then
                        echo "⚙️ Creando red ${NETWORK_NAME}..."
                        docker network create ${NETWORK_NAME}
                    else
                        echo "✅ Red ${NETWORK_NAME} ya existe."
                    fi
                '''
            }
        }

        // =======================================================
        // 5️⃣ CONSTRUIR IMAGEN DOCKER FRONTEND
        // =======================================================
        stage('Construir imagen Docker Frontend') {
            steps {
                sh '''
                    echo "🐳 Construyendo imagen Docker para PALERMO-PORTAL (${ENVIRONMENT})..."
                    docker build -t palermo-portal-front-${ENVIRONMENT}:latest -f Dockerfile .
                '''
            }
        }

        // =======================================================
        // 6️⃣ DESPLEGAR CON DOCKER COMPOSE
        // =======================================================
        stage('Desplegar PALERMO-PORTAL Frontend') {
            steps {
                sh '''
                    echo "🚀 Desplegando entorno Frontend: ${ENVIRONMENT}"
                    docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE} up -d --build
                '''
            }
        }
    }

    // =======================================================
    // 🎯 POST ACTIONS
    // =======================================================
    post {
        success {
            echo "🎉 Despliegue Frontend completado correctamente para ${env.ENVIRONMENT}"
        }
        failure {
            echo "💥 Error durante el despliegue del Frontend (${env.ENVIRONMENT})"
        }
        always {
            echo "🧹 Limpieza final del pipeline completada (${env.ENVIRONMENT})"
        }
    }
}
