// app.js - extracted from your original system and adapted to initialize Supabase via the adapter

// NOTE: The original firebaseConfig from your file has been preserved; below we added supabaseUrl and supabaseKey placeholders.

// ---------- Firebase Configuration ----------
        const firebaseConfig = {

          apiKey: "AIzaSyDrjo_HDQ1RRkjA-zXgZtuFovI7zg2yma0",
          authDomain: "kmu-digita-rsc-mnt-system.firebaseapp.com",
          databaseURL: "https://kmu-digita-rsc-mnt-system-default-rtdb.firebaseio.com",
          projectId: "kmu-digita-rsc-mnt-system",
          storageBucket: "kmu-digita-rsc-mnt-system.appspot.com",
          messagingSenderId: "908284620214",
          appId: "1:908284620214:web:e76e9a4757c162eea1a517",
          measurementId: "G-JEPQ1YMVNE",
        
  // SUPABASE: add your supabase info below (added automatically)
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
                        assignedby: null,
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
            // Maintenance Log & Audit Trail Listeners
            db.collection('maintenancelog').orderBy('date', 'desc').onSnapshot(snapshot => {
              // ... your code to render the maintenance log ...
            });
            db.collection('audittrail').orderBy('time', 'desc').onSnapshot(snapshot => {
              // ... your code to render the audit trail ...
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
            const email = e.target['admin-username'].value.trim(); // Your form uses 'admin-username' as the email input
            const password = e.target['admin-password'].value;
            try {
                // Use the correct Firebase-style function name
                const { data, error } = await auth.signInWithEmailAndPassword(email, password);

                if (error || !data || !data.user) {
                    throw error || new Error('LOGIN FAILED. Invalid credentials or no user data.');
                }
                
                // If login is successful, set the current user and navigate to the dashboard
                currentUser = { role: 'admin', uid: data.user.id, name: 'Admin' };
                
                showScreen('admin-dashboard');
                attachRealtimeListeners();
                logActivity('Admin logged in.');
            } catch (err) {
                console.error(err);
                adminLoginMessage.textContent = err.message || 'LOGIN FAILED. Check your email and password.';
            }
        });

        supervisorLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            supervisorLoginMessage.textContent = '';
            const id = e.target['supervisor-id'].value.trim();
            const email = `${id}@kmu.com`; // Construct email from the ID
            const password = e.target['supervisor-password'].value;
            try {
                // Attempt Supabase authentication first using the correct function name
                const { data, error } = await auth.signInWithEmailAndPassword(email, password);

                if (error || !data || !data.user) {
                    // if auth fails, check lockout status from Firestore for a helpful message
                    const supDoc = await db.collection('supervisors').doc(id).get();
                    if (supDoc.exists) {
                         const sup = supDoc.data();
                         const now = Date.now();
                         const lockUntil = sup.lockUntil ? sup.lockUntil.toMillis ? sup.lockUntil.toMillis() : sup.lockUntil : null;
                         if (lockUntil && lockUntil > now) {
                            const mins = Math.ceil((lockUntil - now) / 60000);
                            supervisorLoginMessage.textContent = `ACCOUNT LOCKED. TRY AGAIN IN ${mins} MINUTE(S).`;
                            return;
                         }
                    }
                    throw error || new Error('LOGIN FAILED. Invalid credentials or no user data.');
                }

                // If login is successful, get the supervisor's details from Firestore
                const supDoc = await db.collection('supervisors').doc(id).get();
                if (!supDoc.exists) {
                    supervisorLoginMessage.textContent = 'SUPERVISOR PROFILE NOT FOUND. CONTACT ADMIN.';
                    await auth.signOut();
                    return;
                }
                const sup = supDoc.data();
                if (sup.isBlocked) {
                    supervisorLoginMessage.textContent = 'THIS ACCOUNT IS BLOCKED. CONTACT ADMIN.';
                    await auth.signOut();
                    return;
                }

                // success: reset attempts
                await db.collection('supervisors').doc(id).update({ failedAttempts: 0, lockUntil: null });
                currentUser = { role: 'supervisor', uid: data.user.id, id: id, name: sup.name, email: sup.email };
                await db.collection('meta').doc('supervisorOnDuty').set({ id, name: sup.name, email: sup.email, time: new Date() });
                showScreen('supervisor-dashboard');
                attachRealtimeListeners();
                logActivity(`Supervisor ${sup.name} logged in.`);

            } catch (err) {
                console.error(err);
                supervisorLoginMessage.textContent = err.message || 'LOGIN FAILED. Check your ID and password.';
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
                const assignedSnapshot = await db.collection('stations').where('assignedby', '==', user.name).where('isOccupied', '==', true).get();
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

        // ---------- Station rendering &
