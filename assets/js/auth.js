// Initialize admin account on first load
function initializeAdminAccount() {
    // Check if admin exists
    const admin = JSON.parse(localStorage.getItem('admin_account'));
    
    if (!admin) {
        // Create admin account
        const adminAccount = {
            id: 1,
            username: 'admin',
            email: 'admin@productyl.local',
            password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // admin123
            is_admin: true,
            ram_limit: 0, // Unlimited
            max_servers: 999,
            package_id: 7,
            created_at: new Date().toISOString()
        };
        
        localStorage.setItem('admin_account', JSON.stringify(adminAccount));
        
        // Initialize empty users array
        localStorage.setItem('users', JSON.stringify([]));
        
        console.log('Admin account created');
    }
}

// Get all users (excluding admin)
function getAllUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users;
}

// Get user by ID
function getUserById(userId) {
    const users = getAllUsers();
    return users.find(u => u.id == userId);
}

// Get user by email
function getUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email === email);
}

// Create new user (admin only)
async function createUser(userData) {
    const users = getAllUsers();
    
    // Check if email already exists
    if (getUserByEmail(userData.email)) {
        return { success: false, error: 'Email already exists' };
    }
    
    // Generate user ID
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1001;
    
    // Hash password
    const passwordHash = await PasswordEncryption.hashPassword(userData.password);
    
    // Create user object
    const newUser = {
        id: newId,
        username: userData.username,
        email: userData.email,
        password_hash: passwordHash,
        is_admin: false,
        ram_limit: parseInt(userData.ram_limit) || 1024,
        ram_used: 0,
        max_servers: parseInt(userData.max_servers) || 1,
        package_id: parseInt(userData.package_id) || 1,
        api_key: PasswordEncryption.generateApiKey(),
        created_at: new Date().toISOString(),
        status: 'active'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Don't return password hash
    const { password_hash, ...safeUser } = newUser;
    return { success: true, user: safeUser };
}

// Update user
function updateUser(userId, updateData) {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id == userId);
    
    if (userIndex === -1) {
        return { success: false, error: 'User not found' };
    }
    
    // Update user data
    users[userIndex] = {
        ...users[userIndex],
        ...updateData,
        updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, user: users[userIndex] };
}

// Delete user
function deleteUser(userId) {
    const users = getAllUsers();
    const filteredUsers = users.filter(u => u.id != userId);
    
    // Also delete user's servers
    deleteUserServers(userId);
    
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    return { success: true };
}

// Delete user's servers
function deleteUserServers(userId) {
    localStorage.removeItem(`servers_${userId}`);
}

// Login function
async function loginUser(email, password) {
    // First check if admin
    const admin = JSON.parse(localStorage.getItem('admin_account'));
    if (admin && admin.email === email) {
        const isValid = await PasswordEncryption.verifyPassword(password, admin.password_hash);
        if (isValid) {
            const { password_hash, ...safeAdmin } = admin;
            return { ...safeAdmin, is_admin: true };
        }
    }
    
    // Check regular users
    const user = getUserByEmail(email);
    if (user) {
        const isValid = await PasswordEncryption.verifyPassword(password, user.password_hash);
        if (isValid) {
            const { password_hash, ...safeUser } = user;
            return safeUser;
        }
    }
    
    return null;
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Get user's servers
function getUserServers(userId = null) {
    const user = userId ? getUserById(userId) : getCurrentUser();
    if (!user) return [];
    
    const serversJson = localStorage.getItem(`servers_${user.id}`);
    return serversJson ? JSON.parse(serversJson) : [];
}

// Add server to user
function addUserServer(userId, server) {
    const servers = getUserServers(userId);
    servers.push(server);
    localStorage.setItem(`servers_${userId}`, JSON.stringify(servers));
    
    // Update RAM usage
    updateUserRamUsage(userId);
    
    return true;
}

// Update user RAM usage
function updateUserRamUsage(userId) {
    const user = getUserById(userId);
    if (!user) return;
    
    const servers = getUserServers(userId);
    const ramUsed = servers.reduce((sum, server) => sum + (server.memory || 0), 0);
    
    const updateData = { ram_used: ramUsed };
    updateUser(userId, updateData);
}

// Delete server
function deleteServer(serverId, userId = null) {
    const user = userId ? getUserById(userId) : getCurrentUser();
    if (!user) return false;
    
    const servers = getUserServers(user.id);
    const serverIndex = servers.findIndex(s => s.id == serverId);
    
    if (serverIndex === -1) return false;
    
    servers.splice(serverIndex, 1);
    localStorage.setItem(`servers_${user.id}`, JSON.stringify(servers));
    
    // Update RAM usage
    updateUserRamUsage(user.id);
    
    return true;
}

// Get RAM packages
function getRamPackages() {
    return {
        1: { name: 'Basic 1GB', ram: 1024, price: 5, max_servers: 1 },
        2: { name: 'Starter 2GB', ram: 2048, price: 10, max_servers: 2 },
        3: { name: 'Standard 4GB', ram: 4096, price: 20, max_servers: 3 },
        4: { name: 'Advanced 6GB', ram: 6144, price: 30, max_servers: 5 },
        5: { name: 'Pro 8GB', ram: 8192, price: 40, max_servers: 8 },
        6: { name: 'Enterprise 10GB', ram: 10240, price: 50, max_servers: 10 },
        7: { name: 'UNLIMITED', ram: 0, price: 100, max_servers: 999, unlimited: true }
    };
}

// Get server eggs/types
function getServerEggs() {
    return [
        { id: 1, name: 'Minecraft', icon: 'fas fa-cube', color: 'text-success' },
        { id: 2, name: 'Node.js', icon: 'fab fa-node-js', color: 'text-success' },
        { id: 3, name: 'Python', icon: 'fab fa-python', color: 'text-info' },
        { id: 4, name: 'PHP Web', icon: 'fab fa-php', color: 'text-primary' },
        { id: 5, name: 'CS:GO', icon: 'fas fa-gamepad', color: 'text-danger' },
        { id: 6, name: 'Discord Bot', icon: 'fab fa-discord', color: 'text-info' },
        { id: 7, name: 'WordPress', icon: 'fab fa-wordpress', color: 'text-primary' },
        { id: 8, name: 'MySQL', icon: 'fas fa-database', color: 'text-warning' }
    ];
}