import fs from 'fs';
import path from 'path';

const mainJsPath = path.resolve('src/main.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

// 1. Refactor generateReport logic
const generateReportOld = `        // ===== IA =====
        async function generateReport() {
            state.isGeneratingIA = true; render();
            const poles = state.poles.map(p => \`Pôle \${p.name}: R:\${p.notes.Rodrigue}, H:\${p.notes.Henriette}\`).join('\\n');
            const journal = state.generalNotes.map(n => \`[\${n.author}] \${n.title || ''}: \${n.content || ''}\`).join('\\n');
            const prompt = \`Synthèse Immersion LDC:\\n\\nPÔLES:\\n\${poles}\\n\\nJOURNAL:\\n\${journal}\`;`;

const generateReportNew = `        // ===== IA =====
        async function generateReport() {
            state.isGeneratingIA = true; render();
            const polesData = state.poles.map(p => {
                const visitedR = p.visited.Rodrigue ? 'Oui' : 'Non';
                const visitedH = p.visited.Henriette ? 'Oui' : 'Non';
                return \`- **Pôle \${p.name}** (Visité par Rodrigue: \${visitedR}, Henriette: \${visitedH})\\n  Observations Rodrigue: \${p.notes.Rodrigue || '... '}\\n  Observations Henriette: \${p.notes.Henriette || '...'}\`;
            }).join('\\n\\n');
            
            const journalData = state.generalNotes.map(n => \`- [\${n.author}] **\${n.title || 'Note globale'}**: \${n.content || '...'}\`).join('\\n');
            
            const prompt = \`Tu es un assistant analytique expert accompagnant Rodrigue et Henriette SIALOU lors de leur immersion stratégique au LDC (Côte d'Ivoire).
À partir des données terrains brutes suivantes, génère une synthèse finale professionnelle, brillante et percutante.

📋 DONNÉES DES PÔLES:
\${polesData}

🗒️ NOTES DE JOURNAL:
\${journalData}

CONSIGNES DE MISE EN FORME (Markdown structuré):
1. **Introduction Courte** : Résumé chaleureux de l'état d'avancement, félicitant Rodrigue et Henriette.
2. **Tableau de Suivi** : Récapitulatif clair des statuts de visites par pôle.
3. **Faits Marquants & Constats** : Les idées principales identifiées sous forme de puces (bullets point).
4. **Conclusion & Suites à donner** : Recommandations stratégiques et claires basées sur le journal.
Utilise des émojis professionnels avec parcimonie pour aérer la lecture.\`;`;

code = code.replace(generateReportOld, generateReportNew);

// 2. Refactor Speech Recognition
const toggleAudioOld = `        // ===== AUDIO RECORDING =====
        async function toggleAudioRecording(context) {
            if (!state.isRecordingAudio) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    state.mediaRecorder = new MediaRecorder(stream);
                    state.audioChunks = [];`;

const toggleAudioNew = `        // ===== AUDIO RECORDING =====
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
                    }`;

code = code.replace(toggleAudioOld, toggleAudioNew);

const toggleAudioStopOld = `                    state.mediaRecorder.onstop = async () => {`;
const toggleAudioStopNew = `                    state.mediaRecorder.onstop = async () => {
                        if (speechRecognition) {
                            try { speechRecognition.stop(); } catch(e){}
                            speechRecognition = null;
                        }`;
code = code.replace(toggleAudioStopOld, toggleAudioStopNew);

fs.writeFileSync(mainJsPath, code);

// 3. Inject CSS for Glassmorphism
const cssPath = path.resolve('src/styles/global.css');
let css = fs.readFileSync(cssPath, 'utf8');

const glassCSS = `
        /* === Glassmorphism & AI Styles Phase 3 === */
        #presentation-mode {
            background: linear-gradient(135deg, #0b0f19 0%, #1a1830 50%, #2d2654 100%);
        }
        .slide {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 24px 60px rgba(0,0,0,0.4);
            transform: translateY(0);
            transition: transform 0.4s ease, opacity 0.4s ease;
        }
        
        .ia-markdown-content {
            background: rgba(255, 255, 255, 0.02) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 16px;
            padding: 30px;
            box-shadow: inset 0 2px 10px rgba(255,255,255,0.05);
        }

        .ia-markdown-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            overflow: hidden;
        }

        .ia-markdown-content th, .ia-markdown-content td {
            padding: 12px 15px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            text-align: left;
            color: #ddd;
        }
        
        .ia-markdown-content th {
            background: rgba(255,255,255,0.05);
            font-weight: 600;
            color: white;
        }

        .ia-markdown-content tbody tr:last-child td {
            border-bottom: none;
        }
`;

css = css + '\n' + glassCSS;
fs.writeFileSync(cssPath, css);

console.log('Phase 3 refactoring completed (AI & Speech).');
