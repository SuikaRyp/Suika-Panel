// Mock database
const MOCK_USERS = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@productyl.com',
        password: 'admin123',
        is_admin: true,
        ram_limit: 0, // Unlimited
        ram_used: 0,
        max_servers: 999,
        package_id: 7,
        created_at: '2024-01-01'
    },
    {
        id: 2,
        username: 'user',
        email: 'user@productyl.com',
        password: 'user123',
        is_admin: false,
        ram_limit: 4096, // 4GB
        ram_used: 0,
        max_servers: 3,
        package_id: 3,
        created_at: '2024-01-01'
    }
];

const RAM_PACKAGES = {
    1: { name: 'Basic 1GB', ram: 1024, price: 5, max_servers: 1 },
    2: { name: 'Starter 2GB', ram: 2048, price: 10, max_servers: 2 },
    3: { name: 'Standard 4GB', ram: 4096, price: 20, max_servers: 3 },
    4: { name: 'Advanced 6GB', ram: 6144, price: 30, max_servers: 5 },
    5: { name: 'Pro 8GB', ram: 8192, price: 40, max_servers: 8 },
    6: { name: 'Enterprise 10GB', ram: 10240, price: 50, max_servers: 10 },
    7: { name: 'UNLIMITED', ram: 0, price: 100, max_servers: 999, unlimited: true }
};

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user from localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Login function
function loginUser(email, password) {
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Don't store password in localStorage
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
    
    return null;
}

// Get user's servers from localStorage
function getUserServers() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const serversJson = localStorage.getItem(`servers_${user.id}`);
    return serversJson ? JSON.parse(serversJson) : [];
}

// Add server to user
function addUserServer(server) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const servers = getUserServers();
    servers.push(server);
    
    // Update user RAM usage
    user.ram_used = servers.reduce((sum, s) => sum + s.memory, 0);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Save servers
    localStorage.setItem(`servers_${user.id}`, JSON.stringify(servers));
    
    return true;
}

// Delete user server
function deleteUserServer(serverId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const servers = getUserServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    
    if (serverIndex === -1) return false;
    
    // Remove server
    const [deletedServer] = servers.splice(serverIndex, 1);
    
    // Update user RAM usage
    user.ram_used = servers.reduce((sum, s) => sum + s.memory, 0);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Save updated servers
    localStorage.setItem(`servers_${user.id}`, JSON.stringify(servers));
    
    return true;
}

// Get user package info
function getUserPackage() {
    const user = getCurrentUser();
    if (!user) return null;
    
    return RAM_PACKAGES[user.package_id] || RAM_PACKAGES[1];
}
