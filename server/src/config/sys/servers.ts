export default {
    "development": {
        "gate": [
            { "id": "gate", "host": "127.0.0.1", "port": 4011, "frontend": true, "clientPort": 4001, },
        ],
        "connector": [
            { "id": "connector_1", "host": "127.0.0.1", "port": 4021, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 4002, },
            { "id": "connector_2", "host": "127.0.0.1", "port": 4022, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 4003, },
        ],
        "chat": [
            { "id": "chat_1", "host": "127.0.0.1", "port": 4031 },
            { "id": "chat_2", "host": "127.0.0.1", "port": 4032 },
        ],
    },
    "production": {
        "gate": [
            { "id": "gate", "host": "127.0.0.1", "port": 4011, "frontend": true, "clientPort": 4001, },
        ],
        "connector": [
            { "id": "connector_1", "host": "127.0.0.1", "port": 4021, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 4002, },
            { "id": "connector_2", "host": "127.0.0.1", "port": 4022, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 4003, },
        ],
        "chat": [
            { "id": "chat_1", "host": "127.0.0.1", "port": 4031 },
            { "id": "chat_2", "host": "127.0.0.1", "port": 4032 },
        ],
    }
}