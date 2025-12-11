pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE_NAME = 'vite-react-app'
        DOCKER_IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'index.docker.io' // Add your Docker registry URL if needed (e.g., 'docker.io/username')
        EMAIL_RECIPIENTS = 'rhannif100@gmail.com' // Update with actual email
    }
    
    tools {
        nodejs "nodejs-24"
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    // Only build from testing branch
                    if (env.BRANCH_NAME != 'testing') {
                        error("Pipeline only runs on 'testing' branch. Current branch: ${env.BRANCH_NAME}")
                    }
                }
                checkout scm
                echo "Checked out branch: ${env.BRANCH_NAME}"
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                sh 'npm ci'
            }
        }
        
        stage('Run Linting Tests') {
            steps {
                echo 'Running ESLint tests...'
                sh 'npm run lint'
            }
        }
        
        stage('Build Application') {
            steps {
                echo 'Building application in development mode...'
                sh 'npm run build:dev'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                    
                    // Build Docker image
                    if (env.DOCKER_REGISTRY) {
                        docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}")
                        docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest")
                    } else {
                        docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}")
                        docker.build("${DOCKER_IMAGE_NAME}:latest")
                    }
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    echo 'Pushing Docker image to registry...'
                    
                    if (env.DOCKER_REGISTRY) {
                        docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-credentials-id') {
                            def image = docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}")
                            image.push()
                            image.push('latest')
                        }
                    } else {
                        echo 'No registry configured. Image built locally.'
                    }
                }
            }
        }
        
        stage('Deploy Container') {
            steps {
                script {
                    echo 'Deploying Docker container...'
                    
                    // Stop and remove existing container if running
                    sh '''
                        docker stop ${DOCKER_IMAGE_NAME} || true
                        docker rm ${DOCKER_IMAGE_NAME} || true
                    '''
                    
                    // Run new container
                    def imageName = env.DOCKER_REGISTRY ? "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" : "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                    sh """
                        docker run -d \
                            --name ${DOCKER_IMAGE_NAME} \
                            -p 3000:80 \
                            --restart unless-stopped \
                            ${imageName}
                    """
                    
                    echo 'Container deployed successfully on port 3000'
                }
            }
        }
    }
    
    post {
        success {
            emailext (
                subject: "✅ Jenkins Build SUCCESS: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                body: """
                    <h2>Build Successful!</h2>
                    <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Docker Image:</strong> ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}</p>
                    <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                    <p><a href="${env.BUILD_URL}">View Build Details</a></p>
                """,
                to: "${EMAIL_RECIPIENTS}",
                mimeType: 'text/html'
            )
        }
        
        failure {
            emailext (
                subject: "❌ Jenkins Build FAILED: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                body: """
                    <h2>Build Failed!</h2>
                    <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                    <p><strong>Error:</strong> Check the console output for details.</p>
                    <p><a href="${env.BUILD_URL}console">View Console Output</a></p>
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