// Mock API functions
function mockPltaApi(endpoint, method = 'GET', data = null) {
    console.log(`Mock PLTA API: ${method} ${endpoint}`, data);
    
    // Simulate API delay
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                code: 200,
                data: { success: true, message: 'Mock response' }
            });
        }, 500);
    });
}

function mockPltcApi(endpoint, method = 'GET', data = null) {
    console.log(`Mock PLTC API: ${method} ${endpoint}`, data);
    
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                code: 200,
                data: { success: true, message: 'Mock client response' }
            });
        }, 500);
    });
}

// Load dashboard data
function loadDashboard() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update username display
    document.getElementById('usernameDisplay').textContent = user.username;
    
    // Load stats
    loadStats(user);
    
    // Load servers
    loadServers();
    
    // Load quick actions
    loadQuickActions();
    
    // Update footer info
    updateFooterInfo(user);
}

function loadStats(user) {
    const servers = getUserServers();
    const packageInfo = getUserPackage();
    
    const statsCards = document.getElementById('statsCards');
    
    statsCards.innerHTML = `
        <div class="col-md-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-25 p-3 rounded-circle me-3">
                            <i class="fas fa-server fa-2x text-primary"></i>
                        </div>
                        <div>
                            <h5 class="mb-0">${servers.length}</h5>
                            <small class="text-muted">Active Servers</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="bg-success bg-opacity-25 p-3 rounded-circle me-3">
                            <i class="fas fa-memory fa-2x text-success"></i>
                        </div>
                        <div>
                            <h5 class="mb-0">${user.ram_used || 0}MB</h5>
                            <small class="text-muted">RAM Used</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="bg-warning bg-opacity-25 p-3 rounded-circle me-3">
                            <i class="fas fa-chart-line fa-2x text-warning"></i>
                        </div>
                        <div>
                            <h5 class="mb-0">${user.ram_limit === 0 ? 'Unlimited' : user.ram_limit + 'MB'}</h5>
                            <small class="text-muted">RAM Limit</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="bg-info bg-opacity-25 p-3 rounded-circle me-3">
                            <i class="fas fa-crown fa-2x text-info"></i>
                        </div>
                        <div>
                            <h5 class="mb-0">${packageInfo?.name || 'Basic'}</h5>
                            <small class="text-muted">Current Package</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Update RAM usage
    const ramUsed = user.ram_used || 0;
    const ramLimit = user.ram_limit || 1024;
    const ramPercentage = ramLimit > 0 ? Math.min(100, (ramUsed / ramLimit) * 100) : 0;
    
    document.getElementById('ramUsageText').textContent = 
        `${ramUsed}MB / ${ramLimit === 0 ? 'Unlimited' : ramLimit + 'MB'}`;
    
    const ramProgress = document.getElementById('ramProgress');
    ramProgress.style.width = `${ramPercentage}%`;
    
    // Set progress bar color
    if (ramPercentage > 90) {
        ramProgress.className = 'progress-bar bg-danger';
    } else if (ramPercentage > 70) {
        ramProgress.className = 'progress-bar bg-warning';
    } else {
        ramProgress.className = 'progress-bar bg-success';
    }
    
    // Update available RAM text
    const availableText = document.getElementById('ramAvailableText');
    if (ramLimit === 0) {
        availableText.textContent = 'Unlimited RAM available';
    } else {
        const availableRam = ramLimit - ramUsed;
        availableText.textContent = `${availableRam}MB available for new servers`;
    }
}

function loadServers() {
    const servers = getUserServers();
    const serverCount = document.getElementById('serverCount');
    const noServers = document.getElementById('noServers');
    const serversTable = document.getElementById('serversTable');
    const serversList = document.getElementById('serversList');
    
    serverCount.textContent = servers.length;
    
    if (servers.length === 0) {
        noServers.classList.remove('d-none');
        serversTable.classList.add('d-none');
        return;
    }
    
    noServers.classList.add('d-none');
    serversTable.classList.remove('d-none');
    
    // Server eggs mapping
    const eggNames = {
        1: 'Minecraft',
        2: 'Node.js',
        3: 'Python',
        4: 'PHP',
        5: 'CS:GO',
        6: 'Discord Bot',
        7: 'WordPress',
        8: 'MySQL'
    };
    
    const eggIcons = {
        1: 'fas fa-cube',
        2: 'fab fa-node-js',
        3: 'fab fa-python',
        4: 'fab fa-php',
        5: 'fas fa-gamepad',
        6: 'fab fa-discord',
        7: 'fab fa-wordpress',
        8: 'fas fa-database'
    };
    
    serversList.innerHTML = servers.map(server => {
        const statusClass = `status-${server.status}`;
        const statusBadge = server.status === 'running' ? 'bg-success' : 
                          server.status === 'stopped' ? 'bg-danger' : 
                          server.status === 'creating' ? 'bg-warning' : 'bg-secondary';
        
        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="${eggIcons[server.egg_id] || 'fas fa-server'} text-primary me-2"></i>
                        <strong>${server.name}</strong>
                    </div>
                </td>
                <td>
                    <span class="badge ${statusBadge}">
                        ${server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                    </span>
                </td>
                <td>
                    <i class="fas fa-memory me-1"></i>
                    ${server.memory / 1024} GB
                </td>
                <td>
                    ${eggNames[server.egg_id] || 'Unknown'}
                </td>
                <td>
                    ${new Date(server.created_at).toLocaleDateString()}
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" title="Manage">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button class="btn btn-outline-success" title="Start/Stop">
                            <i class="fas fa-power-off"></i>
                        </button>
                        <button class="btn btn-outline-danger" 
                                onclick="deleteServer(${server.id}, '${server.name}')"
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function loadQuickActions() {
    const quickActions = document.getElementById('quickActions');
    
    const actions = [
        { egg: 1, icon: 'fas fa-cube', name: 'Minecraft', color: 'text-success', desc: 'Java/Bedrock Server' },
        { egg: 2, icon: 'fab fa-node-js', name: 'Node.js', color: 'text-success', desc: 'Web Apps & Bots' },
        { egg: 5, icon: 'fas fa-gamepad', name: 'CS:GO', color: 'text-danger', desc: 'Game Server' },
        { egg: 6, icon: 'fab fa-discord', name: 'Discord Bot', color: 'text-info', desc: 'Bot Hosting' }
    ];
    
    quickActions.innerHTML = actions.map(action => `
        <div class="col-md-3 col-6">
            <a href="create.html?egg=${action.egg}" 
               class="card text-decoration-none text-center p-4 h-100">
                <i class="${action.icon} fa-3x mb-3 ${action.color}"></i>
                <h5>${action.name}</h5>
                <small class="text-muted">${action.desc}</small>
            </a>
        </div>
    `).join('');
}

function updateFooterInfo(user) {
    const packageInfo = getUserPackage();
    const footerInfo = document.getElementById('footerInfo');
    
    footerInfo.innerHTML = `
        Package: ${packageInfo?.name || 'Unknown'} | 
        RAM: ${user.ram_used || 0}MB / ${user.ram_limit === 0 ? 'Unlimited' : user.ram_limit + 'MB'}
    `;
}

function deleteServer(serverId, serverName) {
    if (confirm(`Are you sure you want to delete "${serverName}"? This action cannot be undone!`)) {
        if (deleteUserServer(serverId)) {
            alert('Server deleted successfully!');
            loadDashboard(); // Refresh dashboard
        } else {
            alert('Failed to delete server!');
        }
    }
}

// Simulate server status updates
function simulateServerStatus() {
    const user = getCurrentUser();
    if (!user) return;
    
    const servers = getUserServers();
    
    // Randomly update server statuses
    servers.forEach(server => {
        if (server.status === 'creating') {
            // Simulate server becoming ready
            if (Math.random() > 0.7) {
                server.status = 'running';
            }
        } else if (server.status === 'running') {
            // Randomly stop some servers
            if (Math.random() > 0.95) {
                server.status = 'stopped';
            }
        }
    });
    
    // Save updated servers
    localStorage.setItem(`servers_${user.id}`, JSON.stringify(servers));
}
