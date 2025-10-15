#!/bin/bash

# Bridge Logistics Deployment Script
# Автоматический деплой приложения

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Проверка переменных окружения
check_env() {
    log "Проверка переменных окружения..."
    
    if [ -z "$DEPLOY_ENV" ]; then
        error "DEPLOY_ENV не установлена"
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL не установлена"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        error "JWT_SECRET не установлена"
    fi
    
    success "Переменные окружения проверены"
}

# Установка зависимостей
install_deps() {
    log "Установка зависимостей..."
    
    if ! command -v pnpm &> /dev/null; then
        log "Установка pnpm..."
        npm install -g pnpm
    fi
    
    pnpm install --frozen-lockfile
    success "Зависимости установлены"
}

# Запуск тестов
run_tests() {
    log "Запуск тестов..."
    
    pnpm run type-check
    pnpm run lint
    pnpm run test:unit
    
    success "Все тесты прошли успешно"
}

# Сборка приложения
build_app() {
    log "Сборка приложения..."
    
    pnpm run build
    
    success "Приложение собрано"
}

# Миграции базы данных
run_migrations() {
    log "Запуск миграций базы данных..."
    
    pnpm run db:migrate
    
    success "Миграции выполнены"
}

# Деплой приложения
deploy_app() {
    log "Деплой приложения в среду: $DEPLOY_ENV"
    
    case $DEPLOY_ENV in
        "staging")
            log "Деплой на staging сервер..."
            # Здесь команды для деплоя на staging
            ;;
        "production")
            log "Деплой на production сервер..."
            # Здесь команды для деплоя на production
            ;;
        *)
            error "Неизвестная среда: $DEPLOY_ENV"
            ;;
    esac
    
    success "Деплой завершен"
}

# Проверка здоровья приложения
health_check() {
    log "Проверка здоровья приложения..."
    
    # Ждем запуска приложения
    sleep 10
    
    # Проверяем health endpoint
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "Приложение работает корректно"
    else
        error "Приложение не отвечает на health check"
    fi
}

# Откат изменений
rollback() {
    warning "Выполняется откат изменений..."
    
    # Здесь логика отката
    # Например, восстановление предыдущей версии из backup
    
    success "Откат выполнен"
}

# Основная функция
main() {
    log "Начало деплоя Bridge Logistics..."
    
    # Обработка ошибок
    trap 'error "Деплой прерван из-за ошибки"' ERR
    trap 'rollback' EXIT
    
    check_env
    install_deps
    run_tests
    build_app
    run_migrations
    deploy_app
    health_check
    
    success "Деплой завершен успешно!"
}

# Обработка аргументов командной строки
case "${1:-}" in
    "staging")
        export DEPLOY_ENV="staging"
        main
        ;;
    "production")
        export DEPLOY_ENV="production"
        main
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Использование: $0 {staging|production|rollback}"
        echo "  staging    - Деплой на staging сервер"
        echo "  production - Деплой на production сервер"
        echo "  rollback   - Откат изменений"
        exit 1
        ;;
esac
