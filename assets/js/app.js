// Main app initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Productyl cPanel loaded');
    
    // Initialize admin account
    initializeAdminAccount();
    
    // Initialize demo data if needed
    initializeDemoData();
    
    // Start status simulation
    setInterval(simulateServerStatus, 30000);
});

function initializeDemoData() {
    // Check if demo users exist
    const users = getAllUsers();
    
    if (users.length === 0) {
        // Create some demo users
        const demoUsers = [
            {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'demo123',
                package_id: 3,
                ram_limit: 4096,
                max_servers: 3
            },
            {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: 'demo123',
                package_id: 2,
                ram_limit: 2048,
                max_servers: 2
            },
            {
                username: 'premium_user',
                email: 'premium@example.com',
                password: 'demo123',
                package_id: 6,
                ram_limit: 10240,
                max_servers: 10
            }
        ];
        
        // Create demo users
        demoUsers.forEach(async (userData, index) => {
            setTimeout(async () => {
                await createUser(userData);
            }, index * 100);
        });
        
        console.log('Demo users created');
    }
}

// Simulate server status updates
function simulateServerStatus() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // If admin, update all users' servers
    if (currentUser.is_admin) {
        const users = getAllUsers();
        users.forEach(user => {
            updateUserServersStatus(user.id);
        });
    } else {
        // Update current user's servers
        updateUserServersStatus(currentUser.id);
    }
}

function updateUserServersStatus(userId) {
    const servers = getUserServers(userId);
    let needsUpdate = false;
    
    servers.forEach(server => {
        if (server.status === 'creating') {
            // Simulate server becoming ready
            if (Math.random() > 0.7) {
                server.status = 'running';
                needsUpdate = true;
            }
        } else if (server.status === 'running') {
            // Randomly stop some servers
            if (Math.random() > 0.98) {
                server.status = 'stopped';
                needsUpdate = true;
            }
        } else if (server.status === 'stopped') {
            // Randomly start stopped servers
            if (Math.random() > 0.95) {
                server.status = 'running';
                needsUpdate = true;
            }
        }
    });
    
    if (needsUpdate) {
        localStorage.setItem(`servers_${userId}`, JSON.stringify(servers));
        
        // Update RAM usage
        updateUserRamUsage(userId);
        
        // If on dashboard, refresh
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname.includes('admin/')) {
            loadDashboard?.();
            loadAdminDashboard?.();
        }
    }
}