#!/bin/bash

# Bridge Logistics Monitoring Script
# Мониторинг состояния приложения

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Конфигурация
APP_URL="http://localhost:3000"
HEALTH_ENDPOINT="/health"
METRICS_ENDPOINT="/metrics"
LOG_FILE="/tmp/bridge-monitor.log"

# Функции для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Проверка доступности приложения
check_health() {
    log "Проверка здоровья приложения..."
    
    if curl -f -s "$APP_URL$HEALTH_ENDPOINT" > /dev/null; then
        success "Приложение доступно"
        return 0
    else
        error "Приложение недоступно"
        return 1
    fi
}

# Проверка метрик
check_metrics() {
    log "Проверка метрик..."
    
    local response=$(curl -s "$APP_URL$METRICS_ENDPOINT" 2>/dev/null || echo "ERROR")
    
    if [ "$response" = "ERROR" ]; then
        warning "Метрики недоступны"
        return 1
    else
        success "Метрики получены"
        echo "$response" | head -20
        return 0
    fi
}

# Проверка использования ресурсов
check_resources() {
    log "Проверка использования ресурсов..."
    
    # CPU
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    log "CPU использование: ${cpu_usage}%"
    
    # Memory
    local memory_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
    log "Memory использование: ${memory_usage}%"
    
    # Disk
    local disk_usage=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
    log "Disk использование: ${disk_usage}%"
    
    # Проверка лимитов
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        warning "Высокое использование CPU: ${cpu_usage}%"
    fi
    
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        warning "Высокое использование Memory: ${memory_usage}%"
    fi
    
    if [ "$disk_usage" -gt 80 ]; then
        warning "Высокое использование Disk: ${disk_usage}%"
    fi
}

# Проверка логов на ошибки
check_logs() {
    log "Проверка логов на ошибки..."
    
    local error_count=$(grep -c "ERROR\|FATAL" /tmp/bridge-monitor.log 2>/dev/null || echo "0")
    
    if [ "$error_count" -gt 0 ]; then
        warning "Найдено $error_count ошибок в логах"
        grep "ERROR\|FATAL" /tmp/bridge-monitor.log | tail -5
    else
        success "Ошибок в логах не найдено"
    fi
}

# Проверка подключения к базе данных
check_database() {
    log "Проверка подключения к базе данных..."
    
    # Здесь можно добавить проверку подключения к PostgreSQL
    # Например, через psql или API endpoint
    
    if curl -f -s "$APP_URL/api/health/db" > /dev/null 2>&1; then
        success "База данных доступна"
    else
        warning "База данных недоступна или endpoint не реализован"
    fi
}

# Отправка уведомления
send_notification() {
    local message="$1"
    local status="$2"
    
    log "Отправка уведомления: $message"
    
    # Здесь можно добавить отправку в Slack, Discord, email и т.д.
    # Например:
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$message\"}" \
    #   $SLACK_WEBHOOK_URL
    
    echo "NOTIFICATION: $status - $message"
}

# Основная функция мониторинга
monitor() {
    log "Запуск мониторинга Bridge Logistics..."
    
    local health_ok=true
    local metrics_ok=true
    local resources_ok=true
    local logs_ok=true
    local db_ok=true
    
    # Проверки
    check_health || health_ok=false
    check_metrics || metrics_ok=false
    check_resources || resources_ok=false
    check_logs || logs_ok=false
    check_database || db_ok=false
    
    # Общий статус
    if $health_ok && $metrics_ok && $resources_ok && $logs_ok && $db_ok; then
        success "Все системы работают нормально"
        send_notification "Bridge Logistics: Все системы работают нормально" "OK"
    else
        error "Обнаружены проблемы в системе"
        send_notification "Bridge Logistics: Обнаружены проблемы в системе" "ERROR"
    fi
}

# Непрерывный мониторинг
continuous_monitor() {
    log "Запуск непрерывного мониторинга (каждые 60 секунд)..."
    
    while true; do
        monitor
        sleep 60
    done
}

# Обработка аргументов командной строки
case "${1:-}" in
    "once")
        monitor
        ;;
    "continuous")
        continuous_monitor
        ;;
    "health")
        check_health
        ;;
    "metrics")
        check_metrics
        ;;
    "resources")
        check_resources
        ;;
    "logs")
        check_logs
        ;;
    "database")
        check_database
        ;;
    *)
        echo "Использование: $0 {once|continuous|health|metrics|resources|logs|database}"
        echo "  once        - Однократная проверка"
        echo "  continuous  - Непрерывный мониторинг"
        echo "  health      - Проверка здоровья приложения"
        echo "  metrics     - Проверка метрик"
        echo "  resources   - Проверка ресурсов"
        echo "  logs        - Проверка логов"
        echo "  database    - Проверка базы данных"
        exit 1
        ;;
esac
