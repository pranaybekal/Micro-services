pipeline {
    agent any

    environment {
        COMPOSE = "docker-compose"
        APP_URL = "http://localhost:3000"
        PROMETHEUS_URL = "http://localhost:9090"
        LOKI_URL = "http://localhost:3100"
        GRAFANA_URL = "http://localhost:3006" 
    }

    stages {

        stage('1. Checkout Code') {
            steps {
                echo "✅ Code fetched from Project_final branch by Jenkins SCM"
            }pipeline {
    agent any

    environment {
        COMPOSE = "docker compose"
        PROJECT_NAME = "microservices"
    }

    stages {

        stage('1. Checkout Code') {
            steps {
                echo "Cloning repository..."
                git 'https://github.com/pranaybekal/Micro-services.git'
            }
        }

        stage('2. Show Project Structure') {
            steps {
                sh '''
                echo "Listing project files..."
                ls -la
                '''
            }
        }

        stage('3. Build All Services') {
            steps {
                sh '''
                echo "Building Docker images..."
                docker compose build
                '''
            }
        }

        stage('4. Stop Old Deployment') {
            steps {
                sh '''
                echo "Stopping old containers..."
                docker compose down
                '''
            }
        }

        stage('5. Deploy New Version') {
            steps {
                sh '''
                echo "Starting all services..."
                docker compose up -d
                '''
            }
        }

        stage('6. Wait for Services') {
            steps {
                sh 'sleep 20'
            }
        }

        stage('7. Health Check') {
            steps {
                sh '''
                echo "Checking API Gateway..."
                curl -f http://localhost:3000 || exit 1
                '''
            }
        }

        stage('8. Check Logs (Debug)') {
            steps {
                sh '''
                echo "Checking service logs..."
                docker logs user-service --tail 20 || true
                docker logs product-service --tail 20 || true
                '''
            }
        }

        stage('9. Error Detection') {
            steps {
                sh '''
                echo "Checking for errors in logs..."
                if docker logs product-service | grep -i error; then
                    echo "Error found in product-service"
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
        }

        stage('2. Show Project Structure') {
            steps {
                sh '''
                echo "📁 Project files:"
                ls -la
                '''
            }
        }

        stage('3. Build Docker Images') {
            steps {
                sh '''
                echo "🐳 Building all microservices..."
                docker-compose build
                '''
            }
        }

        stage('4. Stop Old Containers') {
            steps {
                sh '''
                echo "🛑 Stopping old containers..."
                docker-compose down || true
                '''
            }
        }

        stage('5. Deploy Microservices') {
            steps {
                sh '''
                echo "🚀 Starting new deployment..."
                docker-compose up -d
                '''
            }
        }

        stage('6. Wait for Services') {
            steps {
                sh '''
                echo "⏳ Waiting for services to start..."
                sleep 25
                '''
            }
        }

        stage('7. Health Check (API Gateway)') {
            steps {
                sh '''
                echo "🔍 Checking API Gateway..."
                curl -f $APP_URL || exit 1
                '''
            }
        }

        stage('8. Verify Metrics (Prometheus)') {
            steps {
                sh '''
                echo "📊 Checking Prometheus..."
                curl -f $PROMETHEUS_URL/-/ready || exit 1
                '''
            }
        }

        stage('9. Verify Logs (Loki)') {
            steps {
                sh '''
                echo "📜 Checking Loki..."
                curl -f $LOKI_URL/ready || exit 1
                '''
            }
        }

        stage('10. Check Logs (Debug)') {
            steps {
                sh '''
                echo "📄 Showing recent logs..."
                docker-compose logs user-service --tail=20 || true
                docker-compose logs product-service --tail=20 || true
                '''
            }
        }

        stage('11. Error Detection') {
            steps {
                sh '''
                echo "🚨 Checking for errors in logs..."

                if docker-compose logs product-service | grep -i error; then
                    echo "❌ Error found in product-service logs"
                    exit 1
                else
                    echo "✅ No errors found"
                fi
                '''
            }
        }

    }

    post {
        success {
            echo '🎉 CI/CD Pipeline SUCCESS - Deployment + Monitoring Verified!'
        }
        failure {
            echo '❌ CI/CD Pipeline FAILED - Check logs above!'
        }
    }
}
