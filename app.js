


        const firebaseConfig = {

          apiKey: "AIzaSyDrjo_HDQ1RRkjA-zXgZtuFovI7zg2yma0",
          authDomain: "kmu-digita-rsc-mnt-system.firebaseapp.com",
          databaseURL: "https://kmu-digita-rsc-mnt-system-default-rtdb.firebaseio.com",
          projectId: "kmu-digita-rsc-mnt-system",
          storageBucket: "kmu-digita-rsc-mnt-system.appspot.com",
          messagingSenderId: "908284620214",
          appId: "1:908284620214:web:e76e9a4757c162eea1a517",
          measurementId: "G-JEPQ1YMVNE"
        

  supabaseUrl: 'https://vlbebvnoadcpkkrrdjiq.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYmVidm5vYWRjcGtrcnJkamlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODI0ODQsImV4cCI6MjA3MjA1ODQ4NH0.uVzfaVMu7M8HdkpxbLeYzFFwwYWADt_97h0dz1pFiTo',
  storageBucket: 'app-bucket'

};
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();

        // ---------- Local state (minimal) ----------
        let currentUser = null; // { uid, role, name, id }
        let adminSettings = null; // loaded from meta/adminSettings doc

        // ---------- UI references ----------
        const loginScreen = document.getElementById('login-screen');
        const adminDashboard = document.getElementById('admin-dashboard');
        const supervisorDashboard = document.getElementById('supervisor-dashboard');
        const kioskScreen = document.getElementById('kiosk-screen');
        const adminLoginForm = document.getElementById('admin-login-form');
        const supervisorLoginForm = document.getElementById('supervisor-login-form');
        const showAdminLoginBtn = document.getElementById('show-admin-login-btn');
        const showSupervisorLoginBtn = document.getElementById('show-supervisor-login-btn');
        const showKioskBtn = document.getElementById('show-kiosk-btn');
        const kioskBackBtn = document.getElementById('kiosk-back-btn');
        const adminLoginMessage = document.getElementById('admin-login-message');
        const supervisorLoginMessage = document.getElementById('supervisor-login-message');
        const passwordResetModal = document.getElementById('password-reset-modal');
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');
        const passwordResetForm = document.getElementById('password-reset-form');
        const cancelResetBtn = document.getElementById('cancel-reset-btn');
        const studentRegisterForm = document.getElementById('student-register-form');
        const supervisorRegisterForm = document.getElementById('supervisor-register-form');
        const supervisorRegPasswordInput = document.getElementById('supervisor-reg-password');
        const supervisorPasswordStrength = document.getElementById('supervisor-password-strength');
        const studentRegisterMessage = document.getElementById('student-register-message');
        const supervisorRegisterMessage = document.getElementById('supervisor-register-message');
        const userList = document.getElementById('user-list');
        const userSearchInput = document.getElementById('user-search-input');
        const activityLog = document.getElementById('activity-log');
        const stationStatusAdmin = document.getElementById('station-status-admin');
        const adminChatBox = document.getElementById('admin-chat-box');
        const adminChatForm = document.getElementById('admin-chat-form');
        const stationAssignmentForm = document.getElementById('station-assignment-form');
        const stationSelect = document.getElementById('station-select');
        const studentLookupInput = document.getElementById('student-lookup-input');
        const studentLookupMessage = document.getElementById('station-assignment-message');
        const studentProfilePreview = document.getElementById('student-profile-preview');
        const studentPhotoPreview = document.getElementById('student-photo-preview');
        const studentDetailsPreview = document.getElementById('student-details-preview');
        const stationStatusSupervisor = document.getElementById('station-status-supervisor');
        const issueReportForm = document.getElementById('issue-report-form');
        const issueStationSelect = document.getElementById('issue-station-select');
        const supervisorChatBox = document.getElementById('supervisor-chat-box');
        const supervisorChatForm = document.getElementById('supervisor-chat-form');
        const passwordChangeModal = document.getElementById('password-change-modal');
        const supervisorChangePasswordBtn = document.getElementById('supervisor-change-password-btn');
        const passwordChangeForm = document.getElementById('password-change-form');
        const cancelChangeBtn = document.getElementById('cancel-change-btn');
        const newPasswordInput = document.getElementById('new-password');
        const newPasswordStrength = document.getElementById('new-password-strength');
        const supervisorProfilePhoto = document.getElementById('supervisor-profile-photo');
        const welcomeMessage = document.getElementById('welcome-message');
        const broadcastMessageEl = document.getElementById('broadcast-message');
        const broadcastTextEl = document.getElementById('broadcast-text');
        const customReportForm = document.getElementById('custom-report-form');
        const customReportOutput = document.getElementById('custom-report-output');
        const broadcastForm = document.getElementById('broadcast-form');
        const userDetailModal = document.getElementById('user-detail-modal');
        const userModalTitle = document.getElementById('user-modal-title');
        const userModalContent = document.getElementById('user-modal-content');
        const kioskStationList = document.getElementById('kiosk-station-list');
        const adminChatNotification = document.getElementById('admin-chat-notification');
        const supervisorChatNotification = document.getElementById('supervisor-chat-notification');

        // ---------- Utility functions ----------
        function updateWelcomeMessage() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            welcomeMessage.textContent = `SYSTEM ACCESS. CURRENT TIME: ${now.toLocaleDateString('en-US', options)}`;
        }
        function showScreen(screenId) {
            loginScreen.style.display = 'none';
            adminDashboard.style.display = 'none';
            supervisorDashboard.style.display = 'none';
            kioskScreen.style.display = 'none';
            document.getElementById(screenId).style.display = 'block';
            if (screenId === 'kiosk-screen') {
                // kiosk list updates from realtime listener
            }
        }

        // ---------- Initial seeding & listeners ----------
        async function ensureAdminSettings() {
            const docRef = db.collection('meta').doc('adminSettings');
            const doc = await docRef.get();
            if (!doc.exists) {
                // create default admin settings. You should update secret code & admin email via Firestore console
                await docRef.set({
                    email: 'admin@kmu.com',
                    username: 'Admin',
                    secretCode: '12345'
                });
            }
            adminSettings = (await docRef.get()).data();
        }

        async function ensureStationsExist(count = 100) {
            const stationsRef = db.collection('stations');
            const snapshot = await stationsRef.limit(1).get();
            if (snapshot.empty) {
                // create stations 1..count
                const batch = db.batch();
                for (let i = 1; i <= count; i++) {
                    const sRef = stationsRef.doc(String(i));
                    batch.set(sRef, {
                        id: i,
                        isOccupied: false,
                        assignedTo: null,
                        assignedBy: null,
                        issue: null,
                        sessionEndTime: null,
                        sessionDuration: null,
                        statusFlag: null
                    });
                }
                await batch.commit();
            }
        }

        // realtime listeners (students, supervisors, stations, chats, activities)
        let studentsCache = [];
        let supervisorsCache = [];
        function attachRealtimeListeners() {
            db.collection('students').onSnapshot(snapshot => {
                studentsCache = [];
                snapshot.forEach(doc => studentsCache.push({ id: doc.id, ...doc.data() }));
                renderUserList();
            });
            db.collection('supervisors').onSnapshot(snapshot => {
                supervisorsCache = [];
                snapshot.forEach(doc => supervisorsCache.push({ id: doc.id, ...doc.data() }));
                renderUserList();
                renderSupervisorProfile();
            });
            db.collection('stations').onSnapshot(snapshot => {
                // transform into array of stations sorted by id
                const stations = [];
                snapshot.forEach(doc => stations.push({ id: Number(doc.id), ...doc.data() }));
                stations.sort((a,b) => a.id - b.id);
                window._stationsCache = stations;
                renderStationStatusAdmin();
                renderStationStatusSupervisor();
                renderStationSelectors();
                renderKioskStations();
                updateReportCounts();
            });
            db.collection('chats').orderBy('time').onSnapshot(snapshot => {
                const messages = [];
                snapshot.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
                window._chatsCache = messages;
                renderChat(adminChatBox, 'admin');
                renderChat(supervisorChatBox, 'supervisor');
            });
            db.collection('activities').orderBy('time', 'desc').limit(50).onSnapshot(snapshot => {
                activityLog.innerHTML = '';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const li = document.createElement('li');
                    const timeStr = new Date(data.time).toLocaleTimeString();
                    li.textContent = `[${timeStr}] ${data.message}`;
                    activityLog.prepend(li);
                });
            });
            // listen for broadcast message
            db.collection('meta').doc('broadcast').onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data && data.message) {
                        broadcastTextEl.textContent = data.message;
                        broadcastMessageEl.style.display = 'block';
                    } else {
                        broadcastMessageEl.style.display = 'none';
                    }
                } else {
                    broadcastMessageEl.style.display = 'none';
                }
            });
        }

        // ---------- Authentication & Login flows ----------
        showAdminLoginBtn.addEventListener('click', () => toggleLoginForms('admin'));
        showSupervisorLoginBtn.addEventListener('click', () => toggleLoginForms('supervisor'));
        showKioskBtn.addEventListener('click', () => showScreen('kiosk-screen'));
        kioskBackBtn.addEventListener('click', () => showScreen('login-screen'));

        function toggleLoginForms(formToShow) {
            const adminLogin = document.getElementById('admin-login-form');
            const supervisorLogin = document.getElementById('supervisor-login-form');
            const adminBtn = document.getElementById('show-admin-login-btn');
            const supervisorBtn = document.getElementById('show-supervisor-login-btn');
            if (formToShow === 'admin') {
                adminLogin.style.display = 'block';
                supervisorLogin.style.display = 'none';
                adminBtn.style.backgroundColor = '#00aaff';
                supervisorBtn.style.backgroundColor = '#00cc00';
            } else {
                supervisorLogin.style.display = 'block';
                adminLogin.style.display = 'none';
                supervisorBtn.style.backgroundColor = '#00aaff';
                adminBtn.style.backgroundColor = '#00cc00';
            }
        }

        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            adminLoginMessage.textContent = '';
            const username = e.target['admin-username'].value.trim();
            const password = e.target['admin-password'].value;
            const secretCodeInput = e.target['admin-secret-code'].value.trim();
            try {
                const settingsRef = db.collection('meta').doc('adminSettings');
                const settingsDoc = await settingsRef.get();
                if (!settingsDoc.exists) {
                    adminLoginMessage.textContent = 'ADMIN SETTINGS NOT CONFIGURED. CHECK FIRESTORE meta/adminSettings.';
                    return;
                }
                adminSettings = settingsDoc.data();
                // check username and secret code, then sign in using the stored email
                if (username !== adminSettings.username) {
                    adminLoginMessage.textContent = 'INVALID USERNAME.';
                    return;
                }
                if (secretCodeInput !== String(adminSettings.secretCode)) {
                    adminLoginMessage.textContent = 'INVALID SECRET CODE.';
                    return;
                }
                // sign in with Firebase Auth using admin email
                await auth.signInWithEmailAndPassword(adminSettings.email, password);
                currentUser = { role: 'admin', uid: auth.currentUser.uid, name: adminSettings.username };
                
                
                showScreen('admin-dashboard');
                attachRealtimeListeners();
                logActivity('Admin logged in.');
            } catch (err) {
                console.error(err);
                adminLoginMessage.textContent = err.message || 'LOGIN FAILED.';
            }
        });

        supervisorLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            supervisorLoginMessage.textContent = '';
            const id = e.target['supervisor-id'].value.trim();
            const password = e.target['supervisor-password'].value;
            try {
                // find supervisor document by ID (we store supervisor reg-id in doc.id field)
                const supDoc = await db.collection('supervisors').doc(id).get();
                if (!supDoc.exists) {
                    supervisorLoginMessage.textContent = 'INVALID ID OR PASSWORD.';
                    return;
                }
                const sup = supDoc.data();
                if (sup.isBlocked) {
                    supervisorLoginMessage.textContent = 'THIS ACCOUNT IS BLOCKED. CONTACT ADMIN.';
                    return;
                }
                // We require supervisors to have an auth account (created at registration)
                if (!sup.authUid) {
                    supervisorLoginMessage.textContent = 'SUPERVISOR AUTH ACCOUNT NOT FOUND. CONTACT ADMIN.';
                    return;
                }
                
                // lockout check
                const now = Date.now();
                const lockUntil = sup.lockUntil ? sup.lockUntil.toMillis ? sup.lockUntil.toMillis() : sup.lockUntil : null;
                if (lockUntil && lockUntil > now) {
                    const mins = Math.ceil((lockUntil - now) / 60000);
                    supervisorLoginMessage.textContent = `ACCOUNT LOCKED. TRY AGAIN IN ${mins} MINUTE(S).`;
                    return;
                }
                // attempt sign in using their auth email stored
                await auth.signInWithEmailAndPassword(sup.email, password);
                
                // success: reset attempts
                await db.collection('supervisors').doc(id).update({ failedAttempts: 0, lockUntil: null });
                currentUser = { role: 'supervisor', uid: auth.currentUser.uid, id: id, name: sup.name, email: sup.email };
                await db.collection('meta').doc('supervisorOnDuty').set({ id, name: sup.name, email: sup.email, time: new Date() });
                showScreen('supervisor-dashboard');
                attachRealtimeListeners();
                logActivity(`Supervisor ${sup.name} logged in.`);

            } catch (err) {
                console.error(err);
                try {
                    const supRef = db.collection('supervisors').doc(e.target['supervisor-id'].value.trim());
                    const docx = await supRef.get();
                    if (docx.exists) {
                        const d = docx.data();
                        const attempts = (d.failedAttempts || 0) + 1;
                        let updates = { failedAttempts: attempts };
                        if (attempts >= 3) {
                            updates.lockUntil = new Date(Date.now() + 15*60000);
                        }
                        await supRef.update(updates);
                    }
                } catch (_e) {}
                supervisorLoginMessage.textContent = err.message || 'LOGIN FAILED.';
            }
        });

        // logout handlers
        document.getElementById('admin-logout-btn').addEventListener('click', async () => {
            await auth.signOut();
            currentUser = null;
            showScreen('login-screen');
            logActivity('Admin logged out.');
        });
        document.getElementById('supervisor-logout-btn').addEventListener('click', async () => {
            try { await db.collection('meta').doc('supervisorOnDuty').set({}); } catch(e){}
            await auth.signOut();
            logActivity(`Supervisor logged out.`);
            currentUser = null;
            showScreen('login-screen');
        });

        // ---------- Register student (upload photo to storage, save to Firestore) ----------
        studentRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            studentRegisterMessage.textContent = '';
            const name = e.target['student-name'].value.trim();
            const id = e.target['student-id'].value.trim();
            const hostel = e.target['student-hostel'].value.trim();
            const program = e.target['student-program'].value.trim();
            const year = e.target['student-year'].value;
            const photoFile = document.getElementById('student-photo').files[0];
            try {
                const studentRef = db.collection('students').doc(id);
                const exists = (await studentRef.get()).exists;
                if (exists) {
                    studentRegisterMessage.textContent = `ERROR: STUDENT WITH ID ${id} ALREADY EXISTS.`;
                    studentRegisterMessage.className = 'text-center mt-2 text-neon-red';
                    return;
                }
                let photoUrl = null;
                if (photoFile) {
                    const storageRef = storage.ref().child(`photos/students/${id}`);
                    await storageRef.put(photoFile);
                    photoUrl = await storageRef.getDownloadURL();
                }
                await studentRef.set({
                    name, id, hostel, program, year: Number(year), photo: photoUrl || null, stationHistory: []
                });
                studentRegisterForm.reset();
                studentRegisterMessage.textContent = `STUDENT ${name} REGISTERED SUCCESSFULLY!`;
                studentRegisterMessage.className = 'text-center mt-2 text-neon-green';
                logActivity(`ADMIN REGISTERED STUDENT ${name} (ID: ${id}).`);
            } catch (err) {
                console.error(err);
                studentRegisterMessage.textContent = err.message || 'FAILED TO REGISTER STUDENT.';
                studentRegisterMessage.className = 'text-center mt-2 text-neon-red';
            }
        });

        // ---------- Register supervisor (create Auth user + Firestore doc) ----------
        supervisorRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            supervisorRegisterMessage.textContent = '';
            const name = e.target['supervisor-name'].value.trim();
            const regId = e.target['supervisor-reg-id'].value.trim();
            const email = e.target['supervisor-email'].value.trim();
            const password = e.target['supervisor-reg-password'].value;
            const photoFile = document.getElementById('supervisor-photo').files[0];
            try {
                const supRef = db.collection('supervisors').doc(regId);
                const exists = (await supRef.get()).exists;
                if (exists) {
                    supervisorRegisterMessage.textContent = `ERROR: SUPERVISOR WITH ID ${regId} ALREADY EXISTS.`;
                    supervisorRegisterMessage.className = 'text-center mt-2 text-neon-red';
                    return;
                }
                // create auth user
                const userCred = await auth.createUserWithEmailAndPassword(email, password);
                const authUid = userCred.user.uid;
                let photoUrl = null;
                if (photoFile) {
                    const storageRef = storage.ref().child(`photos/supervisors/${regId}`);
                    await storageRef.put(photoFile);
                    photoUrl = await storageRef.getDownloadURL();
                }
                await supRef.set({
                    name, id: regId, email, photo: photoUrl || null, isBlocked: false, authUid
                });
                supervisorRegisterForm.reset();
                supervisorPasswordStrength.textContent = '';
                supervisorRegisterMessage.textContent = `SUPERVISOR ${name} REGISTERED SUCCESSFULLY!`;
                supervisorRegisterMessage.className = 'text-center mt-2 text-neon-green';
                logActivity(`ADMIN REGISTERED NEW SUPERVISOR ${name} (ID: ${regId}).`);
            } catch (err) {
                console.error(err);
                supervisorRegisterMessage.textContent = err.message || 'FAILED TO REGISTER SUPERVISOR.';
                supervisorRegisterMessage.className = 'text-center mt-2 text-neon-red';
            }
        });

        // ---------- Render user list (students + supervisors) ----------
        userSearchInput.addEventListener('input', () => renderUserList());
        function renderUserList() {
            userList.innerHTML = '';
            const searchTerm = (userSearchInput.value || '').toLowerCase();
            const allUsers = [...studentsCache, ...supervisorsCache];
            const filteredUsers = allUsers.filter(user => (user.name || '').toLowerCase().includes(searchTerm) || (user.id || '').toLowerCase().includes(searchTerm));
            filteredUsers.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'system-panel flex-container';
                const photoHtml = user.photo ? `<img src="${user.photo}" alt="${user.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px dashed #00ff00;">` : `<div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #333; border-radius: 50%;">N/A</div>`;
                const userType = user.hasOwnProperty('program') ? 'Student' : 'Supervisor';
                const statusHtml = user.isBlocked ? `<p class="text-xs text-neon-red">BLOCKED</p>` : `<p class="text-xs text-neon-green">ACTIVE</p>`;
                userItem.innerHTML = `
                    <div style="display:flex; gap: 1rem; align-items: center;">
                        ${photoHtml}
                        <div>
                            <p class="text-xl">${user.name} (${user.id})</p>
                            <p class="text-sm">${userType}: ${user.email || user.program}</p>
                            ${userType === 'Supervisor' ? statusHtml : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        ${userType === 'Supervisor' ? `
                            <button onclick="toggleSupervisorBlock('${user.id}')" class="btn-warning" style="background-color: ${user.isBlocked ? '#00cc00' : '#ffff33'}; border-color: ${user.isBlocked ? '#00cc00' : '#ffff33'}; color: #000;">
                                ${user.isBlocked ? 'UNBLOCK' : 'BLOCK'}
                            </button>
                        ` : ''}
                        <button onclick="showUserDetail('${user.id}', '${userType.toLowerCase()}')" class="btn-primary" style="background-color: #00aaff; border-color: #00aaff; color: #000;">VIEW / EDIT</button>
                        <button onclick="deleteUser('${user.id}', '${userType.toLowerCase()}')" class="btn-danger" style="background-color: #ff3333; border-color: #ff3333; color: #000;">DELETE</button>
                    </div>
                `;
                userList.appendChild(userItem);
            });
        }

        window.showUserDetail = async (id, type) => {
            let user;
            if (type === 'student') {
                const doc = await db.collection('students').doc(id).get();
                if (!doc.exists) return;
                user = { id: doc.id, ...doc.data() };
            } else {
                const doc = await db.collection('supervisors').doc(id).get();
                if (!doc.exists) return;
                user = { id: doc.id, ...doc.data() };
            }
            userModalTitle.textContent = `${type.toUpperCase()} PROFILE: ${user.name}`;
            let contentHtml = `<input type="hidden" id="edit-user-id" value="${user.id}">`;
            contentHtml += `<input type="hidden" id="edit-user-type" value="${type}">`;
            contentHtml += `<label class="text-neon-green">Name:</label><input type="text" id="edit-name" value="${user.name}" required>`;
            contentHtml += `<label class="text-neon-green">ID:</label><input type="text" value="${user.id}" disabled>`;
            if (type === 'student') {
                contentHtml += `<label class="text-neon-green">Hostel:</label><input type="text" id="edit-hostel" value="${user.hostel || ''}" required>`;
                contentHtml += `<label class="text-neon-green">Program:</label><input type="text" id="edit-program" value="${user.program || ''}" required>`;
                contentHtml += `<label class="text-neon-green">Year:</label><input type="number" id="edit-year" value="${user.year || ''}" required>`;
                contentHtml += `<h4 class="text-xl text-neon-yellow mt-4">STATION USAGE HISTORY:</h4><ul style="height: 150px; overflow-y: auto; border: 1px dashed #ffff33; padding: 1rem;">`;
                if (user.stationHistory && user.stationHistory.length > 0) {
                    user.stationHistory.forEach(hist => {
                        contentHtml += `<li>STATION ${hist.stationId} | ASSIGNED: ${new Date(hist.startTime).toLocaleString()}</li>`;
                    });
                } else {
                    contentHtml += `<li>NO USAGE HISTORY FOUND.</li>`;
                }
                contentHtml += `</ul>`;
            } else {
                contentHtml += `<label class="text-neon-green">Email:</label><input type="email" id="edit-email" value="${user.email || ''}" required>`;
                contentHtml += `<h4 class="text-xl text-neon-yellow mt-4">ASSIGNED STUDENTS:</h4><ul style="height: 150px; overflow-y: auto; border: 1px dashed #ffff33; padding: 1rem;">`;
                // assigned students will be queried
                const assignedSnapshot = await db.collection('stations').where('assignedBy', '==', user.name).where('isOccupied', '==', true).get();
                if (!assignedSnapshot.empty) {
                    assignedSnapshot.forEach(st => {
                        const stData = st.data();
                        contentHtml += `<li>STATION ${stData.id}: ${stData.assignedTo ? stData.assignedTo.name : 'N/A'}</li>`;
                    });
                } else {
                    contentHtml += `<li>NO STUDENTS CURRENTLY ASSIGNED.</li>`;
                }
                contentHtml += `</ul>`;
            }
            userModalContent.innerHTML = contentHtml;
            userDetailModal.style.display = 'block';
        };

        document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = e.target['edit-user-id'].value;
            const type = e.target['edit-user-type'].value;
            if (type === 'student') {
                const studentRef = db.collection('students').doc(id);
                await studentRef.update({
                    name: e.target['edit-name'].value,
                    hostel: document.getElementById('edit-hostel').value,
                    program: document.getElementById('edit-program').value,
                    year: Number(document.getElementById('edit-year').value)
                });
                logActivity(`ADMIN UPDATED STUDENT ${id}'s details.`);
            } else {
                const supRef = db.collection('supervisors').doc(id);
                await supRef.update({
                    name: e.target['edit-name'].value,
                    email: document.getElementById('edit-email').value
                });
                logActivity(`ADMIN UPDATED SUPERVISOR ${id}'s details.`);
            }
            closeModal('user-detail-modal');
        });

        window.closeModal = (id) => {
            document.getElementById(id).style.display = 'none';
        };

        window.toggleSupervisorBlock = async (id) => {
            const supRef = db.collection('supervisors').doc(id);
            const doc = await supRef.get();
            if (!doc.exists) return;
            const isBlocked = !!doc.data().isBlocked;
            await supRef.update({ isBlocked: !isBlocked });
            logActivity(`ADMIN ${!isBlocked ? 'BLOCKED' : 'UNBLOCKED'} SUPERVISOR ${doc.data().name}.`);
        };

        window.deleteUser = async (id, type) => {
            if (type === 'student') {
                await db.collection('students').doc(id).delete();
                logActivity(`ADMIN DELETED STUDENT (ID: ${id}).`);
            } else {
                const supDoc = await db.collection('supervisors').doc(id).get();
                if (supDoc.exists) {
                    const sup = supDoc.data();
                    // try delete auth account if authUid present
                    if (sup.authUid) {
                        try {
                            // Note: deleting other auth users requires admin privileges (server). We cannot delete another auth user from client SDK.
                            // So here we only remove the Firestore doc and leave auth user for manual removal using Firebase Console or Cloud Function.
                        } catch (err) {
                            console.warn('Could not delete auth user from client:', err);
                        }
                    }
                    await db.collection('supervisors').doc(id).delete();
                    logActivity(`ADMIN DELETED SUPERVISOR ${sup.name} (ID: ${id}).`);
                }
            }
        };

        // ---------- Station rendering & assignment ----------
        function renderStationStatusAdmin() {
            stationStatusAdmin.innerHTML = '';
            const stations = window._stationsCache || [];
            stations.forEach(station => {
                let statusClass = station.isOccupied ? 'occupied' : 'unoccupied';
                if (station.statusFlag) statusClass = 'needs-maintenance';
                const statusText = station.isOccupied ? 'OCCUPIED' : (station.statusFlag ? station.statusFlag.toUpperCase() : 'UNOCCUPIED');
                const assignedDetails = station.isOccupied ? `
                    <p class="text-sm">ASSIGNED TO: ${station.assignedTo ? station.assignedTo.name : 'N/A'}</p>
                    <p class="text-sm">ASSIGNED BY: ${station.assignedBy || 'N/A'}</p><p class="text-sm" style="font-weight:bold;">OCCUPIED BY: ${station.assignedTo ? station.assignedTo.name : 'N/A'}</p>
                    <p class="text-sm">TIME LEFT: <span id="timer-${station.id}-admin">--:--</span></p>
                    <button onclick="unassignStation(${station.id}, 'admin')" class="btn-danger w-full mt-2" style="font-size: 0.75rem; padding: 0.25rem;">UNASSIGN</button>
                ` : '';
                const issueDetails = station.issue ? `<p class="text-xs text-neon-yellow mt-2">ISSUE: ${station.issue}</p><button onclick="dismissIssue(${station.id})" class="btn-warning" style="font-size:0.75rem; padding:0.25rem;">DISMISS ISSUE</button>` : '';
                const stationCard = document.createElement('div');
                stationCard.className = `station-card ${statusClass}`;
                stationCard.innerHTML = `
                    <h3 class="text-xl font-bold">STATION ${station.id}</h3>
                    <p class="text-sm font-bold">${statusText}</p>
                    ${assignedDetails}
                    ${issueDetails}
                `;
                stationStatusAdmin.appendChild(stationCard);
            });
        }

        window.unassignStation = async function(id, unassignedBy) {
            const sRef = db.collection('stations').doc(String(id));
            const sDoc = await sRef.get();
            if (!sDoc.exists) return;
            const s = sDoc.data();
            if (!s.isOccupied) return;
            // update student's history
            if (s.assignedTo && s.assignedTo.id) {
                const stuRef = db.collection('students').doc(s.assignedTo.id);
                const stuDoc = await stuRef.get();
                if (stuDoc.exists) {
                    const stu = stuDoc.data();
                    const hist = stu.stationHistory || [];
                    const startTime = s.sessionEndTime ? (s.sessionEndTime - (s.sessionDuration || 0)*60000) : Date.now();
                    hist.push({ stationId: s.id, startTime: new Date(startTime).toISOString(), endTime: new Date().toISOString() });
                    await stuRef.update({ stationHistory: hist });
                }
            }
            // push to stationUsage collection
            await db.collection('stationUsageHistory').add({
                stationId: s.id,
                studentId: s.assignedTo ? s.assignedTo.id : null,
                startTime: s.sessionEndTime ? (new Date(s.sessionEndTime - (s.sessionDuration || 0)*60000)).toISOString() : new Date().toISOString(),
                endTime: new Date().toISOString(),
                duration: s.sessionDuration || null,
                timestamp: new Date()
            });
            await sRef.update({
                isOccupied: false,
                assignedTo: null,
                assignedBy: null,
                sessionEndTime: null,
                sessionDuration: null,
                issue: null,
                statusFlag: null
            });
            alert(`STATION ${id} HAS BEEN UNASSIGNED.`);
            logActivity(`${unassignedBy.toUpperCase()} UNASSIGNED STATION ${id}.`);
        }

        function renderStationSelectors() {
            stationSelect.innerHTML = '<option value="">SELECT A STATION</option>';
            issueStationSelect.innerHTML = '<option value="">SELECT A STATION</option>';
            const stations = window._stationsCache || [];
            stations.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = `STATION ${station.id}`;
                if (station.isOccupied) {
                    option.disabled = true;
                    option.textContent += ' (OCCUPIED)';
                }
                stationSelect.appendChild(option);
                const issueOption = document.createElement('option');
                issueOption.value = station.id;
                issueOption.textContent = `STATION ${station.id}`;
                if (station.statusFlag) issueOption.textContent += ` (${station.statusFlag})`;
                issueStationSelect.appendChild(issueOption);
            });
        }

        studentLookupInput.addEventListener('input', async () => {
            const value = studentLookupInput.value.trim();
            if (!value) {
                studentProfilePreview.style.display = 'none';
                return;
            }
            // try find by id then by name
            let student = null;
            const doc = await db.collection('students').doc(value).get();
            if (doc.exists) student = { id: doc.id, ...doc.data() };
            else {
                const snap = await db.collection('students').where('name', '==', value).limit(1).get();
                if (!snap.empty) {
                    const sd = snap.docs[0];
                    student = { id: sd.id, ...sd.data() };
                }
            }
            if (student) {
                studentProfilePreview.style.display = 'flex';
                studentPhotoPreview.src = student.photo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwZmYwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
                studentDetailsPreview.innerHTML = `
                    <p class="text-xl text-neon-green">${student.name}</p>
                    <p class="text-sm">ID: ${student.id}</p>
                    <p class="text-sm">Hostel: ${student.hostel}</p>
                `;
                studentLookupMessage.textContent = '';
            } else {
                studentProfilePreview.style.display = 'none';
                studentLookupMessage.textContent = 'STUDENT NOT FOUND. PLEASE CHECK THE ID OR NAME.';
                studentLookupMessage.className = 'text-center text-neon-red mt-2';
            }
        });

        stationAssignmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const stationId = parseInt(e.target['station-select'].value);
            const studentLookup = e.target['student-lookup-input'].value.trim();
            const duration = parseInt(e.target['session-duration'].value);
            if (!studentLookup) {
                studentLookupMessage.textContent = 'ENTER STUDENT ID OR NAME.';
                return;
            }
            // find student
            let student = null;
            const doc = await db.collection('students').doc(studentLookup).get();
            if (doc.exists) student = { id: doc.id, ...doc.data() };
            else {
                const snap = await db.collection('students').where('name', '==', studentLookup).limit(1).get();
                if (!snap.empty) {
                    student = { id: snap.docs[0].id, ...snap.docs[0].data() };
                }
            }
            if (!student) {
                studentLookupMessage.textContent = 'ERROR: STUDENT DOES NOT EXIST IN THE SYSTEM.';
                studentLookupMessage.className = 'text-center text-neon-red mt-2';
                return;
            }
            const sRef = db.collection('stations').doc(String(stationId));
            const sDoc = await sRef.get();
            if (!sDoc.exists) {
                studentLookupMessage.textContent = 'INVALID STATION.';
                studentLookupMessage.className = 'text-center text-neon-red mt-2';
                return;
            }
            const s = sDoc.data();
            if (s.isOccupied) {
                studentLookupMessage.textContent = 'STATION IS ALREADY OCCUPIED.';
                studentLookupMessage.className = 'text-center text-neon-red mt-2';
                return;
            }
            // assign station
            await sRef.update({
                isOccupied: true,
                assignedTo: { id: student.id, name: student.name },
                assignedBy: currentUser.name || 'Supervisor',
                sessionEndTime: Date.now() + duration*60000,
                sessionDuration: duration
            });
            studentLookupMessage.textContent = `SUCCESS: STATION ${stationId} ASSIGNED TO ${student.name}.`;
            studentLookupMessage.className = 'text-center mt-2 text-neon-green';
            stationAssignmentForm.reset();
            studentProfilePreview.style.display = 'none';
            logActivity(`SUPERVISOR ${currentUser.name || 'unknown'} ASSIGNED STATION ${stationId} TO ${student.name} for ${duration} minutes.`);
            await db.collection('assignments').add({stationId, studentId: student.id, studentName: student.name, supervisorId: currentUser.id, supervisorName: currentUser.name, time: new Date(), duration});
        });

        function renderStationStatusSupervisor() {
            stationStatusSupervisor.innerHTML = '';
            const stations = window._stationsCache || [];
            stations.forEach(station => {
                let statusClass = station.isOccupied ? 'occupied' : 'unoccupied';
                if (station.statusFlag) statusClass = 'needs-maintenance';
                const statusText = station.isOccupied ? 'OCCUPIED' : (station.statusFlag ? station.statusFlag.toUpperCase() : 'UNOCCUPIED');
                const assignedDetails = station.isOccupied ? `
                    <p class="text-sm">BY: ${station.assignedTo ? station.assignedTo.name : 'N/A'}</p>
                    <p class="text-sm">TIME LEFT: <span id="timer-${station.id}-supervisor">--:--</span></p>
                    <button onclick="unassignStation(${station.id}, 'supervisor')" class="btn-danger w-full mt-2" style="font-size: 0.75rem; padding: 0.25rem;">UNASSIGN</button>
                ` : '';
                const issueDetails = station.issue ? `<p class="text-xs text-neon-yellow mt-2">ISSUE: ${station.issue}</p><button onclick="dismissIssue(${station.id})" class="btn-warning" style="font-size:0.75rem; padding:0.25rem;">DISMISS ISSUE</button>` : '';
                const stationCard = document.createElement('div');
                stationCard.className = `station-card ${statusClass}`;
                stationCard.innerHTML = `
                    <h3 class="text-xl font-bold">STATION ${station.id}</h3>
                    <p class="text-sm font-bold">${statusText}</p>
                    ${assignedDetails}
                    ${issueDetails}
                `;
                stationStatusSupervisor.appendChild(stationCard);
            });
        }

        issueReportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const stationId = parseInt(e.target['issue-station-select'].value);
            const statusFlag = e.target['issue-type'].value;
            const description = e.target['issue-description'].value;
            const sRef = db.collection('stations').doc(String(stationId));
            const sDoc = await sRef.get();
            if (!sDoc.exists) {
                alert('INVALID STATION SELECTED.');
                return;
            }
            await sRef.update({ statusFlag, issue: description });
            await db.collection('maintenanceLog').add({
                stationId, reportedBy: currentUser.name || 'unknown', statusFlag, description, date: new Date()
            });
            alert(`ISSUE REPORTED FOR STATION ${stationId}: ${description}`);
            issueReportForm.reset();
            logActivity(`SUPERVISOR ${currentUser.name || 'unknown'} REPORTED AN ISSUE WITH STATION ${stationId} (${statusFlag}).`);
        });

        supervisorChangePasswordBtn.addEventListener('click', () => {
            passwordChangeModal.style.display = 'block';
        });
        cancelChangeBtn.addEventListener('click', () => {
            passwordChangeModal.style.display = 'none';
        });
        passwordChangeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = e.target['current-password'].value;
            const newPassword = e.target['new-password'].value;
            const changePasswordMessage = document.getElementById('change-password-message');
            try {
                const user = auth.currentUser;
                if (!user) throw new Error('Not authenticated');
                // Re-authenticate and change password
                const cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
                await user.reauthenticateWithCredential(cred);
                await user.updatePassword(newPassword);
                passwordChangeModal.style.display = 'none';
                changePasswordMessage.textContent = '';
                alert('PASSWORD CHANGED SUCCESSFULLY!');
                logActivity(`PASSWORD FOR SUPERVISOR WAS CHANGED.`);
            } catch (err) {
                console.error(err);
                changePasswordMessage.textContent = err.message || 'FAILED TO CHANGE PASSWORD.';
            }
        });

        // ---------- Kiosk rendering ----------
        function renderKioskStations() {
            kioskStationList.innerHTML = '';
            const stations = window._stationsCache || [];
            stations.forEach(station => {
                let statusClass = station.isOccupied ? 'occupied' : 'unoccupied';
                if (station.statusFlag) statusClass = 'needs-maintenance';
                const statusText = station.isOccupied ? 'OCCUPIED' : (station.statusFlag ? station.statusFlag.toUpperCase() : 'UNOCCUPIED');
                const stationCard = document.createElement('div');
                stationCard.className = `kiosk-card station-card ${statusClass}`;
                stationCard.innerHTML = `
                    <h3 class="text-xl font-bold">STATION ${station.id}</h3>
                    <p class="text-sm font-bold">${statusText}</p>
                `;
                kioskStationList.appendChild(stationCard);
            });
        }

        // ---------- Timers & utility updates ----------
        let sessionTimerInterval = null;
        function startSessionTimers() {
            if (sessionTimerInterval) clearInterval(sessionTimerInterval);
            sessionTimerInterval = setInterval(() => {
                const now = Date.now();
                const stations = window._stationsCache || [];
                stations.forEach(station => {
                    if (station.isOccupied && station.sessionEndTime) {
                        const timeLeftMs = station.sessionEndTime - now;
                        if (timeLeftMs <= 0) {
                            // auto unassign
                            unassignStation(station.id, 'auto-timer');
                        } else {
                            const minutes = Math.floor(timeLeftMs / 60000);
                            const seconds = Math.floor((timeLeftMs % 60000) / 1000);
                            const timerElAdmin = document.getElementById(`timer-${station.id}-admin`);
                            if (timerElAdmin) timerElAdmin.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
                            const timerElSupervisor = document.getElementById(`timer-${station.id}-supervisor`);
                            if (timerElSupervisor) timerElSupervisor.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
                        }
                    }
                });
            }, 1000);
        }

        // ---------- Chat (Firestore-backed) ----------
        function renderChat(chatBox, userRole) {
            chatBox.innerHTML = '';
            const messages = window._chatsCache || [];
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${msg.role === 'admin' ? 'admin' : 'supervisor'}`;
                messageDiv.innerHTML = `<p class="font-bold">${msg.sender}:</p><p>${msg.text}</p><p style="text-align: right; font-size: 0.75rem; opacity: 0.7;">${new Date(msg.time).toLocaleTimeString()}</p>`;
                chatBox.appendChild(messageDiv);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        adminChatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('admin-chat-input');
            const text = input.value.trim();
            if (!text) return;
            await db.collection('chats').add({
                sender: 'ADMIN',
                role: 'admin',
                text,
                time: Date.now()
            });
            input.value = '';
        });

        supervisorChatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('supervisor-chat-input');
            const text = input.value.trim();
            if (!text) return;
            await db.collection('chats').add({
                sender: currentUser.name || 'SUPERVISOR',
                role: 'supervisor',
                text,
                time: Date.now()
            });
            input.value = '';
        });

        // ---------- Broadcast ----------
        broadcastForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = e.target['broadcast-message-input'].value.trim();
            if (!message) return;
            await db.collection('meta').doc('broadcast').set({ message, time: Date.now() });
            e.target.reset();
            logActivity(`ADMIN SENT AN EMERGENCY BROADCAST: "${message}"`);
        });
        window.dismissBroadcast = async () => {
            await db.collection('meta').doc('broadcast').delete();
            broadcastMessageEl.style.display = 'none';
        };

        // ---------- Activities logging ----------
        async function logActivity(message) {
            await db.collection('activities').add({ message, time: Date.now() });
        }

        // ---------- Reports ----------
        function updateReportCounts() {
            const stations = window._stationsCache || [];
            const totalStations = stations.length;
            const occupiedStations = stations.filter(s=>s.isOccupied).length;
            const unoccupiedStations = totalStations - occupiedStations;
            document.getElementById('report-supervisors').textContent = supervisorsCache.length;
            document.getElementById('report-students').textContent = studentsCache.length;
            document.getElementById('report-total-stations').textContent = totalStations;
            document.getElementById('report-occupied-stations').textContent = occupiedStations;
            document.getElementById('report-unoccupied-stations').textContent = unoccupiedStations;
        }

        customReportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const startDate = e.target['report-start-date'].value ? new Date(e.target['report-start-date'].value) : null;
            const endDate = e.target['report-end-date'].value ? new Date(e.target['report-end-date'].value) : null;
            const metrics = Array.from(e.target.querySelectorAll('input[name="metric"]:checked')).map(cb => cb.value);
            let reportHtml = '<h3>CUSTOM REPORT</h3>';
            if (startDate && endDate) reportHtml += `<p>Date Range: ${startDate.toDateString()} to ${endDate.toDateString()}</p>`;
            // fetch stationUsageHistory and filter
            const snap = await db.collection('stationUsageHistory').get();
            const history = [];
            snap.forEach(d => history.push(d.data()));
            const filtered = history.filter(h => {
                if (startDate && endDate) {
                    const st = new Date(h.startTime);
                    return st >= startDate && st <= endDate;
                }
                return true;
            });
            if (metrics.includes('mostUsed') || metrics.includes('leastUsed')) {
                const usageCounts = filtered.reduce((acc,curr)=>{ acc[curr.stationId]=(acc[curr.stationId]||0)+1; return acc; }, {});
                const sorted = Object.entries(usageCounts).sort(([,a],[,b])=>b-a);
                if (metrics.includes('mostUsed')) {
                    reportHtml += `<h4>MOST USED STATIONS:</h4><ol>`;
                    sorted.slice(0,5).forEach(([stationId,count])=> reportHtml += `<li>STATION ${stationId}: ${count} TIMES</li>`);
                    reportHtml += `</ol>`;
                }
                if (metrics.includes('leastUsed')) {
                    const least = sorted.slice(-5).reverse();
                    reportHtml += `<h4>LEAST USED STATIONS:</h4><ol>`;
                    least.forEach(([stationId,count])=> reportHtml += `<li>STATION ${stationId}: ${count} TIMES</li>`);
                    reportHtml += `</ol>`;
                }
            }
            if (metrics.includes('averageSession')) {
                const totalDuration = filtered.reduce((sum,h)=> sum + (h.duration||0), 0);
                const avg = filtered.length>0 ? (totalDuration/filtered.length).toFixed(2) : 0;
                reportHtml += `<h4>AVERAGE SESSION TIME:</h4><p>${avg} MINUTES</p>`;
            }
            customReportOutput.innerHTML = reportHtml;
            customReportOutput.style.display = 'block';
            logActivity('ADMIN GENERATED A CUSTOM REPORT.');
        });

        // ---------- Password strength ----------
        function checkPasswordStrength(password, element) {
            const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");
            const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
            if (strongRegex.test(password)) {
                element.textContent = 'Strong';
                element.className = 'password-strength strong';
            } else if (mediumRegex.test(password)) {
                element.textContent = 'Medium';
                element.className = 'password-strength medium';
            } else {
                element.textContent = 'Weak';
                element.className = 'password-strength weak';
            }
        }
        supervisorRegPasswordInput.addEventListener('input', (e)=> checkPasswordStrength(e.target.value, supervisorPasswordStrength));
        passwordChangeForm.addEventListener('input', (e) => {
            if (e.target.id === 'new-password') checkPasswordStrength(e.target.value, newPasswordStrength);
        });

        // ---------- Initialization on DOMContentLoaded ----------
        document.addEventListener('DOMContentLoaded', async () => {
            updateWelcomeMessage();
            toggleLoginForms('admin');
            await ensureAdminSettings();
            await ensureStationsExist(100); // keep original count (100)
            attachRealtimeListeners();
            startSessionTimers();
            
// add back-to-top buttons to each section
document.querySelectorAll('.system-panel').forEach(panel => {
    const btn = document.createElement('button');
    btn.textContent = 'Back to Top';
    btn.className = 'btn-primary';
    btn.style.marginTop = '0.5rem';
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    panel.appendChild(btn);
});

        });
    
        // Smooth scroll helper
        function scrollToSection(id) {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Theme toggle
        function toggleTheme() {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('prefersLight', isLight ? '1' : '0');
        }
        (function initTheme(){
            const pref = localStorage.getItem('prefersLight');
            if (pref === '1') document.body.classList.add('light-mode');
        })();
        // Dismiss issue (admin)
        window.dismissIssue = async (stationId) => {
            await db.collection('stations').doc(String(stationId)).update({ statusFlag: null, issue: null });
            logActivity(`ADMIN DISMISSED ISSUE ON STATION ${stationId}.`);
        };
        // Update supervisor on duty (admin listener)
        (function listenOnDuty(){
            db.collection('meta').doc('supervisorOnDuty').onSnapshot(doc=>{
                const el = document.getElementById('supervisor-on-duty-details');
                if (!el) return;
                if (doc.exists && doc.data() && doc.data().name) {
                    const d = doc.data();
                    el.innerHTML = `<div style='display:flex;align-items:center;gap:0.5rem;'><img src='${d.photoUrl || ''}' onerror="this.style.display='none'" style='width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid #00ff00;'> <span>${d.name} (ID: ${d.id}, Email: ${d.email || 'N/A'})</span></div>`;
                } else {
                    el.textContent = 'None';
                }
            });
        })();

// === Enhancements Injected ===

// Toast helper
function showToast(msg) {
    let t = document.createElement('div'); 
    t.className='toast'; 
    t.textContent = msg; 
    document.body.appendChild(t); 
    setTimeout(()=>{ t.remove(); }, 5000);
}

// Menu toggles
document.addEventListener('click', (e)=>{
    const adminMenu = document.getElementById('admin-menu-btn');
    const supMenu = document.getElementById('sup-menu-btn');
    if (adminMenu && e.target === adminMenu) adminMenu.parentElement.classList.toggle('show');
    else if (supMenu && e.target === supMenu) supMenu.parentElement.classList.toggle('show');
    else {
        document.querySelectorAll('.menu').forEach(m=>m.classList.remove('show'));
    }
});

// Health monitor
async function checkHealth() {
    const el = document.getElementById('health-status');
    try {
        await db.collection('meta').doc('healthPing').set({ ts: Date.now() }, { merge: true });
        const doc = await db.collection('meta').doc('healthPing').get();
        if (doc.exists) {
            el.textContent = 'Online';
            el.className = 'text-neon-green';
        } else throw new Error('No doc');
    } catch(e) {
        el.textContent = navigator.onLine ? 'Firebase error' : 'Offline';
        el.className = 'text-neon-red';
    }
}
setInterval(checkHealth, 10000);
setTimeout(checkHealth, 1000);

// Audit helper
async function logAudit(action, details) {
    try {
        const user = auth.currentUser;
        const role = window.currentUser && window.currentUser.role || 'unknown';
        await db.collection('auditTrail').add({
            time: Date.now(),
            uid: user ? user.uid : null,
            user: window.currentUser && (window.currentUser.name || window.currentUser.email) || (user && user.email) || 'unknown',
            role,
            action,
            details
        });
    } catch(e){ console.error('Audit failed', e); }
}

// Listen audit in UI
db.collection('auditTrail').orderBy('time','desc').limit(100).onSnapshot(snap=>{
    const body = document.getElementById('audit-body');
    if (!body) return;
    body.innerHTML='';
    snap.forEach(d=>{
        const a=d.data();
        const tr=document.createElement('tr');
        const tds=[ new Date(a.time).toLocaleString(), a.user||'—', a.role||'—', a.action||'—', a.details||'—' ];
        tds.forEach(v=>{ const td=document.createElement('td'); td.textContent=v; tr.appendChild(td); });
        body.appendChild(tr);
    });
});

// Expose unassign globally (fix broken buttons)
// Auto maintenance alerts threshold
const ISSUE_THRESHOLD = 3; // configurable
async function incrementMaintenanceCounter(stationId) {
    const ref = db.collection('maintenanceCounters').doc(String(stationId));
    await db.runTransaction(async (tx)=>{
        const snap = await tx.get(ref);
        const count = snap.exists && snap.data().count || 0;
        tx.set(ref, { count: count+1, lastIssueAt: Date.now() }, { merge: true });
        if (count+1 >= ISSUE_THRESHOLD) {
            tx.set(db.collection('stations').doc(String(stationId)), { statusFlag: 'MAINTENANCE REQUIRED' }, { merge: true });
            // queue alert
            db.collection('alertsQueue').add({ kind:'maintenance', stationId, time: Date.now(), level:'critical' });
        }
    });
}

// Notify supervisors in real-time when issues are reported
db.collection('maintenanceLog').orderBy('date','desc').limit(1).onSnapshot(snap=>{
    snap.docChanges().forEach(ch=>{
        if (ch.type==='added') {
            const d = ch.doc.data();
            showToast(`Issue reported on Station ${d.stationId}: ${d.statusFlag}`);
        }
    });
});

// Admin-only: delete chat messages
window.deleteChatMessage = async function(id){
    if (!(window.currentUser && window.currentUser.role==='admin')) return alert('Admins only');
    await db.collection('chats').doc(id).delete();
    logActivity('ADMIN DELETED A CHAT MESSAGE.');
    logAudit('delete_chat', `Message ${id}`);
};

// Report downloads
async function downloadReportPDF(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('System Report', 10, 10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 20);
    doc.text(`Supervisors: ${document.getElementById('report-supervisors').textContent}`, 10, 30);
    doc.text(`Students: ${document.getElementById('report-students').textContent}`, 10, 40);
    doc.text(`Total Stations: ${document.getElementById('report-total-stations').textContent}`, 10, 50);
    doc.text(`Occupied Stations: ${document.getElementById('report-occupied-stations').textContent}`, 10, 60);
    doc.text(`Unoccupied Stations: ${document.getElementById('report-unoccupied-stations').textContent}`, 10, 70);
    doc.save('system-report.pdf');
    logAudit('download_report','pdf');
}
async function downloadReportDocx(){
    const { Document, Packer, Paragraph, TextRun } = window.docx;
    const doc = new Document({
        sections:[{ properties:{}, children:[
            new Paragraph({ children:[ new TextRun({ text:'System Report', bold:true, size:28 }) ]}),
            new Paragraph(`Generated: ${new Date().toLocaleString()}`),
            new Paragraph(`Supervisors: ${document.getElementById('report-supervisors').textContent}`),
            new Paragraph(`Students: ${document.getElementById('report-students').textContent}`),
            new Paragraph(`Total Stations: ${document.getElementById('report-total-stations').textContent}`),
            new Paragraph(`Occupied Stations: ${document.getElementById('report-occupied-stations').textContent}`),
            new Paragraph(`Unoccupied Stations: ${document.getElementById('report-unoccupied-stations').textContent}`)
        ]}]
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'system-report.docx');
    logAudit('download_report','docx');
}

// Weekly logs clear (admin)
window.clearLogsIfAllowed = async function(){
    const meta = db.collection('meta').doc('logsStatus');
    const snap = await meta.get();
    const now = Date.now();
    let allowed = true;
    if (snap.exists && snap.data().lastClearedAt){
        allowed = (now - snap.data().lastClearedAt) >= 7*24*60*60*1000;
    }
    if (!allowed) return alert('Logs can only be cleared once every 7 days.');
    // Clear activities collection
    const acts = await db.collection('activities').get();
    const batch = db.batch();
    acts.forEach(d=>batch.delete(d.ref));
    await batch.commit();
    await meta.set({ lastClearedAt: now }, { merge:true });
    alert('Logs cleared.');
    logAudit('clear_logs','activities');
};

// Broadcast & issue alert queue (email/SMS via backend)
async function queueAlert(kind, payload){
    await db.collection('alertsQueue').add({ kind, payload, time: Date.now() });
}

// Hook into existing broadcast submission
const _broadcastForm = document.getElementById('broadcast-form');
if (_broadcastForm){
    _broadcastForm.addEventListener('submit', async ()=>{
        queueAlert('broadcast', { message: document.getElementById('broadcast-message-input').value });
        logAudit('broadcast','sent');
    });
}

// Hook issue report increment + alert
if (typeof issueReportForm !== 'undefined' && issueReportForm){
    issueReportForm.addEventListener('submit', async (e)=>{
        const stationId = e.target['issue-station-select'].value;
        incrementMaintenanceCounter(stationId);
        queueAlert('issue', { stationId, type: document.getElementById('issue-type').value });
        logAudit('report_issue', `station ${stationId}`);
    }, { once:false });
}

// 2FA (email/SMS via backend). After login success, call require2FA()
async function require2FA(userRole){
    try {
        const uid = (auth.currentUser && auth.currentUser.uid) || 'unknown';
        const ref = await db.collection('twofa').add({ uid, role:userRole, createdAt: Date.now(), status:'pending' });
        // Backend should send code; we prompt for it
        const code = prompt('Enter 2FA code sent to you');
        if (!code) throw new Error('2FA required');
        // Verify by looking up match (backend should write code on same doc)
        const doc = await ref.get();
        const data = doc.data();
        if (data && data.code && data.code == code){
            await ref.ref.update({ status:'verified', verifiedAt: Date.now() });
            showToast('2FA verified');
            logAudit('2fa','verified');
            return true;
        } else {
            alert('Invalid 2FA code');
            await auth.signOut();
            return false;
        }
    } catch(e){
        console.error(e);
        alert('2FA failed');
        await auth.signOut();
        return false;
    }
}

// Attach 2FA after admin and supervisor login flows by wrapping existing success paths (light-touch)

// Global logout / change password modal opener
window.logout = async function(){
    try { await auth.signOut(); } catch(e){}
    window.currentUser = null;
    showScreen('login-screen');
    showToast('Logged out');
};
window.openChangePasswordModal = function(){
    if (passwordChangeModal) passwordChangeModal.style.display = 'block';
    else alert('Password modal not available.');
};

// Supervisor-on-duty photo already handled above

// Broadcast toast
db.collection('meta').doc('broadcast').onSnapshot(doc=>{
    if (doc.exists && doc.data() && doc.data().message){
        showToast('Broadcast received');
    }
});

// End of extracted original app script
