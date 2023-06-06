#!/bin/sh

cd "$(dirname "$0")"

echo "Welcome to MintyGen NFT Engine"
echo ""

check_node_modules() {
    if [ ! -d "node_modules" ]; then
        echo "Install dependencies"
        echo ""
        read -p "Press enter to continue..."
        npm i
        check_node_modules
    else
        check_config
    fi
}

check_config() {
    if [ ! -f "config.json" ]; then
        echo "Error: config.json not found. Please create a config.json file."
        echo ""
        read -p "Press enter to continue..."
        exit 1
    else
        menu
    fi
}

menu() {
    echo "Select an option:"
    echo "1. Run Generate"
    echo "2. Run Shuffle"
    echo "3. Run Update"
    echo "4. Exit"
    echo ""

    read -p "Enter your choice (1-4): " choice

    case $choice in
        1)
            run_generate
            ;;
        2)
            run_shuffle
            ;;
        3)
            run_update
            ;;
        4)
            exit_script
            ;;
        *)
            echo "Invalid choice. Please try again."
            echo ""
            read -p "Press enter to continue..."
            menu
            ;;
    esac
}

run_generate() {
    node Generate.js
    echo ""
    read -p "Press enter to continue..."
    menu
}

run_shuffle() {
    node Shuffle.js
    echo "Shuffle complete."
    echo ""
    read -p "Press enter to continue..."
    menu
}

run_update() {
    node Update.js
    echo "Update complete."
    echo ""
    read -p "Press enter to continue..."
    menu
}

exit_script() {
    read -p "Press enter to continue..."
    exit 0
}

check_node_modules
