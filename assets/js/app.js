// Main app initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Productyl cPanel loaded');
    
    // Initialize mock data if needed
    initializeMockData();
    
    // Start status simulation
    setInterval(simulateServerStatus, 30000);
});

function initializeMockData() {
    // Initialize default servers for demo users if none exist
    const adminId = 1;
    const userId = 2;
    
    // Check if admin has servers
    if (!localStorage.getItem(`servers_${adminId}`)) {
        const adminServers = [
            {
                id: 1001,
                name: 'admin-minecraft',
                egg_id: 1,
                memory: 4096,
                disk: 40960,
                status: 'running',
                created_at: '2024-01-15T10:30:00Z',
                node: 'node-1'
            },
            {
                id: 1002,
                name: 'admin-node-app',
                egg_id: 2,
                memory: 2048,
                disk: 20480,
                status: 'running',
                created_at: '2024-01-20T14:45:00Z',
                node: 'node-1'
            }
        ];
        localStorage.setItem(`servers_${adminId}`, JSON.stringify(adminServers));
    }
    
    // Check if user has servers
    if (!localStorage.getItem(`servers_${userId}`)) {
        const userServers = [
            {
                id: 2001,
                name: 'my-minecraft-server',
                egg_id: 1,
                memory: 1024,
                disk: 10240,
                status: 'running',
                created_at: '2024-02-01T09:15:00Z',
                node: 'node-2'
            }
        ];
        localStorage.setItem(`servers_${userId}`, JSON.stringify(userServers));
    }
}
