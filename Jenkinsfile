pipeline {
    agent any
    
    tools {
        nodejs 'nodejs-24'
    }
    
    environment {
        DOCKER_IMAGE_NAME = 'nodejs-react-app-demo'
        DOCKER_IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'index.docker.io'
        EMAIL_RECIPIENTS = 'rhannif100@gmail.com'
    }

    stages {
        stage('Pipeline for testing only') {
            when {
                branch 'testing'
            }
            stages {

                stage('Checkout') {
                    steps {
                        echo "Checking out code from branch: ${env.BRANCH_NAME}"
                        checkout scm
                    }
                }

                stage('Install Dependencies') {
                    steps {
                        echo 'Installing npm dependencies...'
                        sh 'node --version'
                        sh 'npm --version'
                        sh 'npm ci'
                    }
                }

                stage('Lint') {
                    steps {
                        echo 'Running ESLint...'
                        sh 'npm run lint'
                    }
                }

                stage('Build') {
                    steps {
                        echo 'Building the application in development mode...'
                        sh 'npm run build:dev'
                    }
                }

                stage('Build Docker Image') {
                    steps {
                        echo "Building Docker image: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                        script {
                            docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}")
                            docker.build("${DOCKER_IMAGE_NAME}-latest")
                        }
                    }
                }

                stage('Push Docker Image') {
                    steps {
                        echo "Pushing Docker image to registry..."
                        script {
                            docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-credentials-id') {
                                docker.image("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}").push()
                                docker.image("${DOCKER_IMAGE_NAME}-latest").push()
                            }
                        }
                    }
                }

                stage('Deploy') {
                    steps {
                        echo "Deploying application for testing..."
                        script {
                            sh """
                                docker stop ${DOCKER_IMAGE_NAME}-testing || true
                                docker rm ${DOCKER_IMAGE_NAME}-testing || true
                                docker run -d \
                                    --name ${DOCKER_IMAGE_NAME}-testing \
                                    -p 8081:80 \
                                    ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                            """
                        }
                    }
                }

                stage('Health Check') {
                    steps {
                        echo 'Performing health check...'
                        script {
                            retry(3) {
                                sleep 5
                                sh "docker ps | grep ${DOCKER_IMAGE_NAME}-testing"
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            when {
                branch 'testing'
            }
            echo 'Pipeline completed successfully!'
            emailext(
                subject: "SUCCESS: Jenkins Build ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h2>Build Successful (testing)</h2>
                    <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Docker Image:</strong> ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}</p>
                    <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                """,
                to: "${EMAIL_RECIPIENTS}",
                mimeType: 'text/html'
            )
        }
        
        failure {
            when {
                branch 'testing'
            }
            echo 'Pipeline failed!'
            emailext(
                subject: "FAILURE: Jenkins Build ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h2>Build Failed (testing)</h2>
                    <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p>Please check the console output for details.</p>
                """,
                to: "${EMAIL_RECIPIENTS}",
                mimeType: 'text/html'
            )
        }

        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
