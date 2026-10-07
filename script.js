const DEFAULT_USERS = [
    { id: 'u1', name: 'Admin Account', email: 'admin@melodify.com', password: 'admin123', role: 'admin' },
    { id: 'u2', name: 'Demo User', email: 'user@melodify.com', password: 'user123', role: 'user' }
];

const DEFAULT_SONGS = [
    { id: 's1', title: 'SoundHelix Song 1', artist: 'T. Schürger', genre: 'Electronic', duration: '3:30', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', plays: 1420 },
    { id: 's2', title: 'SoundHelix Song 2', artist: 'T. Schürger', genre: 'Ambient', duration: '4:15', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', plays: 980 },
    { id: 's3', title: 'SoundHelix Song 3', artist: 'T. Schürger', genre: 'Pop', duration: '5:44', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80', plays: 2300 },
    { id: 's4', title: 'SoundHelix Song 4', artist: 'T. Schürger', genre: 'Rock', duration: '4:02', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=80', plays: 1750 },
    { id: 's5', title: 'SoundHelix Song 8', artist: 'T. Schürger', genre: 'Classical', duration: '6:10', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&auto=format&fit=crop&q=80', plays: 890 }
];

const DEFAULT_PLAYLISTS = [
    { id: 'p1', name: 'Chill Vibes', userId: 'u2', songIds: ['s1', 's2'], coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80' },
    { id: 'p2', name: 'Workout Pump', userId: 'u2', songIds: ['s3', 's4'], coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80' }
];

let state = {
    currentUser: null,
    users: [],
    songs: [],
    playlists: [],
    likes: {},
    currentRoute: 'home',
    currentSong: null,
    isPlaying: false,
    queue: [],
    queueIndex: 0,
    isShuffle: false,
    isLoop: false,
    searchQuery: ''
};

function initLocalStorage() {
    if (!localStorage.getItem('melodify_users')) {
        localStorage.setItem('melodify_users', JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem('melodify_songs')) {
        localStorage.setItem('melodify_songs', JSON.stringify(DEFAULT_SONGS));
    }
    if (!localStorage.getItem('melodify_playlists')) {
        localStorage.setItem('melodify_playlists', JSON.stringify(DEFAULT_PLAYLISTS));
    }
    if (!localStorage.getItem('melodify_likes')) {
        localStorage.setItem('melodify_likes', JSON.stringify({ u2: ['s1', 's3'] }));
    }

    state.users = JSON.parse(localStorage.getItem('melodify_users'));
    state.songs = JSON.parse(localStorage.getItem('melodify_songs'));
    state.playlists = JSON.parse(localStorage.getItem('melodify_playlists'));
    state.likes = JSON.parse(localStorage.getItem('melodify_likes'));

    const sessionUser = localStorage.getItem('melodify_session');
    if (sessionUser) {
        state.currentUser = JSON.parse(sessionUser);
        startApp();
    } else {
        showAuthScreen();
    }
}

function saveState() {
    localStorage.setItem('melodify_users', JSON.stringify(state.users));
    localStorage.setItem('melodify_songs', JSON.stringify(state.songs));
    localStorage.setItem('melodify_playlists', JSON.stringify(state.playlists));
    localStorage.setItem('melodify_likes', JSON.stringify(state.likes));
    if (state.currentUser) {
        localStorage.setItem('melodify_session', JSON.stringify(state.currentUser));
    } else {
        localStorage.removeItem('melodify_session');
    }
}

function switchAuthTab(tab) {
    const loginTab = document.getElementById('tab-login');
    const signupTab = document.getElementById('tab-signup');
    const loginForm = document.getElementById('form-login');
    const signupForm = document.getElementById('form-signup');

    if (tab === 'login') {
        loginTab.className = 'flex-1 py-2 text-sm font-semibold rounded-lg bg-spotify-elevated text-white transition shadow';
        signupTab.className = 'flex-1 py-2 text-sm font-semibold rounded-lg text-spotify-muted transition';
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        signupTab.className = 'flex-1 py-2 text-sm font-semibold rounded-lg bg-spotify-elevated text-white transition shadow';
        loginTab.className = 'flex-1 py-2 text-sm font-semibold rounded-lg text-spotify-muted transition';
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
        state.currentUser = user;
        saveState();
        showToast(`Welcome back, ${user.name}!`, 'success');
        startApp();
    } else {
        showToast('Invalid email or password combination.', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (state.users.some(u => u.email === email)) {
        showToast('Email is already registered.', 'error');
        return;
    }

    const newUser = { id: 'u_' + Date.now(), name, email, password, role: 'user' };
    state.users.push(newUser);
    state.likes[newUser.id] = [];
    state.currentUser = newUser;
    saveState();

    showToast('Account created successfully!', 'success');
    startApp();
}

function logout() {
    state.currentUser = null;
    localStorage.removeItem('melodify_session');
    document.getElementById('audio-element').pause();
    showAuthScreen();
    showToast('Logged out successfully.', 'info');
}

function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('music-player-bar').classList.add('hidden');
}

function startApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('music-player-bar').classList.remove('hidden');

    document.getElementById('sidebar-username').textContent = state.currentUser.name;
    document.getElementById('sidebar-role').textContent = state.currentUser.role;
    document.getElementById('user-avatar').textContent = state.currentUser.name.charAt(0).toUpperCase();
    document.getElementById('header-username').textContent = state.currentUser.name;
    document.getElementById('header-user-initial').textContent = state.currentUser.name.charAt(0).toUpperCase();

    renderSidebarNavigation();
    navigate(state.currentUser.role === 'admin' ? 'admin-dashboard' : 'home');
}

function renderSidebarNavigation() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = '';

    if (state.currentUser.role === 'admin') {
        nav.innerHTML = `
            <button onclick="navigate('admin-dashboard')" id="nav-admin-dashboard" class="flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white">
                <i class="fa-solid fa-chart-pie w-5 text-center"></i> Dashboard
            </button>
            <button onclick="navigate('admin-songs')" id="nav-admin-songs" class="flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white">
                <i class="fa-solid fa-compact-disc w-5 text-center"></i> Song Management
            </button>
            <button onclick="navigate('admin-users')" id="nav-admin-users" class="flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white">
                <i class="fa-solid fa-users w-5 text-center"></i> User Management
            </button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="navigate('home')" id="nav-home" class="flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white">
                <i class="fa-solid fa-house w-5 text-center"></i> Home
            </button>
            <button onclick="navigate('search')" id="nav-search" class="flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white">
                <i class="fa-solid fa-magnifying-glass w-5 text-center"></i> Search
            </button>
            <button onclick="navigate('liked')" id="nav-liked" class="flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white">
                <i class="fa-solid fa-heart w-5 text-center text-spotify-green"></i> Liked Songs
            </button>
            <button onclick="navigate('playlists')" id="nav-playlists" class="flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white">
                <i class="fa-solid fa-list-ul w-5 text-center"></i> Playlists
            </button>
            <button onclick="navigate('profile')" id="nav-profile" class="flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white">
                <i class="fa-solid fa-user w-5 text-center"></i> Profile
            </button>
        `;
    }
}

function navigate(route) {
    state.currentRoute = route;
    document.querySelectorAll('#nav-links button').forEach(btn => {
        btn.className = 'flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition text-spotify-muted hover:text-white';
    });
    const activeBtn = document.getElementById(`nav-${route}`);
    if (activeBtn) {
        activeBtn.className = 'flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition bg-spotify-highlight text-white';
    }

    const searchContainer = document.getElementById('header-search-container');
    if (route === 'search') {
        searchContainer.classList.remove('hidden');
        document.getElementById('global-search-input').focus();
    } else {
        searchContainer.classList.add('hidden');
    }

    renderView();
}

function renderView() {
    const container = document.getElementById('main-view-container');
    const titleEl = document.getElementById('page-title');

    switch (state.currentRoute) {
        case 'admin-dashboard':
            titleEl.textContent = 'Admin Dashboard';
            container.innerHTML = renderAdminDashboard();
            break;
        case 'admin-songs':
            titleEl.textContent = 'Song Management';
            container.innerHTML = renderAdminSongs();
            break;
        case 'admin-users':
            titleEl.textContent = 'User Management';
            container.innerHTML = renderAdminUsers();
            break;
        case 'home':
            titleEl.textContent = 'Good Day, ' + state.currentUser.name;
            container.innerHTML = renderUserHome();
            break;
        case 'search':
            titleEl.textContent = 'Search & Explore';
            container.innerHTML = renderUserSearch();
            break;
        case 'liked':
            titleEl.textContent = 'Liked Songs';
            container.innerHTML = renderLikedSongs();
            break;
        case 'playlists':
            titleEl.textContent = 'Your Playlists';
            container.innerHTML = renderPlaylistsView();
            break;
        case 'profile':
            titleEl.textContent = 'User Profile';
            container.innerHTML = renderProfileView();
            break;
        default:
            container.innerHTML = '<p>Page not found.</p>';
    }
}

function renderAdminDashboard() {
    const totalSongs = state.songs.length;
    const totalUsers = state.users.length;
    const totalPlays = state.songs.reduce((acc, s) => acc + (s.plays || 0), 0);

    return `
        <div class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-spotify-elevated p-6 rounded-2xl border border-spotify-highlight shadow-lg flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-spotify-green/10 text-spotify-green flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-compact-disc"></i>
                    </div>
                    <div>
                        <p class="text-spotify-muted text-xs font-semibold uppercase">Total Songs</p>
                        <h3 class="text-3xl font-bold mt-1">${totalSongs}</h3>
                    </div>
                </div>
                <div class="bg-spotify-elevated p-6 rounded-2xl border border-spotify-highlight shadow-lg flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <p class="text-spotify-muted text-xs font-semibold uppercase">Registered Users</p>
                        <h3 class="text-3xl font-bold mt-1">${totalUsers}</h3>
                    </div>
                </div>
                <div class="bg-spotify-elevated p-6 rounded-2xl border border-spotify-highlight shadow-lg flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-headphones"></i>
                    </div>
                    <div>
                        <p class="text-spotify-muted text-xs font-semibold uppercase">Total Song Plays</p>
                        <h3 class="text-3xl font-bold mt-1">${totalPlays}</h3>
                    </div>
                </div>
            </div>

            <div class="bg-spotify-elevated p-6 rounded-2xl border border-spotify-highlight">
                <h3 class="text-lg font-bold mb-4">Platform Quick Actions</h3>
                <div class="flex flex-wrap gap-4">
                    <button onclick="openAddSongModal()" class="bg-spotify-green hover:bg-spotify-lightgreen text-black font-semibold px-5 py-3 rounded-xl transition flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> Add New Song
                    </button>
                    <button onclick="navigate('admin-songs')" class="bg-spotify-highlight hover:bg-spotify-highlight/80 text-white font-semibold px-5 py-3 rounded-xl transition flex items-center gap-2">
                        <i class="fa-solid fa-compact-disc"></i> Manage Song Catalog
                    </button>
                    <button onclick="navigate('admin-users')" class="bg-spotify-highlight hover:bg-spotify-highlight/80 text-white font-semibold px-5 py-3 rounded-xl transition flex items-center gap-2">
                        <i class="fa-solid fa-users"></i> Manage User Accounts
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderAdminSongs() {
    return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">Song Catalog (${state.songs.length})</h3>
                <button onclick="openAddSongModal()" class="bg-spotify-green hover:bg-spotify-lightgreen text-black font-semibold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> Add Song
                </button>
            </div>

            <div class="bg-spotify-elevated rounded-2xl border border-spotify-highlight overflow-hidden shadow-lg">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-spotify-highlight text-spotify-muted text-xs font-semibold uppercase">
                            <th class="p-4">Title</th>
                            <th class="p-4">Artist</th>
                            <th class="p-4">Genre</th>
                            <th class="p-4">Duration</th>
                            <th class="p-4">Plays</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-spotify-highlight/50 text-sm">
                        ${state.songs.map(song => `
                            <tr class="hover:bg-spotify-highlight/30 transition">
                                <td class="p-4 flex items-center gap-3">
                                    <img src="${song.coverUrl}" class="w-10 h-10 rounded-lg object-cover">
                                    <span class="font-semibold">${song.title}</span>
                                </td>
                                <td class="p-4 text-spotify-muted">${song.artist}</td>
                                <td class="p-4"><span class="px-2.5 py-1 rounded-full bg-spotify-highlight text-xs">${song.genre}</span></td>
                                <td class="p-4 text-spotify-muted">${song.duration}</td>
                                <td class="p-4 text-spotify-muted">${song.plays || 0}</td>
                                <td class="p-4 text-right">
                                    <button onclick="playSong('${song.id}')" class="text-spotify-green hover:text-white p-2 transition" title="Play"><i class="fa-solid fa-play"></i></button>
                                    <button onclick="deleteSong('${song.id}')" class="text-red-400 hover:text-red-300 p-2 transition" title="Delete"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderAdminUsers() {
    return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">Registered Users (${state.users.length})</h3>
            </div>

            <div class="bg-spotify-elevated rounded-2xl border border-spotify-highlight overflow-hidden shadow-lg">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-spotify-highlight text-spotify-muted text-xs font-semibold uppercase">
                            <th class="p-4">User Name</th>
                            <th class="p-4">Email</th>
                            <th class="p-4">Role</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-spotify-highlight/50 text-sm">
                        ${state.users.map(user => `
                            <tr class="hover:bg-spotify-highlight/30 transition">
                                <td class="p-4 flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-spotify-highlight flex items-center justify-center font-bold text-spotify-green">${user.name.charAt(0)}</div>
                                    <span class="font-semibold">${user.name}</span>
                                </td>
                                <td class="p-4 text-spotify-muted">${user.email}</td>
                                <td class="p-4"><span class="px-2.5 py-1 rounded-full bg-spotify-highlight text-xs uppercase font-bold">${user.role}</span></td>
                                <td class="p-4 text-right">
                                    ${user.id !== state.currentUser.id ? `<button onclick="deleteUser('${user.id}')" class="text-red-400 hover:text-red-300 p-2 transition" title="Delete User"><i class="fa-solid fa-trash"></i></button>` : '<span class="text-xs text-spotify-muted italic">Current User</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderUserHome() {
    const featuredSong = state.songs[0] || {};
    const trendingSongs = state.songs.slice(0, 4);
    const genres = [...new Set(state.songs.map(s => s.genre))];

    return `
        <div class="space-y-10">
            <div class="bg-gradient-to-r from-emerald-900 to-spotify-elevated p-8 rounded-3xl border border-spotify-highlight shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div class="space-y-4 max-w-lg">
                    <span class="px-3 py-1 rounded-full bg-spotify-green/20 text-spotify-green text-xs font-bold uppercase tracking-wider">Featured Track</span>
                    <h1 class="text-4xl font-extrabold tracking-tight">${featuredSong.title || 'Melodify Experience'}</h1>
                    <p class="text-spotify-muted text-sm">Experience crystal clear royalty-free audio streams curated just for you. Jump straight into the rhythm.</p>
                    <div class="flex items-center gap-4 pt-2">
                        <button onclick="playSong('${featuredSong.id}')" class="bg-spotify-green hover:bg-spotify-lightgreen text-black font-bold px-8 py-3 rounded-full transition shadow-lg flex items-center gap-2">
                            <i class="fa-solid fa-play"></i> Play Now
                        </button>
                        <button onclick="toggleLike('${featuredSong.id}')" class="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition border border-spotify-highlight">
                            <i class="${isSongLiked(featuredSong.id) ? 'fa-solid fa-heart text-spotify-green' : 'fa-regular fa-heart'} text-lg"></i>
                        </button>
                    </div>
                </div>
                <img src="${featuredSong.coverUrl || 'https://placehold.co/300x300'}" class="w-64 h-64 rounded-2xl object-cover shadow-2xl border border-spotify-highlight">
            </div>

            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-bold tracking-tight">Trending Songs</h3>
                    <button onclick="navigate('search')" class="text-xs font-semibold text-spotify-muted hover:text-white transition">See All</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${trendingSongs.map(song => `
                        <div onclick="playSong('${song.id}')" class="bg-spotify-elevated p-4 rounded-2xl border border-spotify-highlight hover:bg-spotify-highlight/60 transition cursor-pointer group shadow-lg flex flex-col gap-3">
                            <div class="relative aspect-square rounded-xl overflow-hidden bg-black">
                                <img src="${song.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                                <button onclick="event.stopPropagation(); playSong('${song.id}')" class="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0 hover:scale-105">
                                    <i class="fa-solid fa-play ml-0.5"></i>
                                </button>
                            </div>
                            <div>
                                <h4 class="font-bold truncate">${song.title}</h4>
                                <p class="text-xs text-spotify-muted truncate mt-0.5">${song.artist}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-2xl font-bold tracking-tight">Explore Genres</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${genres.map(genre => `
                        <div onclick="searchByGenre('${genre}')" class="bg-gradient-to-br from-spotify-elevated to-spotify-highlight p-6 rounded-2xl border border-spotify-highlight cursor-pointer hover:border-spotify-green transition group">
                            <h4 class="font-bold text-lg group-hover:text-spotify-green transition">${genre}</h4>
                            <p class="text-xs text-spotify-muted mt-1">Explore tracks</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderUserSearch() {
    const query = state.searchQuery.toLowerCase();
    const filteredSongs = state.songs.filter(s => 
        s.title.toLowerCase().includes(query) || 
        s.artist.toLowerCase().includes(query) || 
        s.genre.toLowerCase().includes(query)
    );

    return `
        <div class="space-y-6">
            <div class="space-y-2">
                <h3 class="text-2xl font-bold">Search Catalog</h3>
                <p class="text-sm text-spotify-muted">Filter songs instantly by title, artist, or genre.</p>
            </div>

            <div class="bg-spotify-elevated rounded-2xl border border-spotify-highlight overflow-hidden shadow-lg">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-spotify-highlight text-spotify-muted text-xs font-semibold uppercase">
                            <th class="p-4">Title</th>
                            <th class="p-4">Artist</th>
                            <th class="p-4">Genre</th>
                            <th class="p-4">Duration</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-spotify-highlight/50 text-sm">
                        ${filteredSongs.length > 0 ? filteredSongs.map(song => `
                            <tr class="hover:bg-spotify-highlight/30 transition">
                                <td class="p-4 flex items-center gap-3">
                                    <img src="${song.coverUrl}" class="w-10 h-10 rounded-lg object-cover">
                                    <span class="font-semibold">${song.title}</span>
                                </td>
                                <td class="p-4 text-spotify-muted">${song.artist}</td>
                                <td class="p-4"><span class="px-2.5 py-1 rounded-full bg-spotify-highlight text-xs">${song.genre}</span></td>
                                <td class="p-4 text-spotify-muted">${song.duration}</td>
                                <td class="p-4 text-right flex items-center justify-end gap-2">
                                    <button onclick="toggleLike('${song.id}')" class="text-spotify-muted hover:text-white p-2 transition"><i class="${isSongLiked(song.id) ? 'fa-solid fa-heart text-spotify-green' : 'fa-regular fa-heart'}"></i></button>
                                    <button onclick="openAddToPlaylistModal('${song.id}')" class="text-spotify-muted hover:text-white p-2 transition" title="Add to Playlist"><i class="fa-solid fa-plus"></i></button>
                                    <button onclick="playSong('${song.id}')" class="text-spotify-green hover:text-white p-2 transition" title="Play"><i class="fa-solid fa-play"></i></button>
                                </td>
                            </tr>
                        `).join('') : `<tr><td colspan="5" class="p-8 text-center text-spotify-muted">No songs found matching your search.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderLikedSongs() {
    const userLikes = state.likes[state.currentUser.id] || [];
    const likedSongList = state.songs.filter(s => userLikes.includes(s.id));

    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-purple-900 to-spotify-elevated p-8 rounded-3xl border border-spotify-highlight flex items-center gap-6">
                <div class="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-spotify-green flex items-center justify-center text-3xl text-white shadow-2xl">
                    <i class="fa-solid fa-heart"></i>
                </div>
                <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-spotify-muted">Playlist</span>
                    <h1 class="text-4xl font-extrabold mt-1">Liked Songs</h1>
                    <p class="text-spotify-muted text-sm mt-1">${likedSongList.length} saved tracks</p>
                </div>
            </div>

            <div class="bg-spotify-elevated rounded-2xl border border-spotify-highlight overflow-hidden shadow-lg">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-spotify-highlight text-spotify-muted text-xs font-semibold uppercase">
                            <th class="p-4">Title</th>
                            <th class="p-4">Artist</th>
                            <th class="p-4">Genre</th>
                            <th class="p-4">Duration</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-spotify-highlight/50 text-sm">
                        ${likedSongList.length > 0 ? likedSongList.map(song => `
                            <tr class="hover:bg-spotify-highlight/30 transition">
                                <td class="p-4 flex items-center gap-3">
                                    <img src="${song.coverUrl}" class="w-10 h-10 rounded-lg object-cover">
                                    <span class="font-semibold">${song.title}</span>
                                </td>
                                <td class="p-4 text-spotify-muted">${song.artist}</td>
                                <td class="p-4"><span class="px-2.5 py-1 rounded-full bg-spotify-highlight text-xs">${song.genre}</span></td>
                                <td class="p-4 text-spotify-muted">${song.duration}</td>
                                <td class="p-4 text-right">
                                    <button onclick="toggleLike('${song.id}')" class="text-spotify-green hover:text-white p-2 transition"><i class="fa-solid fa-heart"></i></button>
                                    <button onclick="playSong('${song.id}')" class="text-spotify-green hover:text-white p-2 transition" title="Play"><i class="fa-solid fa-play"></i></button>
                                </td>
                            </tr>
                        `).join('') : `<tr><td colspan="5" class="p-8 text-center text-spotify-muted">No liked songs yet. Start adding your favorites!</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderPlaylistsView() {
    const userPlaylists = state.playlists.filter(p => p.userId === state.currentUser.id);

    return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-2xl font-bold">Your Playlists</h3>
                <button onclick="openCreatePlaylistModal()" class="bg-spotify-green hover:bg-spotify-lightgreen text-black font-semibold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> New Playlist
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${userPlaylists.map(playlist => {
                    const count = playlist.songIds.length;
                    return `
                        <div class="bg-spotify-elevated p-5 rounded-2xl border border-spotify-highlight hover:border-spotify-green transition group shadow-lg flex flex-col gap-4">
                            <div class="aspect-video rounded-xl overflow-hidden bg-black relative">
                                <img src="${playlist.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-lg">${playlist.name}</h4>
                                <p class="text-xs text-spotify-muted mt-1">${count} song${count !== 1 ? 's' : ''}</p>
                            </div>
                            <button onclick="viewPlaylistDetails('${playlist.id}')" class="w-full bg-spotify-highlight hover:bg-spotify-highlight/80 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                                View Playlist
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderProfileView() {
    return `
        <div class="max-w-xl mx-auto space-y-6">
            <div class="bg-spotify-elevated p-8 rounded-3xl border border-spotify-highlight shadow-2xl flex items-center gap-6">
                <div class="w-20 h-20 rounded-full bg-spotify-green text-black font-bold text-3xl flex items-center justify-center">
                    ${state.currentUser.name.charAt(0)}
                </div>
                <div>
                    <h2 class="text-2xl font-bold">${state.currentUser.name}</h2>
                    <p class="text-spotify-muted text-sm">${state.currentUser.email}</p>
                    <span class="inline-block mt-2 px-3 py-1 rounded-full bg-spotify-highlight text-xs uppercase font-bold text-spotify-green">${state.currentUser.role}</span>
                </div>
            </div>

            <div class="bg-spotify-elevated p-6 rounded-2xl border border-spotify-highlight space-y-4">
                <h3 class="text-lg font-bold">Account Settings</h3>
                <div class="flex items-center justify-between py-3 border-b border-spotify-highlight">
                    <div>
                        <p class="font-semibold text-sm">Session Status</p>
                        <p class="text-xs text-spotify-muted">Active and securely stored in LocalStorage</p>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">Active</span>
                </div>
                <button onclick="logout()" class="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-3 rounded-xl transition text-sm">
                    Log Out of Melodify
                </button>
            </div>
        </div>
    `;
}

function playSong(songId) {
    const song = state.songs.find(s => s.id === songId);
    if (!song) return;

    state.currentSong = song;
    state.queue = [song];
    state.queueIndex = 0;

    song.plays = (song.plays || 0) + 1;
    saveState();

    const audio = document.getElementById('audio-element');
    audio.src = song.audioUrl;
    audio.play().then(() => {
        state.isPlaying = true;
        updatePlayerUI();
    }).catch(err => {
        console.error("Audio playback error:", err);
        showToast('Unable to play audio stream.', 'error');
    });
}

function togglePlayPause() {
    const audio = document.getElementById('audio-element');
    if (!state.currentSong) {
        if (state.songs.length > 0) playSong(state.songs[0].id);
        return;
    }

    if (state.isPlaying) {
        audio.pause();
        state.isPlaying = false;
    } else {
        audio.play();
        state.isPlaying = true;
    }
    updatePlayerUI();
}

function updatePlayerUI() {
    const playBtnIcon = document.querySelector('#player-play-btn i');
    if (state.isPlaying) {
        playBtnIcon.className = 'fa-solid fa-pause';
    } else {
        playBtnIcon.className = 'fa-solid fa-play ml-0.5';
    }

    if (state.currentSong) {
        document.getElementById('player-cover').src = state.currentSong.coverUrl;
        document.getElementById('player-song-title').textContent = state.currentSong.title;
        document.getElementById('player-song-artist').textContent = state.currentSong.artist;

        const likeBtnIcon = document.querySelector('#player-like-btn i');
        if (isSongLiked(state.currentSong.id)) {
            likeBtnIcon.className = 'fa-solid fa-heart text-spotify-green';
        } else {
            likeBtnIcon.className = 'fa-regular fa-heart';
        }
    }
}

function updateAudioProgress() {
    const audio = document.getElementById('audio-element');
    if (!audio.duration) return;

    const progress = (audio.currentTime / audio.duration) * 100;
    document.getElementById('player-progress').value = progress;
    document.getElementById('player-current-time').textContent = formatTime(audio.currentTime);
    document.getElementById('player-duration').textContent = formatTime(audio.duration);
}

function seekAudio(val) {
    const audio = document.getElementById('audio-element');
    if (!audio.duration) return;
    audio.currentTime = (val / 100) * audio.duration;
}

function adjustVolume(val) {
    const audio = document.getElementById('audio-element');
    audio.volume = val / 100;
    const icon = document.getElementById('volume-icon');
    if (val == 0) {
        icon.className = 'fa-solid fa-volume-xmark text-sm';
    } else if (val < 50) {
        icon.className = 'fa-solid fa-volume-low text-sm';
    } else {
        icon.className = 'fa-solid fa-volume-high text-sm';
    }
}

function toggleMute() {
    const audio = document.getElementById('audio-element');
    audio.muted = !audio.muted;
    document.getElementById('volume-icon').className = audio.muted ? 'fa-solid fa-volume-xmark text-sm' : 'fa-solid fa-volume-high text-sm';
}

function playNextSong() {
    if (state.songs.length === 0) return;
    state.queueIndex = (state.queueIndex + 1) % state.songs.length;
    playSong(state.songs[state.queueIndex].id);
}

function playPreviousSong() {
    if (state.songs.length === 0) return;
    state.queueIndex = (state.queueIndex - 1 + state.songs.length) % state.songs.length;
    playSong(state.songs[state.queueIndex].id);
}

function handleSongEnded() {
    if (state.isLoop) {
        const audio = document.getElementById('audio-element');
        audio.currentTime = 0;
        audio.play();
    } else {
        playNextSong();
    }
}

function toggleLoop() {
    state.isLoop = !state.isLoop;
    const btn = document.getElementById('player-loop-btn');
    btn.className = state.isLoop ? 'text-spotify-green transition' : 'text-spotify-muted hover:text-white transition';
    showToast(state.isLoop ? 'Loop enabled' : 'Loop disabled', 'info');
}

function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    const btn = document.getElementById('player-shuffle-btn');
    btn.className = state.isShuffle ? 'text-spotify-green transition' : 'text-spotify-muted hover:text-white transition';
    showToast(state.isShuffle ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function isSongLiked(songId) {
    if (!state.currentUser) return false;
    const userLikes = state.likes[state.currentUser.id] || [];
    return userLikes.includes(songId);
}

function toggleLike(songId) {
    if (!state.currentUser) return;
    if (!state.likes[state.currentUser.id]) {
        state.likes[state.currentUser.id] = [];
    }

    const idx = state.likes[state.currentUser.id].indexOf(songId);
    if (idx > -1) {
        state.likes[state.currentUser.id].splice(idx, 1);
        showToast('Removed from Liked Songs', 'info');
    } else {
        state.likes[state.currentUser.id].push(songId);
        showToast('Added to Liked Songs', 'success');
    }
    saveState();
    renderView();
    updatePlayerUI();
}

function toggleCurrentLike() {
    if (state.currentSong) {
        toggleLike(state.currentSong.id);
    }
}

function searchByGenre(genre) {
    navigate('search');
    document.getElementById('global-search-input').value = genre;
    handleSearchInput(genre);
}

function handleSearchInput(val) {
    state.searchQuery = val;
    renderView();
}

function openModal(htmlContent) {
    const container = document.getElementById('modal-container');
    container.innerHTML = htmlContent;
    container.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-container').classList.add('hidden');
}

function openAddSongModal() {
    openModal(`
        <div class="bg-spotify-elevated w-full max-w-lg p-8 rounded-3xl border border-spotify-highlight shadow-2xl space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">Add New Song</h3>
                <button onclick="closeModal()" class="text-spotify-muted hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <form onsubmit="handleAddSong(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold uppercase text-spotify-muted mb-1">Song Title</label>
                    <input type="text" id="song-title" required placeholder="Summer Breeze" class="w-full bg-spotify-base border border-spotify-highlight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-spotify-green">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-spotify-muted mb-1">Artist Name</label>
                    <input type="text" id="song-artist" required placeholder="Melodic Crew" class="w-full bg-spotify-base border border-spotify-highlight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-spotify-green">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-spotify-muted mb-1">Genre</label>
                        <input type="text" id="song-genre" required placeholder="Pop" class="w-full bg-spotify-base border border-spotify-highlight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-spotify-green">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-spotify-muted mb-1">Duration</label>
                        <input type="text" id="song-duration" required placeholder="3:45" class="w-full bg-spotify-base border border-spotify-highlight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-spotify-green">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-spotify-muted mb-1">Audio Stream URL (MP3)</label>
                    <input type="url" id="song-audiourl" required placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" class="w-full bg-spotify-base border border-spotify-highlight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-spotify-green">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-spotify-muted mb-1">Cover Image URL</label>
                    <input type="url" id="song-coverurl" required placeholder="https://images.unsplash.com/..." class="w-full bg-spotify-base border border-spotify-highlight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-spotify-green">
                </div>
                <button type="submit" class="w-full bg-spotify-green hover:bg-spotify-lightgreen text-black font-bold py-3 rounded-xl transition shadow-lg mt-2">
                    Save Song
                </button>
            </form>
        </div>
    `);
}

function handleAddSong(e) {
    e.preventDefault();
    const newSong = {
        id: 's_' + Date.now(),
        title: document.getElementById('song-title').value.trim(),
        artist: document.getElementById('song-artist').value.trim(),
        genre: document.getElementById('song-genre').value.trim(),
        duration: document.getElementById('song-duration').value.trim(),
        audioUrl: document.getElementById('song-audiourl').value.trim(),
        coverUrl: document.getElementById('song-coverurl').value.trim(),
        plays: 0
    };

    state.songs.push(newSong);
    saveState();
    closeModal();
    showToast('Song added successfully!', 'success');
    renderView();
}

function deleteSong(songId) {
    state.songs = state.songs.filter(s => s.id !== songId);
    saveState();
    showToast('Song deleted successfully', 'info');
    renderView();
}

function deleteUser(userId) {
    state.users = state.users.filter(u => u.id !== userId);
    saveState();
    showToast('User deleted successfully', 'info');
    renderView();
}

function openCreatePlaylistModal() {
    openModal(`
        <div class="bg-spotify-elevated w-full max-w-md p-8 rounded-3xl border border-spotify-highlight shadow-2xl space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">Create New Playlist</h3>
                <button onclick="closeModal()" class="text-spotify-muted hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <form onsubmit="handleCreatePlaylist(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold uppercase text-spotify-muted mb-1">Playlist Name</label>
                    <input type="text" id="playlist-name" required placeholder="Late Night Lo-Fi" class="w-full bg-spotify-base border border-spotify-highlight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-spotify-green">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-spotify-muted mb-1">Cover Image URL</label>
                    <input type="url" id="playlist-cover" required placeholder="https://images.unsplash.com/..." class="w-full bg-spotify-base border border-spotify-highlight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-spotify-green">
                </div>
                <button type="submit" class="w-full bg-spotify-green hover:bg-spotify-lightgreen text-black font-bold py-3 rounded-xl transition shadow-lg mt-2">
                    Create Playlist
                </button>
            </form>
        </div>
    `);
}

function handleCreatePlaylist(e) {
    e.preventDefault();
    const newPlaylist = {
        id: 'p_' + Date.now(),
        name: document.getElementById('playlist-name').value.trim(),
        userId: state.currentUser.id,
        songIds: [],
        coverUrl: document.getElementById('playlist-cover').value.trim()
    };

    state.playlists.push(newPlaylist);
    saveState();
    closeModal();
    showToast('Playlist created successfully!', 'success');
    renderView();
}

function openAddToPlaylistModal(songId) {
    const userPlaylists = state.playlists.filter(p => p.userId === state.currentUser.id);
    openModal(`
        <div class="bg-spotify-elevated w-full max-w-md p-8 rounded-3xl border border-spotify-highlight shadow-2xl space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">Add to Playlist</h3>
                <button onclick="closeModal()" class="text-spotify-muted hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto">
                ${userPlaylists.length > 0 ? userPlaylists.map(playlist => `
                    <div onclick="addSongToPlaylist('${playlist.id}', '${songId}')" class="p-3 bg-spotify-base hover:bg-spotify-highlight rounded-xl border border-spotify-highlight cursor-pointer transition flex items-center justify-between">
                        <span class="font-semibold text-sm">${playlist.name}</span>
                        <i class="fa-solid fa-plus text-spotify-green"></i>
                    </div>
                `).join('') : '<p class="text-sm text-spotify-muted text-center py-4">No playlists found. Create one first!</p>'}
            </div>
        </div>
    `);
}

function addSongToPlaylist(playlistId, songId) {
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songIds.includes(songId)) {
        playlist.songIds.push(songId);
        saveState();
        showToast('Added song to playlist!', 'success');
    } else {
        showToast('Song already exists in this playlist.', 'info');
    }
    closeModal();
}

function viewPlaylistDetails(playlistId) {
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const playlistSongs = state.songs.filter(s => playlist.songIds.includes(s.id));
    const container = document.getElementById('main-view-container');
    document.getElementById('page-title').textContent = playlist.name;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-blue-900 to-spotify-elevated p-8 rounded-3xl border border-spotify-highlight flex items-center gap-6">
                <img src="${playlist.coverUrl}" class="w-24 h-24 rounded-2xl object-cover shadow-2xl border border-spotify-highlight">
                <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-spotify-muted">Custom Playlist</span>
                    <h1 class="text-4xl font-extrabold mt-1">${playlist.name}</h1>
                    <p class="text-spotify-muted text-sm mt-1">${playlistSongs.length} tracks</p>
                </div>
            </div>

            <div class="bg-spotify-elevated rounded-2xl border border-spotify-highlight overflow-hidden shadow-lg">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-spotify-highlight text-spotify-muted text-xs font-semibold uppercase">
                            <th class="p-4">Title</th>
                            <th class="p-4">Artist</th>
                            <th class="p-4">Genre</th>
                            <th class="p-4">Duration</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-spotify-highlight/50 text-sm">
                        ${playlistSongs.length > 0 ? playlistSongs.map(song => `
                            <tr class="hover:bg-spotify-highlight/30 transition">
                                <td class="p-4 flex items-center gap-3">
                                    <img src="${song.coverUrl}" class="w-10 h-10 rounded-lg object-cover">
                                    <span class="font-semibold">${song.title}</span>
                                </td>
                                <td class="p-4 text-spotify-muted">${song.artist}</td>
                                <td class="p-4"><span class="px-2.5 py-1 rounded-full bg-spotify-highlight text-xs">${song.genre}</span></td>
                                <td class="p-4 text-spotify-muted">${song.duration}</td>
                                <td class="p-4 text-right">
                                    <button onclick="playSong('${song.id}')" class="text-spotify-green hover:text-white p-2 transition" title="Play"><i class="fa-solid fa-play"></i></button>
                                </td>
                            </tr>
                        `).join('') : `<tr><td colspan="5" class="p-8 text-center text-spotify-muted">This playlist is empty. Explore and add songs!</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    let bgClass = 'bg-spotify-green text-black';
    if (type === 'error') bgClass = 'bg-red-500 text-white';
    if (type === 'info') bgClass = 'bg-spotify-highlight text-white border border-spotify-highlight';

    toast.className = `pointer-events-auto px-5 py-3 rounded-2xl font-semibold text-sm shadow-2xl transition transform translate-y-2 opacity-0 flex items-center gap-3 ${bgClass}`;
    
    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.onload = function() {
    initLocalStorage();
};