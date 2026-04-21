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
                echo "✅ Code already checked out by Jenkins SCM"
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
                echo "🐳 Building all services..."
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

        stage('5. Deploy Services') {
            steps {
                sh '''
                echo "🚀 Starting services..."
                docker-compose up -d
                '''
            }
        }

        stage('6. Wait for Services') {
            steps {
                sh 'sleep 25'
            }
        }

        stage('7. Health Check') {
            steps {
                sh '''
                echo "🔍 Checking API..."
                curl -f $APP_URL || exit 1
                '''
            }
        }

        stage('8. Verify Prometheus') {
            steps {
                sh 'curl -f $PROMETHEUS_URL/-/ready || exit 1'
            }
        }

        stage('9. Verify Loki') {
            steps {
                sh 'curl -f $LOKI_URL/ready || exit 1'
            }
        }

        stage('10. Verify Grafana') {
            steps {
                sh 'curl -f $GRAFANA_URL/login || exit 1'
            }
        }

        stage('11. Check Logs') {
            steps {
                sh '''
                docker-compose logs user-service --tail=20 || true
                docker-compose logs product-service --tail=20 || true
                '''
            }
        }

        stage('12. Error Detection') {
            steps {
                sh '''
                if docker-compose logs product-service | grep -i error; then
                    echo "❌ Error found"
                    exit 1
                else
                    echo "✅ No errors"
                fi
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 SUCCESS - CI/CD + Monitoring Working!'
        }
        failure {
            echo '❌ FAILED - Check logs'
        }
    }
}
