pipeline {
    agent any

    environment {
        COMPOSE = "docker compose"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'https://github.com/YOUR_USERNAME/YOUR_REPO.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                echo "Building Docker images..."
                docker compose build
                '''
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh '''
                echo "Stopping old containers..."
                docker compose down
                '''
            }
        }

        stage('Start New Containers') {
            steps {
                sh '''
                echo "Starting new containers..."
                docker compose up -d
                '''
            }
        }

        stage('Wait for Services') {
            steps {
                sh 'sleep 15'
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                echo "Checking API Gateway..."
                curl -f http://localhost:3000 || exit 1
                '''
            }
        }

        stage('Check Logs (Optional)') {
            steps {
                sh '''
                echo "Checking logs..."
                docker logs product-service --tail 20
                '''
            }
        }

        stage('Fail if Error Found') {
            steps {
                sh '''
                if docker logs product-service | grep -i error; then
                  echo "Error detected!"
                  exit 1
                fi
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful!'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}