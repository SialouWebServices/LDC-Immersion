import fs from 'fs';
import path from 'path';

const mainJsPath = path.resolve('src/main.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

// 1. Inject imports at the top
const imports = `import { queueAction } from './api/offlineDb.js';
import { processSyncQueue } from './api/syncManager.js';

window.addEventListener('online', () => {
    showToast('🌐 Connexion rétablie ! Synchronisation en cours...', 'info');
    processSyncQueue(sb, showToast);
});
`;
code = imports + '\n' + code;

// 2. Replace handleMediaFile
const handleMediaFileOld = `            const fileName = \`\${Date.now()}-\${file.name.replace(/\\s/g, '_')}\`;
            const { data, error } = await sb.storage.from('media').upload(fileName, file);

            if (error) {
                console.error('Upload error:', error);
                if (statusEl) { statusEl.innerHTML = \`<div class="upload-status error">❌ Erreur : \${error.message}</div>\`; }
                return;
            }

            const { data: urlData } = sb.storage.from('media').getPublicUrl(fileName);
            state.pendingMedia = { type, url: urlData.publicUrl };`;

const handleMediaFileNew = `            let publicUrl = null;
            if (navigator.onLine) {
                const fileName = \`\${Date.now()}-\${file.name.replace(/\\s/g, '_')}\`;
                const { data, error } = await sb.storage.from('media').upload(fileName, file);

                if (error) {
                    console.error('Upload error:', error);
                    if (statusEl) { statusEl.innerHTML = \`<div class="upload-status error">❌ Erreur : \${error.message}</div>\`; }
                    return;
                }
                const { data: urlData } = sb.storage.from('media').getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
            }
            
            // Store preview locally (blob url) or public url
            const localUrl = URL.createObjectURL(file);
            state.pendingMedia = { 
                type, 
                url: publicUrl || localUrl, 
                file: navigator.onLine ? null : file // keep file if offline
            };`;

code = code.replace(handleMediaFileOld, handleMediaFileNew);

// 3. Replace saveNoteRemote
const saveNoteRemoteOld = `            const { error } = await sb.from('journal_notes').insert([{
                title: title || null,
                content: content || null,
                author: state.currentUser,
                media_type: state.pendingMedia?.type || null,
                media_url: state.pendingMedia?.url || null,
                pole_id: poleId || null
            }]);

            if (error) {
                console.error('Save error:', error);
                showToast('Erreur lors de la sauvegarde : ' + error.message, 'error');
                return;
            }`;

const saveNoteRemoteNew = `            const noteData = {
                title: title || null,
                content: content || null,
                author: state.currentUser,
                media_type: state.pendingMedia?.type || null,
                media_url: state.pendingMedia?.url || null,
                pole_id: poleId || null
            };

            if (!navigator.onLine) {
                await queueAction('notes_queue', { ...noteData, media_blob: state.pendingMedia?.file || null, action: 'insert' });
                // Push immediately to local state for UX
                noteData.id = Date.now();
                noteData.created_at = new Date().toISOString();
                state.generalNotes.unshift(noteData);
            } else {
                const { error } = await sb.from('journal_notes').insert([noteData]);
                if (error) {
                    console.error('Save error:', error);
                    showToast('Erreur lors de la sauvegarde : ' + error.message, 'error');
                    return;
                }
            }`;

code = code.replace(saveNoteRemoteOld, saveNoteRemoteNew);

// 4. toggleVisit
const toggleVisitOld = `await sb.from('poles_status').update({ [field]: newVal }).eq('id', poleId);`;
const toggleVisitNew = `if (!navigator.onLine) {
                await queueAction('poles_status_queue', { poleId, field, value: newVal, action: 'update_field' });
                pole.visited[state.currentUser] = newVal;
                if (state.selectedPoleId === poleId) renderPanelContent();
                render();
            } else {
                await sb.from('poles_status').update({ [field]: newVal }).eq('id', poleId);
            }`;
code = code.replace(toggleVisitOld, toggleVisitNew);

// 5. updateNoteRemote
const updateNoteRemoteOld = `await sb.from('poles_status').update({ [field]: value }).eq('id', poleId);`;
const updateNoteRemoteNew = `if (!navigator.onLine) {
                await queueAction('poles_status_queue', { poleId, field, value, action: 'update_field' });
            } else {
                await sb.from('poles_status').update({ [field]: value }).eq('id', poleId);
            }`;
code = code.replace(updateNoteRemoteOld, updateNoteRemoteNew);

// 6. addContactRemote
const addContactRemoteOld = `await sb.from('contacts').insert([{ name, role, memo, added_by: state.currentUser }]);`;
const addContactRemoteNew = `const contactData = { name, role, memo, added_by: state.currentUser };
            if (!navigator.onLine) {
                contactData.id = Date.now();
                state.contacts.unshift(contactData);
                await queueAction('contacts_queue', { ...contactData, action: 'insert' });
            } else {
                await sb.from('contacts').insert([contactData]);
            }`;
code = code.replace(addContactRemoteOld, addContactRemoteNew);


fs.writeFileSync(mainJsPath, code);
console.log('src/main.js has been successfully refactored for Offline capability.');

