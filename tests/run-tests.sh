#!/bin/bash

# Firebase Database Functionality Test Runner
# This script provides an easy way to run Firebase tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 16 ]; then
            print_success "Node.js version $(node --version) is compatible"
        else
            print_error "Node.js version 16+ required. Current: $(node --version)"
            exit 1
        fi
    else
        print_error "Node.js is not installed"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing test dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_warning "No package.json found in tests directory"
        print_status "Installing firebase-admin globally..."
        npm install -g firebase-admin
    fi
}

# Function to check Firebase configuration
check_firebase_config() {
    print_status "Checking Firebase configuration..."
    
    # Check if firebase.json exists in parent directory
    if [ -f "../firebase.json" ]; then
        print_success "Firebase configuration found"
    else
        print_warning "No firebase.json found. Make sure Firebase is configured."
    fi
    
    # Check if .firebaserc exists
    if [ -f "../.firebaserc" ]; then
        PROJECT_ID=$(cat ../.firebaserc | grep '"default"' | cut -d'"' -f4)
        print_success "Firebase project: $PROJECT_ID"
    else
        print_warning "No .firebaserc found. Run 'firebase init' in the project root."
    fi
}

# Function to run Node.js tests
run_node_tests() {
    print_status "Running Node.js Firebase tests..."
    
    if [ -f "firebase-test-node.js" ]; then
        node firebase-test-node.js
        if [ $? -eq 0 ]; then
            print_success "Node.js tests completed successfully"
        else
            print_error "Node.js tests failed"
            exit 1
        fi
    else
        print_error "firebase-test-node.js not found"
        exit 1
    fi
}

# Function to start Firebase emulators
start_emulators() {
    print_status "Starting Firebase emulators..."
    
    if command_exists firebase; then
        # Check if emulators are already running
        if lsof -i :8080 >/dev/null 2>&1; then
            print_warning "Firestore emulator already running on port 8080"
        else
            # Start emulators in background
            firebase emulators:start --only firestore,auth > /tmp/firebase-emulator.log 2>&1 &
            EMULATOR_PID=$!
            sleep 5  # Wait for emulators to start
            
            # Check if emulators started successfully
            if lsof -i :8080 >/dev/null 2>&1; then
                print_success "Firebase emulators started (PID: $EMULATOR_PID)"
                echo $EMULATOR_PID > /tmp/firebase-emulator.pid
            else
                print_error "Failed to start Firebase emulators"
                print_status "Check log: tail /tmp/firebase-emulator.log"
                return 1
            fi
        fi
    else
        print_warning "Firebase CLI not installed. Install with: npm install -g firebase-tools"
        print_status "Running tests against live Firebase..."
    fi
}

# Function to stop Firebase emulators
stop_emulators() {
    print_status "Stopping Firebase emulators..."
    
    if command_exists firebase; then
        # Try to stop using Firebase CLI
        firebase emulators:stop >/dev/null 2>&1 || true
        
        # Also kill the background process if it exists
        if [ -f "/tmp/firebase-emulator.pid" ]; then
            EMULATOR_PID=$(cat /tmp/firebase-emulator.pid)
            if ps -p $EMULATOR_PID > /dev/null 2>&1; then
                kill $EMULATOR_PID >/dev/null 2>&1 || true
                sleep 2
                # Force kill if still running
                if ps -p $EMULATOR_PID > /dev/null 2>&1; then
                    kill -9 $EMULATOR_PID >/dev/null 2>&1 || true
                fi
            fi
            rm -f /tmp/firebase-emulator.pid
        fi
        
        # Clean up log file
        rm -f /tmp/firebase-emulator.log
        
        print_success "Firebase emulators stopped"
    fi
}

# Function to open browser test
open_browser_test() {
    print_status "Opening browser test..."
    
    if [ -f "firebase-test.html" ]; then
        if command_exists open; then  # macOS
            open firebase-test.html
        elif command_exists xdg-open; then  # Linux
            xdg-open firebase-test.html
        elif command_exists start; then  # Windows
            start firebase-test.html
        else
            print_status "Please open firebase-test.html in your browser manually"
        fi
        print_success "Browser test opened"
    else
        print_error "firebase-test.html not found"
    fi
}

# Function to show usage
show_usage() {
    echo "Firebase Database Test Runner"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  node        Run Node.js tests only"
    echo "  browser     Open browser tests"
    echo "  emulator    Run tests with Firebase emulators"
    echo "  setup       Install dependencies and check configuration"
    echo "  all         Run all tests (default)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 node          # Run Node.js tests"
    echo "  $0 browser       # Open browser tests"
    echo "  $0 emulator      # Run with emulators"
    echo "  $0 setup         # Setup and check configuration"
}

# Main execution
main() {
    echo "🔥 Firebase Database Test Runner"
    echo "================================="
    echo ""
    
    # Change to tests directory if not already there
    if [ ! -f "firebase-test-node.js" ]; then
        if [ -d "tests" ]; then
            cd tests
        else
            print_error "Tests directory not found. Run this script from the project root or tests directory."
            exit 1
        fi
    fi
    
    case "${1:-all}" in
        "node")
            check_node_version
            check_firebase_config
            run_node_tests
            ;;
        "browser")
            open_browser_test
            ;;
        "emulator")
            check_node_version
            check_firebase_config
            start_emulators
            run_node_tests
            stop_emulators
            ;;
        "setup")
            check_node_version
            install_dependencies
            check_firebase_config
            print_success "Setup completed. You can now run tests."
            ;;
        "all")
            check_node_version
            check_firebase_config
            run_node_tests
            print_status "Node.js tests completed. Opening browser tests..."
            sleep 2
            open_browser_test
            ;;
        "help")
            show_usage
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Test runner completed successfully! 🎉"
}

# Trap to ensure cleanup on exit
trap 'stop_emulators' EXIT

# Run main function with all arguments
main "$@"