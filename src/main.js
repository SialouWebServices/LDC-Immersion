import { ConvexClient } from "convex/browser";
// import { api } from "../convex/_generated/api"; // Note: we'll use string names since we might not have generated files yet in this environment

// ===== CONVEX =====
const CONVEX_URL = "https://earnest-nightingale-377.convex.cloud";
const client = new ConvexClient(CONVEX_URL);

// ===== DATA =====
        const POLES_DATA = [
            { id: 'planning', name: 'Planning', icon: '📋', desc: 'Gestion du calendrier et ressources', color: '#EEF2FF' },
            { id: 'conception', name: 'Conception', icon: '✏️', desc: 'Architecture et plans techniques', color: '#FFF7ED' },
            { id: 'gestion', name: 'Gestion & Construction', icon: '🏗️', desc: 'Suivi de chantier et exécution', color: '#F0FDF4' },
            { id: 'qualite', name: 'Qualité Assurance', icon: '🛡️', desc: 'Normes et conformité LDC', color: '#F5F3FF' },
            { id: 'maintenance', name: 'Maint. & Fonctionnement', icon: '⚙️', desc: 'Gestion technique du Béthel', color: '#FFF1F2' },
            { id: 'support', name: 'Support', icon: '💻', desc: 'Services transverses et IT', color: '#F0F9FF' }
        ];

        let PROGRAM_DATA = [
            { day: 1, date: 'Mercredi 15 Avril', items: ['Arrivée & Présentation (08:30)', 'Pôle Planning', 'Pôle Conception'] },
            { day: 2, date: 'Jeudi 16 Avril', items: ['Pôle Gestion & Construction', 'Pôle Qualité Assurance'] },
            { day: 3, date: 'Vendredi 17 Avril', items: ['Pôle Maintenance', 'Pôle Support', 'Synthèse & Débriefing'] }
        ];

        let state = {
            currentUser: 'Rodrigue',
            currentTab: 'overview',
            selectedPoleId: null,
            poles: POLES_DATA.map(p => ({
                ...p,
                visited: { Rodrigue: false, Henriette: false },
                notes: { Rodrigue: '', Henriette: '' },
                questions: []
            })),
            contacts: [],
            generalNotes: [],
            iaReport: null,
            iaActionPlan: null,
            isGeneratingIA: false,
            isGeneratingActionPlan: false,
            isRecordingAudio: false,
            showConfig: false,
            activeJournalTab: 'text',
            activePoleTab: 'text',
            isEditingProgram: false,
            pendingMedia: null,
            mediaRecorder: null,
            audioChunks: [],
            onlineUsers: {}
        };

        // ===== PRESENCE =====
        function setupPresence() {
            // Heartbeat
            setInterval(() => {
                if (navigator.onLine) {
                    client.mutation("presence:update", { user: state.currentUser });
                }
            }, 5000);

            // Subscribe to presence
            client.watchQuery("presence:list", {}).onUpdate((users) => {
                state.onlineUsers = {};
                users.forEach(u => {
                    state.onlineUsers[u.user] = true;
                });
                updatePresenceUI();
            });
        }

        function updatePresenceUI() {
            // Find "the other" user
            const otherUser = state.currentUser === 'Rodrigue' ? 'Henriette' : 'Rodrigue';
            const isOnline = !!state.onlineUsers[otherUser];
            
            const p1 = document.getElementById('header-presence');
            const p2 = document.getElementById('sidebar-presence');
            if (p1) p1.className = `presence-indicator ${isOnline ? 'online' : ''}`;
            if (p2) p2.className = `presence-indicator ${isOnline ? 'online' : ''}`;
            
            // Re-render UI to show indicators elsewhere if needed
            const visitDots = document.querySelectorAll('.visit-dot');
            // Optimization: Just rely on the main headers.
        }

        // ===== SPLASH =====
        function chooseSplashUser(user) {
            setUser(user);
            const splash = document.getElementById('splash');
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                showLoading();
                initSync();
            }, 350);
        }

        function showLoading() {
            document.getElementById('loading-overlay').style.display = 'flex';
        }
        function hideLoading() {
            document.getElementById('loading-overlay').style.display = 'none';
        }

        // ===== USER =====
        function setUser(user) {
            state.currentUser = user;
            document.body.className = `user-${user.toLowerCase()}`;

            const initial = user.charAt(0);
            document.getElementById('header-avatar').textContent = initial;
            document.getElementById('header-username').textContent = user;
            document.getElementById('sidebar-avatar').textContent = initial;
            document.getElementById('sidebar-username').textContent = user;

            // Update modal active state
            document.getElementById('modal-rodrigue').classList.toggle('active', user === 'Rodrigue');
            document.getElementById('modal-henriette').classList.toggle('active', user === 'Henriette');

            render();
        }


        function openUserSwitch() { document.getElementById('user-switch-modal').classList.add('open'); }
        function closeUserSwitch() { document.getElementById('user-switch-modal').classList.remove('open'); }

        // ===== CONVEX SYNC =====
        function initSync() {
            console.log("🚀 Initialisation de la synchronisation Convex...");
            showLoading();

            // Sécurité : Forcer la fermeture du loading après 5 secondes maximum
            const loadingTimeout = setTimeout(() => {
                console.warn("⚠️ Délai de synchronisation dépassé, forçage de l'affichage.");
                hideLoading();
                render();
            }, 5000);
            
            // Subscribe to Poles
            client.watchQuery("poles:list", {}).onUpdate((poles) => {
                console.log("📍 Mise à jour Pôles reçue:", poles);
                if (poles && poles.length > 0) {
                    poles.forEach(p => {
                        const lp = state.poles.find(x => x.id === p.id);
                        if (lp) {
                            lp.visited.Rodrigue = p.visited_rodrigue;
                            lp.visited.Henriette = p.visited_henriette;
                            lp.notes.Rodrigue = p.notes_rodrigue || '';
                            lp.notes.Henriette = p.notes_henriette || '';
                            lp.questions = p.questions || [];
                        }
                    });
                } else if (poles && poles.length === 0) {
                    console.log("💾 Base de données vide, initialisation des pôles...");
                    client.mutation("poles:seed", { 
                        poles: POLES_DATA.map(p => ({ id: p.id, name: p.name })) 
                    });
                }
                clearTimeout(loadingTimeout);
                hideLoading(); 
                render();
                if (state.selectedPoleId) renderPanelContent();
            });

            // Subscribe to Contacts
            client.watchQuery("contacts:list", {}).onUpdate((contacts) => {
                console.log("👥 Mise à jour Contacts reçue:", contacts);
                state.contacts = contacts;
                render();
            });

            // Subscribe to Notes
            client.watchQuery("notes:list", {}).onUpdate((notes) => {
                console.log("📝 Mise à jour Notes reçue:", notes);
                state.generalNotes = notes;
                render();
                if (state.selectedPoleId) renderPanelContent();
            });

            // Subscribe to Programs
            client.watchQuery("programs:list", {}).onUpdate((programs) => {
                console.log("📅 Mise à jour Programme reçue:", programs);
                if (programs && programs.length > 0) {
                    PROGRAM_DATA = programs.map(p => ({ day: p.day, date: p.date, items: p.items || [] }));
                    render();
                }
            });
                
            setupPresence();
        }


        // ===== NAVIGATION =====
        function setTab(tab, el) {
            state.currentTab = tab;
            // Update all nav items across bottom-nav AND sidebar
            document.querySelectorAll('#bottom-nav .nav-item, #sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
            // Find matching items and activate
            document.querySelectorAll(`#bottom-nav .nav-item, #sidebar-nav .nav-item`).forEach(n => {
                if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${tab}'`)) n.classList.add('active');
            });
            render();
        }

        // ===== RENDERING =====
        function render() {
            const container = document.getElementById('main-content');
            if (!container) return;
            if (state.currentTab === 'overview') renderOverview(container);
            else if (state.currentTab === 'poles') renderPoles(container);
            else if (state.currentTab === 'journal') renderJournal(container);
            else if (state.currentTab === 'gallery') renderGallery(container);
            else if (state.currentTab === 'contacts') renderContacts(container);
            else if (state.currentTab === 'ia') renderIA(container);
        }

        // --- Aperçu ---
        function renderOverview(container) {
            const totalVisited = state.poles.filter(p => p.visited.Rodrigue || p.visited.Henriette).length;
            const progress = Math.round((totalVisited / state.poles.length) * 100);
            const stats = {
                poles: totalVisited,
                notes: state.poles.reduce((a, p) => a + (p.notes.Rodrigue ? 1 : 0) + (p.notes.Henriette ? 1 : 0), 0),
                journal: state.generalNotes.length,
                contacts: state.contacts.length
            };
            container.innerHTML = `
            <div style="margin-bottom:1.25rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span style="font-size:13px;font-weight:600;">Progression Collective</span>
                    <span style="font-size:16px;font-weight:700;color:var(--user-main);">${progress}%</span>
                </div>
                <div class="progress-bar-wrap"><div class="progress-fill" style="width:${progress}%"></div></div>
            </div>
            <div class="stats-grid">
                <div class="stat-card"><span class="stat-value">${stats.poles}</span><span class="stat-label">Pôles</span></div>
                <div class="stat-card"><span class="stat-value">${stats.notes}</span><span class="stat-label">Notes pôles</span></div>
                <div class="stat-card"><span class="stat-value">${stats.journal}</span><span class="stat-label">Journal</span></div>
                <div class="stat-card"><span class="stat-value">${stats.contacts}</span><span class="stat-label">Contacts</span></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <h3 class="section-title" style="margin:0;">📅 Programme</h3>
                <span class="program-edit-btn" onclick="toggleProgramEdit()">
                    ${state.isEditingProgram ? '✓ Terminer' : '✏️ Modifier'}
                </span>
            </div>
            ${PROGRAM_DATA.map((day, dIdx) => `
                <div class="card program-card">
                    <div class="program-day-title">📆 ${day.date}</div>
                    ${day.items.map((item, iIdx) => `
                        <div class="program-item">
                            ${state.isEditingProgram ? `
                                <input type="text" value="${item}" onchange="updateProgramItem(${dIdx},${iIdx},this.value)" style="flex:1;font-size:14px;margin-right:8px;">
                                <button class="btn btn-ghost btn-sm" onclick="removeProgramItem(${dIdx},${iIdx})">✕</button>
                            ` : `<span>${item}</span>`}
                        </div>
                    `).join('')}
                    ${state.isEditingProgram ? `<button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px;" onclick="addProgramItem(${dIdx})">+ Ajouter</button>` : ''}
                </div>
            `).join('')}
        `;
        }

        // --- Pôles ---
        function renderPoles(container) {
            container.innerHTML = `
            <h3 class="section-title">📍 Suivi des Pôles</h3>
            <div class="poles-grid">
                ${state.poles.map(pole => {
                const isDuo = pole.visited.Rodrigue && pole.visited.Henriette;
                const isR = pole.visited.Rodrigue;
                const isH = pole.visited.Henriette;
                const tag = isDuo ? '<span class="visit-tag tag-duo">Duo ✓</span>'
                    : isR ? '<span class="visit-tag tag-rodrigue">R</span>'
                        : isH ? '<span class="visit-tag tag-henriette">H</span>' : '';
                return `
                        <div class="pole-card ${state.selectedPoleId === pole.id ? 'selected' : ''}" onclick="openPoleDetails('${pole.id}')">
                            <div class="pole-icon">${pole.icon}</div>
                            <div class="pole-name">${pole.name}</div>
                            <div class="pole-desc">${pole.desc}</div>
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:8px;">
                                <div class="visit-indicators">
                                    <div class="visit-dot ${isR ? 'active-rodrigue' : ''}"></div>
                                    <div class="visit-dot ${isH ? 'active-henriette' : ''}"></div>
                                </div>
                                ${tag}
                            </div>
                        </div>`;
            }).join('')}
            </div>
        `;
        }

        // --- Panel Pôle ---
        function openPoleDetails(poleId) {
            state.selectedPoleId = poleId;
            const pole = state.poles.find(p => p.id === poleId);
            document.getElementById('panel-title').textContent = `${pole.icon} ${pole.name}`;
            
            // Dynamic Background
            const root = document.documentElement;
            const isDark = root.getAttribute('data-theme') === 'dark';
            const poleColor = isDark ? '#1a1a1a' : (pole.color || 'var(--bg-secondary)');
            root.style.setProperty('--pole-color', poleColor);
            
            renderPanelContent();
            document.getElementById('side-panel').classList.add('open');
        }
        function closePanel() {
            document.getElementById('side-panel').classList.remove('open');
            state.selectedPoleId = null;
            state.activePoleTab = 'text';
            state.pendingMedia = null;
            
            // Reset Dynamic Background
            document.documentElement.style.setProperty('--pole-color', 'var(--bg-secondary)');
            
            render();
        }

        function renderPanelContent() {
            const pole = state.poles.find(p => p.id === state.selectedPoleId);
            if (!pole) return;
            const isVisited = pole.visited[state.currentUser];
            document.getElementById('panel-content').innerHTML = `
            <div class="card" style="display:flex;justify-content:space-between;align-items:center;background:${isVisited ? 'var(--user-bg)' : 'white'}">
                <span style="font-weight:600;">Visité par ${state.currentUser} ?</span>
                <button class="btn ${isVisited ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="toggleVisit('${pole.id}')">
                    ${isVisited ? '✓ OUI' : 'NON'}
                </button>
            </div>

            <h3 class="section-title">📝 Notes & Observations</h3>
            <div class="dual-notes">
                <div class="note-col">
                    <label class="label-rodrigue">📘 RODRIGUE</label>
                    <textarea rows="3" onchange="updateNoteRemote('${pole.id}','Rodrigue',this.value)">${pole.notes.Rodrigue}</textarea>
                </div>
                <div class="note-col">
                    <label class="label-henriette">📗 HENRIETTE</label>
                    <textarea rows="3" onchange="updateNoteRemote('${pole.id}','Henriette',this.value)">${pole.notes.Henriette}</textarea>
                </div>
            </div>

            ${renderCaptureArea('pole', pole.id)}

            <h3 class="section-title" style="margin-top:20px;">📜 Journal du Pôle</h3>
            ${state.generalNotes.filter(n => n.pole_id === pole.id).map(n => renderNoteCard(n)).join('') || '<p style="color:var(--text-secondary);font-size:13px;">Aucune note pour ce pôle.</p>'}

            <h3 class="section-title" style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
                Questions
                <button class="btn btn-ghost btn-sm" style="font-size:10px; color:var(--user-main);" onclick="generateSmartQuestions('${pole.id}')">💡 Suggérer des questions</button>
            </h3>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
                <input type="text" id="new-question" placeholder="Ajouter une question..." style="flex:1;">
                <button class="btn btn-primary btn-sm" onclick="addQuestionRemote('${pole.id}')">+</button>
            </div>
            ${pole.questions.map((q, idx) => `
                <div class="question-card">
                    <div>
                        <div style="font-size:13px;">${q.text}</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Par ${q.by}</div>
                    </div>
                    <button class="btn btn-ghost btn-sm" onclick="deleteQuestionRemote('${pole.id}',${idx})">✕</button>
                </div>
            `).join('')}
        `;
        }

        // --- Journal ---
        function renderJournal(container) {
            container.innerHTML = `
            ${renderCaptureArea('journal')}
            <h3 class="section-title" style="margin-top:4px;">📒 Mes Notes</h3>
            ${state.generalNotes.filter(n => !n.pole_id).length === 0
                    ? '<p style="color:var(--text-secondary);font-size:13px;text-align:center;padding:20px 0;">Aucune note pour le moment.</p>'
                    : state.generalNotes.filter(n => !n.pole_id).map(n => renderNoteCard(n)).join('')
                }
        `;
        }

        // --- Galerie ---
        function renderGallery(container) {
            const media = state.generalNotes.filter(n => n.media_url);
            container.innerHTML = `
            <h3 class="section-title">🖼️ Galerie Multimédia</h3>
            ${media.length === 0
                    ? '<p style="color:var(--text-secondary);text-align:center;padding:30px 0;">Aucun média capturé pour le moment.</p>'
                    : `<div class="gallery-grid">
                    ${media.map(n => `
                        <div class="gallery-item" onclick="${n.media_type === 'image' ? `openLightbox('${n.media_url}', '${n.title || ''}', '${n.author}')` : ''}">
                            ${n.media_type === 'image' ? `<img src="${n.media_url}" alt="${n.title || 'Photo'}">` : ''}
                            ${n.media_type === 'video' ? `<video src="${n.media_url}"></video>` : ''}
                            ${n.media_type === 'audio' ? `<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:40px;">🎤</div>` : ''}
                            <div class="gallery-item-overlay">${n.title || n.media_type} • ${n.author}</div>
                        </div>
                    `).join('')}
                   </div>`
                }
        `;
        }

        // ===== LIGHTBOX =====
        function openLightbox(url, title, author) {
            document.getElementById('lightbox-img').src = url;
            document.getElementById('lightbox-caption').innerText = title ? `${title} (par ${author})` : `Capture par ${author}`;
            document.getElementById('lightbox').classList.add('open');
        }
        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('open');
            setTimeout(() => { document.getElementById('lightbox-img').src = ''; }, 300);
        }

        // --- Contacts ---
        function renderContacts(container) {
            container.innerHTML = `
            <h3 class="section-title">👥 Contacts Établis</h3>
            <div class="card">
                <input type="text"  id="c-name" placeholder="Nom complet" style="margin-bottom:8px;" autocomplete="off">
                <select id="c-role" style="margin-bottom:8px;">
                    <option value="">Sélectionner un Pôle / Rôle</option>
                    ${POLES_DATA.map(p => `<option value="${p.name}">${p.icon} ${p.name}</option>`).join('')}
                    <option value="Autre">Autre</option>
                </select>
                <textarea id="c-memo" placeholder="Mémo (téléphone, email, infos...)" rows="2" style="margin-bottom:8px;"></textarea>
                <button class="btn btn-primary" onclick="addContactRemote()">➕ Ajouter le contact</button>
            </div>
            ${state.contacts.map(c => `
                <div class="contact-card">
                    <div class="contact-avatar">${c.name.charAt(0).toUpperCase()}</div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">${c.name}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">${c.role || 'Sans rôle'}${c.memo ? ' • ' + c.memo : ''}</div>
                    </div>
                    <button class="btn btn-ghost btn-sm" onclick="deleteContactRemote('${c._id}')">✕</button>
                </div>
            `).join('')}
        `;
        }

        // --- IA ---
        function renderIA(container) {
            container.innerHTML = `
            <div class="ia-box">
                <h2>🪄 Synthèse IA</h2>
                <p style="font-size:13px;color:var(--text-secondary);">Analyse collaborative des données en temps réel.</p>
                <div class="ia-btn-row">
                    <button class="btn btn-primary" onclick="generateReport()">🪄 Synthèse Globale</button>
                    <button class="btn btn-primary" style="background:#6366f1;" onclick="generateActionPlan()">📋 Plan d'Action</button>
                    <button class="btn btn-ghost" style="background:#4caf50;color:white;" onclick="exportToPDF()">📄 Exporter PDF</button>
                    <button class="btn btn-primary" style="background:var(--henriette-main);color:white;grid-column: 1 / -1;" onclick="startPresentation()">📽️ Lancer le Débriefing</button>
                </div>
            </div>

            ${state.isGeneratingIA || state.isGeneratingActionPlan ? '<p style="text-align:center;padding:20px;">⏳ Analyse IA en cours...</p>' : ''}
            
            ${state.iaActionPlan ? `
                <div class="card" style="border-left:4px solid #6366f1; margin-bottom:20px;">
                    <h3 style="margin-bottom:10px; color:#6366f1;">🚀 Plan d'Action Prioritaire</h3>
                    <div class="ia-markdown-content" style="font-size:14px;">${marked.parse(state.iaActionPlan)}</div>
                </div>
            ` : ''}

            ${state.iaReport ? `<div class="card ia-markdown-content" style="font-size:14px;line-height:1.7;">${marked.parse(state.iaReport)}</div>` : ''}
        `;
        }

        // ===== CAPTURE AREA =====
        function renderCaptureArea(context, poleId = null) {
            const activeTab = context === 'journal' ? state.activeJournalTab : state.activePoleTab;
            const setTabFn = context === 'journal' ? 'setActiveJournalTab' : 'setActivePoleTab';
            const pendingStatus = state.pendingMedia
                ? `<div class="upload-status success">✅ Média prêt à enregistrer</div>`
                : '';

            return `
            <div class="card">
                <div style="font-weight:600;font-size:14px;margin-bottom:12px;">
                    📎 Capturer une note ${poleId ? 'pour ce pôle' : ''}
                </div>
                <div class="sub-nav">
                    <div class="sub-nav-item ${activeTab === 'text' ? 'active' : ''}" onclick="${setTabFn}('text')">📝 Texte</div>
                    <div class="sub-nav-item ${activeTab === 'photo' ? 'active' : ''}" onclick="${setTabFn}('photo')">📸 Photo</div>
                    <div class="sub-nav-item ${activeTab === 'video' ? 'active' : ''}" onclick="${setTabFn}('video')">🎥 Vidéo</div>
                    <div class="sub-nav-item ${activeTab === 'audio' ? 'active' : ''}" onclick="${setTabFn}('audio')">🎤 Vocal</div>
                </div>

                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${activeTab === 'text' ? `
                        <input type="text" id="${context}-note-title" placeholder="Titre (optionnel)">
                        <textarea id="${context}-note-content" placeholder="Écrivez vos notes ici..." rows="3"></textarea>
                    ` : ''}

                    ${activeTab === 'photo' ? `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            <div class="media-btn" onclick="document.getElementById('${context}-photo-local').click()">
                                <span class="media-icon">📁</span> Charger
                            </div>
                            <div class="media-btn" onclick="document.getElementById('${context}-photo-camera').click()">
                                <span class="media-icon">📸</span> Caméra
                            </div>
                        </div>
                        <input type="file" id="${context}-photo-local"  accept="image/*"            style="display:none" onchange="handleMediaFile(this,'image','${context}')">
                        <input type="file" id="${context}-photo-camera" accept="image/*" capture="environment" style="display:none" onchange="handleMediaFile(this,'image','${context}')">
                        <div id="${context}-preview-area"></div>
                        ${pendingStatus}
                    ` : ''}

                    ${activeTab === 'video' ? `
                        <div class="media-btn" onclick="document.getElementById('${context}-video-input').click()">
                            <span class="media-icon">🎥</span> Enregistrer / Charger une vidéo
                        </div>
                        <input type="file" id="${context}-video-input" accept="video/*" capture="environment" style="display:none" onchange="handleMediaFile(this,'video','${context}')">
                        <div id="${context}-preview-area"></div>
                        ${pendingStatus}
                    ` : ''}

                    ${activeTab === 'audio' ? `
                        <div class="media-btn ${state.isRecordingAudio ? 'recording' : ''}" onclick="toggleAudioRecording('${context}')">
                            <span class="media-icon">${state.isRecordingAudio ? '⏹️' : '🎤'}</span>
                            ${state.isRecordingAudio ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement vocal'}
                        </div>
                        <div id="${context}-audio-preview"></div>
                        ${pendingStatus}
                    ` : ''}

                    <div id="${context}-upload-status"></div>

                    <button class="btn btn-primary" onclick="saveNoteRemote('${context}','${poleId || ''}')">
                        💾 Enregistrer la note
                    </button>
                </div>
            </div>
        `;
        }

        function setActiveJournalTab(tab) { state.activeJournalTab = tab; state.pendingMedia = null; render(); }
        function setActivePoleTab(tab) { state.activePoleTab = tab; state.pendingMedia = null; renderPanelContent(); }

        // ===== MEDIA UPLOAD =====
        async function handleMediaFile(input, type, context) {
            const file = input.files[0];
            if (!file) return;

            const statusEl = document.getElementById(`${context}-upload-status`);
            const previewEl = document.getElementById(`${context}-preview-area`);

            if (statusEl) { statusEl.innerHTML = '<div class="upload-status loading">⬆️ Téléchargement en cours...</div>'; }

            try {
                // 1. Get upload URL
                const uploadUrl = await client.mutation("notes:generateUploadUrl");

                // 2. POST file to Convex
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });
                const { storageId } = await result.json();

                // 3. Store storageId in state
                state.pendingMedia = { 
                    type, 
                    url: storageId, // Store storageId as "url" to be saved in notes table
                    localUrl: URL.createObjectURL(file) // For immediate preview
                };

                if (statusEl) { statusEl.innerHTML = '<div class="upload-status success">✅ Média prêt à enregistrer</div>'; }
                if (previewEl) {
                    if (type === 'image') previewEl.innerHTML = `<div class="media-preview-container"><img src="${state.pendingMedia.localUrl}"></div>`;
                    if (type === 'video') previewEl.innerHTML = `<div class="media-preview-container"><video controls src="${state.pendingMedia.localUrl}"></video></div>`;
                }
            } catch (err) {
                console.error('Upload error:', err);
                if (statusEl) { statusEl.innerHTML = `<div class="upload-status error">❌ Erreur : ${err.message}</div>`; }
            }
        }

        // ===== AUDIO RECORDING =====
        let speechRecognition = null;

        async function toggleAudioRecording(context) {
            if (!state.isRecordingAudio) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    state.mediaRecorder = new MediaRecorder(stream);
                    state.audioChunks = [];
                    
                    // Start Speech Recognition if supported
                    if ('webkitSpeechRecognition' in window) {
                        speechRecognition = new webkitSpeechRecognition();
                        speechRecognition.continuous = true;
                        speechRecognition.interimResults = true;
                        speechRecognition.lang = 'fr-FR';
                        
                        let finalTranscript = '';
                        speechRecognition.onresult = event => {
                            let interimTranscript = '';
                            for (let i = event.resultIndex; i < event.results.length; ++i) {
                                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
                                else interimTranscript += event.results[i][0].transcript;
                            }
                            const textInput = document.getElementById(context + '-note-content');
                            if (textInput) {
                                textInput.value = (finalTranscript + interimTranscript).trim();
                            }
                        };
                        speechRecognition.start();
                    }
                    state.mediaRecorder.ondataavailable = e => state.audioChunks.push(e.data);
                    state.mediaRecorder.onstop = async () => {
                        if (speechRecognition) {
                            try { speechRecognition.stop(); } catch(e){}
                            speechRecognition = null;
                        }
                        const blob = new Blob(state.audioChunks, { type: 'audio/webm' });
                        const file = new File([blob], `vocal-${Date.now()}.webm`, { type: 'audio/webm' });
                        await handleMediaFile({ files: [file] }, 'audio', context);
                        stream.getTracks().forEach(t => t.stop());
                        // Show audio preview
                        const prevEl = document.getElementById(`${context}-audio-preview`);
                        if (prevEl) {
                            const url = URL.createObjectURL(blob);
                            prevEl.innerHTML = `<audio controls src="${url}" style="width:100%;margin-top:8px;"></audio>`;
                        }
                    };
                    state.mediaRecorder.start();
                    state.isRecordingAudio = true;
                } catch (e) {
                    alert('Accès au microphone refusé.');
                    return;
                }
            } else {
                state.mediaRecorder.stop();
                state.isRecordingAudio = false;
            }
            if (context === 'pole') renderPanelContent();
            else render();
        }

        // ===== SAVE NOTE =====
        async function saveNoteRemote(context, poleId = '') {
            const titleEl = document.getElementById(`${context}-note-title`);
            const contentEl = document.getElementById(`${context}-note-content`);
            const title = titleEl ? titleEl.value.trim() : '';
            const content = contentEl ? contentEl.value.trim() : '';

            // Need either text content or a media file
            if (!content && !title && !state.pendingMedia) {
                alert('Ajoutez du texte ou un média avant d\'enregistrer.');
                return;
            }

            const noteData = {
                title: title || null,
                content: content || null,
                author: state.currentUser,
                media_type: state.pendingMedia?.type || null,
                media_url: state.pendingMedia?.url || null, // storageId
                pole_id: poleId || null,
                created_at: new Date().toISOString()
            };

            try {
                await client.mutation("notes:add", noteData);
                console.log('✅ Note saved to Convex');
                showToast('✅ Note enregistrée !');
                
                // Clear state
                state.pendingMedia = null;
                if (context === 'journal') { 
                    state.activeJournalTab = 'text'; 
                    if (titleEl) titleEl.value = '';
                    if (contentEl) contentEl.value = '';
                } else { 
                    state.activePoleTab = 'text'; 
                }
                
                if (context === 'pole') renderPanelContent();
                render();
            } catch (err) {
                console.error('❌ Sync Error (saveNoteRemote):', err);
                showToast('Erreur de sauvegarde : ' + err.message, 'error');
            }
        }


        // ===== NOTE CARD =====
        function renderNoteCard(n) {
            let media = '';
            if (n.media_type === 'image') media = `<div class="media-preview-container" onclick="openLightbox('${n.media_url}', '${n.title || ''}', '${n.author}')" style="cursor:zoom-in;"><img src="${n.media_url}" alt="Photo"></div>`;
            if (n.media_type === 'video') media = `<div class="media-preview-container"><video controls src="${n.media_url}"></video></div>`;
            if (n.media_type === 'audio') media = `<audio controls src="${n.media_url}" style="width:100%;margin:8px 0;"></audio>`;
            const poleTag = n.pole_id ? `<span style="font-size:10px;background:var(--bg-tertiaire);padding:2px 6px;border-radius:4px;margin-right:6px;">${POLES_DATA.find(p => p.id === n.pole_id)?.name || 'Pôle'}</span>` : '';

            const authorColor = n.author === 'Rodrigue' ? 'var(--rodrigue-main)' : 'var(--henriette-main)';
            return `
            <div class="note-card">
                <div class="note-card-header">
                    <div>${poleTag}<b>${n.title || (n.media_type ? n.media_type : 'Note')}</b></div>
                    <button class="btn btn-ghost btn-sm" onclick="deleteNoteRemote('${n._id}')">✕</button>
                </div>
                ${media}
                ${n.content ? `<p style="font-size:14px;line-height:1.5;">${n.content}</p>` : ''}
                <div class="note-card-meta">
                    <span style="color:${authorColor};font-weight:600;">${n.author}</span> • ${new Date(n.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        `;
        }

        async function deleteNoteRemote(id) {
            if (confirm('Supprimer cette note ?')) {
                try {
                    await client.mutation("notes:remove", { id });
                    showToast('🗑️ Note supprimée');
                } catch (err) {
                    console.error('❌ Sync Error (deleteNote):', err);
                    showToast('Erreur suppression : ' + err.message, 'error');
                }
            }
        }

        // ===== TOAST UTILS =====
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerText = message;
            container.appendChild(toast);
            
            setTimeout(() => { toast.classList.add('show'); }, 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // ===== POLES ACTIONS =====
        async function toggleVisit(poleId) {
            const pole = state.poles.find(p => p.id === poleId);
            const newValue = !pole.visited[state.currentUser];
            
            try {
                await client.mutation("poles:toggleVisit", { 
                    id: poleId, 
                    user: state.currentUser, 
                    value: newValue 
                });
                showToast(newValue ? '📍 Passage validé' : '📍 Passage annulé');
            } catch (err) {
                console.error('❌ Sync Error (toggleVisit):', err);
                showToast('Erreur visite: ' + err.message, 'error');
            }
        }

        async function updateNoteRemote(poleId, user, value) {
            try {
                await client.mutation("poles:updateNote", { 
                    id: poleId, 
                    user: user, 
                    value: value 
                });
                console.log(`✅ Pole note updated for ${user}`);
            } catch (err) {
                console.error('❌ Sync Error (updateNote):', err);
                showToast('Erreur note pôle: ' + err.message, 'error');
            }
        }

        async function addQuestionRemote(poleId) {
            const input = document.getElementById('new-question');
            const text = input ? input.value.trim() : '';
            if (!text) return;

            try {
                await client.mutation("poles:addQuestion", { 
                    id: poleId, 
                    text: text, 
                    by: state.currentUser 
                });
                showToast('💡 Question ajoutée');
                if (input) input.value = '';
            } catch (err) {
                console.error('❌ Sync Error (addQuestion):', err);
                showToast('Erreur question: ' + err.message, 'error');
            }
        }

        async function deleteQuestionRemote(poleId, idx) {
            if (confirm('Supprimer cette question ?')) {
                try {
                    await client.mutation("poles:deleteQuestion", { 
                        id: poleId, 
                        index: idx 
                    });
                    showToast('🗑️ Question supprimée');
                } catch (err) {
                    console.error('❌ Sync Error (deleteQuestion):', err);
                    showToast('Erreur question: ' + err.message, 'error');
                }
            }
        }

        // ===== CONTACTS =====
        async function addContactRemote() {
            const nameEl = document.getElementById('c-name');
            const roleEl = document.getElementById('c-role');
            const memoEl = document.getElementById('c-memo');
            const name = nameEl.value.trim();
            if (!name) return;

            const contactData = {
                name,
                role: roleEl.value || null,
                memo: memoEl.value.trim() || null,
                added_by: state.currentUser,
                created_at: new Date().toISOString()
            };

            try {
                await client.mutation("contacts:add", contactData);
                
                // Clear inputs
                nameEl.value = '';
                if (memoEl) memoEl.value = '';
                showToast('👥 Contact ajouté');
            } catch (err) {
                console.error('❌ Sync Error (addContact):', err);
                showToast('Erreur contact: ' + err.message, 'error');
            }
        }
        async function deleteContactRemote(id) {
            if (confirm('Supprimer ce contact ?')) {
                try {
                    await client.mutation("contacts:remove", { id });
                    showToast('🗑️ Contact supprimé');
                } catch (err) {
                    console.error('❌ Sync Error (deleteContact):', err);
                    showToast('Erreur contact: ' + err.message, 'error');
                }
            }
        }

        // ===== PROGRAM =====
        async function updateProgramItem(dIdx, iIdx, val) { 
            PROGRAM_DATA[dIdx].items[iIdx] = val; 
            await syncPrograms(); 
        }
        async function removeProgramItem(dIdx, iIdx) { 
            PROGRAM_DATA[dIdx].items.splice(iIdx, 1); 
            render(); 
            await syncPrograms(); 
        }
        async function addProgramItem(dIdx) { 
            PROGRAM_DATA[dIdx].items.push('Nouvelle activité'); 
            render(); 
            await syncPrograms(); 
        }
        async function syncPrograms() {
            for (const day of PROGRAM_DATA) {
                client.mutation("programs:upsert", { 
                    day: day.day, 
                    date: day.date, 
                    items: day.items 
                });
            }
        }

        // ===== IA =====
        async function generateActionPlan() {
            state.isGeneratingActionPlan = true;
            render();
            const notes = state.poles.map(p => `Pôle ${p.name}: ${p.notes.Rodrigue} ${p.notes.Henriette}`).join('\n') + 
                         '\n' + state.generalNotes.map(n => n.content).join('\n');
            
            const prompt = `En tant qu'assistant stratégique LDC (Local Development Construction), analyse les notes suivantes prises durant l'immersion au Béthel par Rodrigue et Henriette.
            PROPOSE-LEUR UN PLAN D'ACTION DE 5 POINTS CONCRETS, réalistes et à fort impact.
            IMPORTANT : Utilise le TUTOIEMENT ("tu", "ton", "tes"). Le langage doit être très SIMPLE, clair et accessible (niveau 17 ans).
            Format : Titre percutant, puis description courte de l'action.
            
            NOTES :
            ${notes}`;

            try {
                const result = await client.action("ai:generate", { prompt });
                state.iaActionPlan = result;
            } catch (err) {
                showToast("Erreur Plan d'Action: " + err.message, "error");
            } finally {
                state.isGeneratingActionPlan = false;
                render();
            }
        }

        async function generateSmartQuestions(poleId) {
            const pole = state.poles.find(p => p.id === poleId);
            showToast("⏳ L'IA prépare tes questions...", "info");
            
            const prompt = `En tant qu'assistant LDC (Local Development Construction), propose 3 questions claires, en UNE SEULE PHRASE chacune, à poser au responsable du pôle "${pole.name}".
            OBJECTIF : Comprendre le rôle du pôle, le travail des gens là-bas et le lien avec tes futures missions.
            CONSIGNES : Utilise le TUTOIEMENT ("tu"). Fais des questions SIMPLES, comme pour un jeune de 17 ans. Évite les termes compliqués.
            Format : Juste les 3 questions numérotées, sans introduction.`;

            try {
                const result = await client.action("ai:generate", { prompt });
                
                // Add to questions list
                const questions = result.split('\n').filter(q => q.trim().length > 5);
                for (const qText of questions) {
                    const cleanQ = qText.replace(/^\d+[\.\)]\s*/, '').trim();
                    if (cleanQ) {
                        client.mutation("poles:addQuestion", { 
                            id: poleId, 
                            text: "💡 " + cleanQ, 
                            by: "IA" 
                        });
                    }
                }
                showToast("💡 Suggestions ajoutées !");
            } catch (err) {
                showToast("Erreur IA Interviewer", "error");
            }
        }

        async function generateReport() {
            state.isGeneratingIA = true; render();
            const polesData = state.poles.map(p => {
                const visitedR = p.visited.Rodrigue ? 'Oui' : 'Non';
                const visitedH = p.visited.Henriette ? 'Oui' : 'Non';
                return `- **Pôle ${p.name}** (Visité par Rodrigue: ${visitedR}, Henriette: ${visitedH})\n  Observations Rodrigue: ${p.notes.Rodrigue || '... '}\n  Observations Henriette: ${p.notes.Henriette || '...'}`;
            }).join('\n\n');
            
            const journalData = state.generalNotes.map(n => `- [${n.author}] **${n.title || 'Note globale'}**: ${n.content || '...'}`).join('\n');
            
            const prompt = `Tu es un assistant analytique expert accompagnant Rodrigue et Henriette SIALOU lors de leur immersion au LDC (Local Development Construction) au Béthel (Côte d'Ivoire).
À partir des données terrains brutes suivantes, génère une synthèse finale percutante.
 
📋 DONNÉES DES PÔLES:
${polesData}
 
🗒️ NOTES DE JOURNAL:
${journalData}
 
CONSIGNES DE MISE EN FORME (Markdown structuré):
1. **Introduction** : Un résumé court et sympa (utilise le TUTOIEMENT, comme si tu t'adressais à eux directement).
2. **Tableau de Suivi** : Récapitulatif clair des visites.
3. **Faits Marquants** : Les idées principales expliquées SIMPLEMENT (niveau 17 ans).
4. **Conclusion** : Recommandations claires pour la suite.
Utilise des émojis et reste très pédagogique.`;
            try {
                const result = await client.action("ai:generate", { prompt });
                state.iaReport = result;
            } catch (err) {
                console.error("Erreur IA:", err);
                state.iaReport = `🤖 (Erreur: ${err.message})`;
            } finally {
                state.isGeneratingIA = false; render();
            }
        }

        async function exportToPDF() {
            const d = document.createElement('div');
            d.style.cssText = 'padding:40px;font-family:Arial,sans-serif;max-width:800px;';
            d.innerHTML = `
            <div style="text-align:center;margin-bottom:40px;">
                <h1 style="color:#7F77DD;font-size:28px;">Rapport d'Immersion LDC</h1>
                <p style="color:#666;">Rodrigue &amp; Henriette • 15-17 Avril 2025 • Béthel</p>
            </div>
            <h2 style="border-bottom:2px solid #7F77DD;padding-bottom:10px;">📅 Progression</h2>
            <p>Progression collective : ${Math.round((state.poles.filter(p => p.visited.Rodrigue || p.visited.Henriette).length / state.poles.length) * 100)}%</p>
            <h2 style="border-bottom:2px solid #7F77DD;padding-bottom:10px;margin-top:30px;">📍 Pôles</h2>
            ${state.poles.map(p => `<div style="margin-bottom:16px;border:1px solid #ddd;padding:12px;border-radius:8px;"><h3>${p.icon} ${p.name}</h3><p><b>R:</b> ${p.notes.Rodrigue || '—'}</p><p><b>H:</b> ${p.notes.Henriette || '—'}</p></div>`).join('')}
            <h2 style="border-bottom:2px solid #7F77DD;padding-bottom:10px;margin-top:30px;">✍️ Journal</h2>
            ${state.generalNotes.map(n => `<div style="margin-bottom:8px;"><b>[${n.author}] ${n.title || 'Note'}:</b> ${n.content || ''}</div>`).join('')}
            <h2 style="border-bottom:2px solid #7F77DD;padding-bottom:10px;margin-top:30px;">👥 Contacts</h2>
            ${state.contacts.map(c => `<div><b>${c.name}</b> — ${c.role || ''} ${c.memo ? '• ' + c.memo : ''}</div>`).join('')}
            ${state.iaReport ? `<h2 style="border-bottom:2px solid #7F77DD;padding-bottom:10px;margin-top:30px;">🪄 Synthèse IA</h2><div style="white-space:pre-wrap;font-size:13px;">${state.iaReport}</div>` : ''}
        `;
            html2pdf().from(d).set({
                margin: 10,
                filename: `Immersion_LDC_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).save();
        }

        // ===== PRESENTATION MODE =====
        let slides = [];
        let currentSlide = 0;

        function startPresentation() {
            slides = [];
            // Slide 1: Welcome
            slides.push(`
                <div class="slide">
                    <h1>Rapport d'Immersion LDC</h1>
                    <h2>15-17 Avril 2025 • CIV Béthel</h2>
                    <p style="font-size:18px;color:#aaa;margin-top:40px;">Par Rodrigue & Henriette SIALOU</p>
                </div>
            `);

            // Slide 2: Stats
            let visitedPoles = state.poles.filter(p => p.visited.Rodrigue || p.visited.Henriette).length;
            slides.push(`
                <div class="slide">
                    <h1>Progression Collective</h1>
                    <div class="stat-big">${Math.round((visitedPoles/state.poles.length)*100)}%</div>
                    <h2>${visitedPoles} Pôles visités sur ${state.poles.length}</h2>
                    <p style="margin-top:20px;">${state.generalNotes.length} notes prises • ${state.contacts.length} contacts établis</p>
                </div>
            `);

            // Pôles highlights
            state.poles.filter(p => p.visited.Rodrigue || p.visited.Henriette).forEach(p => {
                slides.push(`
                    <div class="slide">
                        <div style="font-size:70px;margin-bottom:10px;line-height:1;">${p.icon}</div>
                        <h1>Pôle ${p.name}</h1>
                        <div style="display:flex;flex-direction:column;gap:15px;margin-top:30px;">
                            <div style="background:rgba(127,119,221,0.15);padding:20px;border-radius:12px;text-align:left;border-left:4px solid var(--rodrigue-main);">
                                <b style="color:var(--rodrigue-main);">[Rodrigue]</b><br>
                                ${p.notes.Rodrigue || '...'}
                            </div>
                            <div style="background:rgba(212,83,126,0.15);padding:20px;border-radius:12px;text-align:left;border-left:4px solid var(--henriette-main);">
                                <b style="color:var(--henriette-main);">[Henriette]</b><br>
                                ${p.notes.Henriette || '...'}
                            </div>
                        </div>
                    </div>
                `);
            });

            // Media highlights
            const images = state.generalNotes.filter(n => n.media_type === 'image');
            if (images.length > 0) {
                images.forEach(img => {
                    slides.push(`
                        <div class="slide">
                            <h2>Faits marquants en images</h2>
                            <img src="${img.media_url}" alt="Capture">
                            <p style="font-weight:bold;margin-top:10px;">${img.title || 'Observation'}</p>
                            <p style="font-size:14px;color:#bbb;">Capturé par ${img.author}</p>
                        </div>
                    `);
                });
            }

            // IA
            if (state.iaReport) {
                slides.push(`
                    <div class="slide">
                        <h1>Synthèse Générale (IA)</h1>
                        <div class="ia-markdown-content" style="text-align:left;font-size:16px;line-height:1.6;overflow-y:auto;max-height:60vh;background:rgba(255,255,255,0.05);padding:30px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);">
                            ${marked.parse(state.iaReport)}
                        </div>
                    </div>
                `);
            }

            // End
            slides.push(`
                <div class="slide">
                    <div style="font-size:80px;margin-bottom:20px;">💡</div>
                    <h1>Merci de votre attention !</h1>
                    <p style="font-size:20px;color:#aaa;">Immersion LDC 2025 terminée avec succès.</p>
                </div>
            `);

            currentSlide = 0;
            renderSlide();
            document.getElementById('presentation-mode').classList.add('open');
        }

        function closePresentation() { document.getElementById('presentation-mode').classList.remove('open'); }
        function nextSlide() { if (currentSlide < slides.length - 1) { currentSlide++; renderSlide(); } }
        function prevSlide() { if (currentSlide > 0) { currentSlide--; renderSlide(); } }
        function renderSlide() {
            document.getElementById('presentation-content').innerHTML = slides[currentSlide];
            document.getElementById('slide-counter').innerText = (currentSlide + 1) + ' / ' + slides.length;
        }

        // ===== PWA =====
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => { }));
        }

// Expose functions globally for inline HTML events
        function toggleProgramEdit() {
            state.isEditingProgram = !state.isEditingProgram;
            render();
        }

Object.assign(window, {
    chooseSplashUser, setTab, openUserSwitch, closeUserSwitch, setUser, 
    openPoleDetails, closePanel, toggleVisit, updateNoteRemote, addQuestionRemote, 
    deleteQuestionRemote, setActiveJournalTab, setActivePoleTab, handleMediaFile, 
    toggleAudioRecording, saveNoteRemote, deleteNoteRemote, addContactRemote, 
    deleteContactRemote, updateProgramItem, removeProgramItem, addProgramItem, 
    toggleProgramEdit, generateActionPlan, generateSmartQuestions,
    generateReport, exportToPDF, startPresentation, closePresentation, prevSlide, 
    nextSlide, openLightbox, closeLightbox, showToast, toggleTheme
});

// ===== THEME LOGIC =====
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('ldc-theme', target);
    document.getElementById('theme-toggle').innerText = target === 'dark' ? '☀️' : '🌙';
}

// Init theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('ldc-theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.innerText = '☀️';
    }
});
