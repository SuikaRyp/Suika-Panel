// Admin dashboard functions
function loadAdminDashboard() {
    loadAdminStats();
    loadRecentUsers();
    loadPackageDistribution();
}

function loadAdminStats() {
    const users = getAllUsers();
    const packages = getRamPackages();
    
    // Calculate totals
    let totalServers = 0;
    let totalRamUsed = 0;
    let totalRevenue = 0;
    
    users.forEach(user => {
        const userServers = getUserServers(user.id);
        totalServers += userServers.length;
        
        // Calculate RAM usage
        const ramUsed = userServers.reduce((sum, server) => sum + (server.memory || 0), 0);
        totalRamUsed += ramUsed;
        
        // Calculate revenue
        const packageInfo = packages[user.package_id] || packages[1];
        totalRevenue += packageInfo.price || 0;
    });
    
    // Update UI
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalServers').textContent = totalServers;
    document.getElementById('totalRamUsed').textContent = (totalRamUsed / 1024).toFixed(1) + ' GB';
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue;
}

function loadRecentUsers() {
    const users = getAllUsers();
    const packages = getRamPackages();
    
    // Sort by creation date (newest first)
    const recentUsers = [...users]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    const tbody = document.getElementById('recentUsersTable');
    tbody.innerHTML = recentUsers.map(user => {
        const packageInfo = packages[user.package_id] || packages[1];
        const servers = getUserServers(user.id);
        
        return `
            <tr>
                <td><strong>#${user.id}</strong></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="badge bg-dark">${packageInfo.name}</span></td>
                <td>${servers.length}</td>
                <td>
                    <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-warning'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="location.href='users.html'">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (recentUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-3 text-muted">
                    No users found
                </td>
            </tr>
        `;
    }
}

function loadPackageDistribution() {
    const users = getAllUsers();
    const packages = getRamPackages();
    
    // Count users per package
    const packageCounts = {};
    Object.keys(packages).forEach(pkgId => {
        packageCounts[pkgId] = 0;
    });
    
    users.forEach(user => {
        if (packageCounts[user.package_id] !== undefined) {
            packageCounts[user.package_id]++;
        }
    });
    
    // Create chart data
    const chartContainer = document.getElementById('packageChart');
    const legendContainer = document.getElementById('packageLegend');
    
    let chartHTML = '';
    let legendHTML = '';
    
    const colors = ['#4e54c8', '#8f94fb', '#00b894', '#fd79a8', '#e17055', '#6c5ce7', '#fdcb6e'];
    
    // Calculate total for percentages
    const totalUsers = users.length;
    
    if (totalUsers === 0) {
        chartHTML = `
            <div class="text-center py-4">
                <i class="fas fa-chart-pie fa-3x text-muted mb-3"></i>
                <p class="text-muted">No users to display</p>
            </div>
        `;
    } else {
        // Create pie chart visualization
        chartHTML = `
            <div class="position-relative" style="height: 200px;">
                <canvas id="packageChartCanvas" width="200" height="200"></canvas>
            </div>
        `;
        
        // Create legend
        Object.keys(packages).forEach((pkgId, index) => {
            const count = packageCounts[pkgId];
            const percentage = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : 0;
            
            if (count > 0) {
                legendHTML += `
                    <div class="d-flex align-items-center mb-2">
                        <div class="me-2" style="width: 15px; height: 15px; background: ${colors[index % colors.length]};"></div>
                        <div class="flex-grow-1">
                            <small>${packages[pkgId].name}</small>
                        </div>
                        <div>
                            <small class="text-muted">${count} (${percentage}%)</small>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    chartContainer.innerHTML = chartHTML;
    legendContainer.innerHTML = legendHTML;
    
    // Initialize canvas chart if needed
    if (totalUsers > 0) {
        setTimeout(renderPackageChart, 100);
    }
}

function renderPackageChart() {
    const canvas = document.getElementById('packageChartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const users = getAllUsers();
    const packages = getRamPackages();
    
    // Count users per package
    const packageCounts = {};
    Object.keys(packages).forEach(pkgId => {
        packageCounts[pkgId] = 0;
    });
    
    users.forEach(user => {
        if (packageCounts[user.package_id] !== undefined) {
            packageCounts[user.package_id]++;
        }
    });
    
    // Filter out packages with 0 users
    const filteredPackages = Object.keys(packages).filter(pkgId => packageCounts[pkgId] > 0);
    
    if (filteredPackages.length === 0) return;
    
    const colors = ['#4e54c8', '#8f94fb', '#00b894', '#fd79a8', '#e17055', '#6c5ce7', '#fdcb6e'];
    
    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    let startAngle = 0;
    const totalUsers = users.length;
    
    filteredPackages.forEach((pkgId, index) => {
        const count = packageCounts[pkgId];
        const sliceAngle = (count / totalUsers) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        startAngle += sliceAngle;
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    
    // Add total users text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(totalUsers.toString(), centerX, centerY - 10);
    
    ctx.font = '10px Arial';
    ctx.fillText('USERS', centerX, centerY + 10);
}