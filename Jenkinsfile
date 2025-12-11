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

        stage('Checkout') {
            when { branch 'testing' }
            steps {
                echo "Checking out branch: ${env.BRANCH_NAME}"
                checkout scm
            }
        }

        stage('Install Dependencies') {
            when { branch 'testing' }
            steps {
                echo 'Installing npm dependencies...'
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            when { branch 'testing' }
            steps {
                echo 'Running ESLint...'
                sh 'npm run lint'
            }
        }

        stage('Build') {
            when { branch 'testing' }
            steps {
                echo 'Building the application...'
                sh 'npm run build:dev'
            }
        }

        stage('Build Docker Image') {
            when { branch 'testing' }
            steps {
                echo "Building Docker image..."
                script {
                    docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}")
                    docker.build("${DOCKER_IMAGE_NAME}-latest")
                }
            }
        }

        stage('Push Docker Image') {
            when { branch 'testing' }
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
            when { branch 'testing' }
            steps {
                echo "Deploying application..."
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
            when { branch 'testing' }
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

    post {
        success {
            echo 'Pipeline completed successfully!'
            script {
                if (env.BRANCH_NAME == "testing") {
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
            }
        }

        failure {
            echo 'Pipeline failed!'
            script {
                if (env.BRANCH_NAME == "testing") {
                    emailext(
                        subject: "FAILURE: Jenkins Build ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
                            <h2>Build Failed (testing)</h2>
                            <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                            <p>Please check console output for details.</p>
                        """,
                        to: "${EMAIL_RECIPIENTS}",
                        mimeType: 'text/html'
                    )
                }
            }
        }

        always {
            echo 'Cleaning workspace...'
            cleanWs()
        }
    }
}
