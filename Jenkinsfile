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

        stage('4. Stop Old Containers (Clean)') {
            steps {
                sh '''
                echo "🛑 Cleaning old containers..."

                # Stop docker-compose services
                docker-compose down || true

                # Remove conflicting containers (important fix)
                docker rm -f grafana promtail otel-collector || true

                # Clean unused Docker resources
                docker system prune -f || true
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
                sh '''
                echo "⏳ Waiting for services..."
                sleep 25
                '''
            }
        }

        stage('7. Health Check (API)') {
            steps {
                sh '''
                echo "🔍 Checking API Gateway..."
                curl -f $APP_URL/metrics || exit 1
                '''
            }
        }

        stage('8. Verify Prometheus (Metrics)') {
            steps {
                sh '''
                echo "📊 Checking Prometheus..."
                curl -f $PROMETHEUS_URL/-/ready || exit 1
                '''
            }
        }

        stage('9. Verify Loki (Logs)') {
            steps {
                sh '''
                echo "📜 Waiting for Loki to be ready..."
        
                for i in {1..10}; do
                    if curl -f $LOKI_URL/ready; then
                        echo "✅ Loki is ready"
                        exit 0
                    fi
                    echo "⏳ Loki not ready yet... retrying"
                    sleep 5
                done
        
                echo "❌ Loki failed to start"
                exit 1
                '''
            }
        }

        stage('10. Verify Grafana (Dashboard)') {
            steps {
                sh '''
                echo "📈 Checking Grafana..."
                curl -f $GRAFANA_URL/login || exit 1
                '''
            }
        }

        stage('11. Check Logs (Debug)') {
            steps {
                sh '''
                echo "📄 Recent logs..."
                docker-compose logs user-service --tail=20 || true
                docker-compose logs product-service --tail=20 || true
                '''
            }
        }

        stage('12. Error Detection') {
            steps {
                sh '''
                echo "🚨 Checking for errors..."

                if docker-compose logs product-service | grep -i error; then
                    echo "❌ Error found in logs"
                    exit 1
                else
                    echo "✅ No errors detected"
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
            echo '❌ FAILED - Check logs above!'
        }
    }
}
