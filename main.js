// Distributed Chat Application - Main Module
// Handles asynchronous communication and UI interactions

class ChatApplication {
    constructor() {
        this.user = null;
        this.currentRoom = null;
        this.rooms = new Map();
        this.messages = new Map();
        this.initializeApp();
    }

    initializeApp() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeSampleData();
    }

    setupEventListeners() {
        const sendBtn = document.getElementById('sendBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const createRoomBtn = document.getElementById('createRoomBtn');
        const messageInput = document.getElementById('messageInput');

        if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
        if (createRoomBtn) createRoomBtn.addEventListener('click', () => this.createNewRoom());
        if (messageInput) messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message || !this.currentRoom) return;

        const msgObj = {
            id: Date.now(),
            user: this.user,
            text: message,
            timestamp: new Date().toLocaleTimeString(),
            room: this.currentRoom
        };

        await this.storeMessage(msgObj);
        this.displayMessage(msgObj);
        input.value = '';
    }

    async storeMessage(msgObj) {
        if (!this.messages.has(this.currentRoom)) {
            this.messages.set(this.currentRoom, []);
        }
        this.messages.get(this.currentRoom).push(msgObj);
        localStorage.setItem('chatMessages', JSON.stringify(Array.from(this.messages.entries())));
    }

    displayMessage(msgObj) {
        const container = document.getElementById('messagesContainer');
        const msgElement = document.createElement('div');
        msgElement.className = 'message';
        msgElement.innerHTML = `<strong>${msgObj.user}:</strong> ${msgObj.text}`;
        container.appendChild(msgElement);
        container.scrollTop = container.scrollHeight;
    }

    createNewRoom() {
        const roomName = prompt('Enter room name:');
        if (roomName) this.addRoom(roomName);
    }

    addRoom(roomName) {
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, { name: roomName, users: [] });
            this.renderRooms();
            localStorage.setItem('chatRooms', JSON.stringify(Array.from(this.rooms.entries())));
        }
    }

    selectRoom(roomName) {
        this.currentRoom = roomName;
        document.getElementById('currentRoom').textContent = roomName;
        this.loadRoomMessages();
    }

    loadRoomMessages() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        const roomMessages = this.messages.get(this.currentRoom) || [];
        roomMessages.forEach(msg => this.displayMessage(msg));
    }

    renderRooms() {
        const roomList = document.getElementById('roomList');
        roomList.innerHTML = '';
        this.rooms.forEach((room, name) => {
            const li = document.createElement('li');
            li.textContent = name;
            li.onclick = () => this.selectRoom(name);
            roomList.appendChild(li);
        });
    }

    initializeSampleData() {
        if (this.rooms.size === 0) {
            this.addRoom('General');
            this.addRoom('Random');
            this.addRoom('Tech Talk');
        }
        this.renderRooms();
    }

    loadFromStorage() {
        const username = localStorage.getItem('username') || 'User_' + Math.random().toString(36).substr(2, 9);
        this.user = username;
        document.getElementById('username').textContent = username;

        const savedRooms = localStorage.getItem('chatRooms');
        if (savedRooms) {
            this.rooms = new Map(JSON.parse(savedRooms));
        }

        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            this.messages = new Map(JSON.parse(savedMessages));
        }
    }

    logout() {
        localStorage.clear();
        location.reload();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApplication();
});
