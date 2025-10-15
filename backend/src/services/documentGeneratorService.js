const { HfInference } = require('@huggingface/inference');
const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class DocumentGeneratorService {
    constructor() {
        this.provider = process.env.AI_PROVIDER || 'huggingface';
        this.storagePath = process.env.DOCUMENTS_STORAGE_PATH || './storage/documents';

        console.log('🔧 Debug Hugging Face:');
        console.log('   Token configuré:', !!process.env.HUGGINGFACE_API_KEY);
        console.log('   Provider:', this.provider);
        console.log('   Storage path:', this.storagePath);
        
        // Configuration Hugging Face (GRATUIT) - 🔧 MODÈLE CORRIGÉ
        if (process.env.HUGGINGFACE_API_KEY) {
            this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
            // ✅ Utiliser un modèle gratuit et disponible
            this.model = 'microsoft/DialoGPT-medium'; // Plus petit et disponible
            console.log('✅ Modèle Hugging Face configuré:', this.model);
        } else {
            console.log('❌ Token Hugging Face manquant dans .env');
        }
        
        this.ensureDirectoryExists();
        
        console.log(`🤖 Générateur de documents initialisé avec ${this.provider} (GRATUIT)`);
    }

    async ensureDirectoryExists() {
        try {
            await fsExtra.ensureDir(this.storagePath);
            console.log('✅ Storage directory created/verified:', this.storagePath);
        } catch (error) {
            console.error('❌ Erreur création dossier:', error);
        }
    }

    // Test de connexion Hugging Face
    async testHuggingFaceConnection() {
        if (!process.env.HUGGINGFACE_API_KEY) {
            return { 
                success: false, 
                error: 'Token Hugging Face non configuré' 
            };
        }

        try {
            console.log('🧪 Test de connexion Hugging Face...');
            
            // ✅ Utiliser un modèle plus simple et fiable
            const response = await this.hf.textGeneration({
                model: 'gpt2', // Modèle de base toujours disponible
                inputs: "Generate a simple text:",
                parameters: {
                    max_new_tokens: 10,
                    temperature: 0.1
                }
            });

            console.log('✅ Test Hugging Face réussi');
            return { 
                success: true, 
                message: 'Connexion réussie à Hugging Face',
                model: 'gpt2 (fallback)'
            };
        } catch (error) {
            console.error('❌ Erreur test Hugging Face:', error);
            return { 
                success: false, 
                error: error.message || 'Erreur de connexion'
            };
        }
    }

    // Générer un CV LaTeX avec Hugging Face (GRATUIT)
    async generateCV(userProfile, options = {}) {
        try {
            console.log('🤖 Génération du CV (Mode Template)...');

            // ✅ Générer directement avec le template personnalisé (plus fiable)
            const latexContent = this.generatePersonalizedTemplate('cv', userProfile, options);
            
            const filename = `cv_${userProfile.id}_${Date.now()}`;
            
            // Compiler en PDF
            const result = await this.compileToPDF(latexContent, filename);
            
            return {
                success: true,
                filename: result.filename,
                path: result.path,
                latexSource: latexContent
            };

        } catch (error) {
            console.error('❌ Erreur génération CV:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Générer une lettre de motivation
    async generateCoverLetter(userProfile, jobOffer, options = {}) {
        try {
            console.log('📝 Génération lettre de motivation (Mode Template)...');

            const latexContent = this.generatePersonalizedTemplate('cover_letter', userProfile, options, jobOffer);
            
            const filename = `lettre_${userProfile.id}_${Date.now()}`;
            
            // Compiler en PDF
            const result = await this.compileToPDF(latexContent, filename);
            
            return {
                success: true,
                filename: result.filename,
                path: result.path,
                latexSource: latexContent
            };

        } catch (error) {
            console.error('❌ Erreur génération lettre:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ✅ Template LaTeX corrigé - SUPPRESSION DE FRANCAIS
    generatePersonalizedTemplate(type, userProfile, options, jobOffer = null) {
        const { name, email, phone, address, summary, experiences, education, skills, languages, hobbies } = userProfile;
        const user = userProfile.user || {};
        
        if (type === 'cv') {
            return `\\documentclass[11pt,a4paper]{article}
    \\usepackage[utf8]{inputenc}
    \\usepackage[T1]{fontenc}
    \\usepackage{geometry}
    \\usepackage{enumitem}
    \\usepackage{titlesec}
    \\usepackage{xcolor}
    \\geometry{left=2cm,right=2cm,top=2cm,bottom=2cm}
    \\pagestyle{empty}

    % Couleurs
    \\definecolor{primary}{RGB}{0, 123, 191}
    \\definecolor{secondary}{RGB}{108, 117, 125}

    % Titres de sections
    \\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
    \\titlespacing{\\section}{0pt}{12pt}{6pt}

    \\begin{document}

    % En-tête 
    \\begin{center}
    {\\Huge\\bfseries\\color{primary} ${this.escapeLatex(user.name || name) || 'Votre Nom'}}\\\\[3mm]
    {\\large ${this.escapeLatex(summary) || 'Professionnel motive et experimente'}}\\\\[5mm]
    \\color{secondary}
    ${this.escapeLatex(email || user.email) || 'votre.email@example.com'} ${phone ? ` • ${this.escapeLatex(phone)}` : ''} ${address ? ` • ${this.escapeLatex(address)}` : ''}
    \\end{center}

    \\vspace{8mm}

    ${experiences && experiences.length > 0 ? `
    % Experience Professionnelle
    \\section{Experience Professionnelle}
    ${experiences.slice(0, 4).map(exp => `
    \\textbf{${this.escapeLatex(exp.title) || 'Poste'}} -- \\textit{${this.escapeLatex(exp.company) || 'Entreprise'}} \\hfill ${this.escapeLatex(exp.startDate) || ''} - ${this.escapeLatex(exp.endDate) || 'Present'}\\\\[1mm]
    ${this.escapeLatex(exp.description) || 'Description des responsabilites et realisations principales.'}\\\\[3mm]
    `).join('')}
    ` : `
    % Experience Professionnelle
    \\section{Experience Professionnelle}
    \\textbf{Titre du poste} -- \\textit{Entreprise} \\hfill Dates\\\\[1mm]
    Description des responsabilites et realisations principales.\\\\[3mm]
    `}

    ${education && education.length > 0 ? `
    % Formation
    \\section{Formation}
    ${education.slice(0, 3).map(edu => `
    \\textbf{${this.escapeLatex(edu.degree) || 'Diplome'}} -- \\textit{${this.escapeLatex(edu.school) || 'Ecole'}} \\hfill ${this.escapeLatex(edu.year) || 'Annee'}\\\\[1mm]
    ${this.escapeLatex(edu.description) || ''}\\\\[2mm]
    `).join('')}
    ` : `
    % Formation
    \\section{Formation}
    \\textbf{Diplome} -- \\textit{Ecole} \\hfill Annee\\\\[1mm]
    Description de la formation.\\\\[2mm]
    `}

    % Competences
    \\section{Competences}
    \\begin{itemize}[leftmargin=15pt, itemsep=1mm]
    ${skills && skills.length > 0 
    ? skills.slice(0, 8).map(skill => `\\item ${this.escapeLatex(skill)}`).join('\n')
    : '\\item Competence 1\n\\item Competence 2\n\\item Competence 3'
    }
    \\end{itemize}

    ${languages && languages.length > 0 ? `
    % Langues
    \\section{Langues}
    \\begin{itemize}[leftmargin=15pt, itemsep=1mm]
    ${languages.slice(0, 4).map(lang => `\\item ${this.escapeLatex(lang.name || lang)} -- ${this.escapeLatex(lang.level) || 'Niveau'}`).join('\n')}
    \\end{itemize}
    ` : ''}

    ${hobbies && hobbies.length > 0 ? `
    % Centres d'interet
    \\section{Centres d'interet}
    ${hobbies.slice(0, 6).map(hobby => this.escapeLatex(hobby)).join(' • ')}
    ` : ''}

    \\end{document}`;
        }

        if (type === 'cover_letter' && jobOffer) {
            return `\\documentclass[11pt,a4paper]{letter}
    \\usepackage[utf8]{inputenc}
    \\usepackage[T1]{fontenc}
    \\usepackage{geometry}
    \\geometry{margin=2.5cm}

    \\begin{document}

    \\begin{flushleft}
    ${this.escapeLatex(user.name || name) || 'Votre Nom'}\\\\
    ${this.escapeLatex(address) || 'Votre Adresse'}\\\\
    ${this.escapeLatex(phone) || 'Telephone'}\\\\
    ${this.escapeLatex(email || user.email) || 'Email'}
    \\end{flushleft}

    \\vspace{10mm}

    \\begin{flushleft}
    ${this.escapeLatex(jobOffer.company) || 'Nom de l\'entreprise'}\\\\
    Service Ressources Humaines\\\\
    ${this.escapeLatex(jobOffer.location) || 'Adresse de l\'entreprise'}
    \\end{flushleft}

    \\vspace{10mm}

    \\textbf{Objet :} Candidature pour le poste de ${this.escapeLatex(jobOffer.title) || 'Titre du poste'}

    \\vspace{5mm}

    Madame, Monsieur,

    Je me permets de vous adresser ma candidature pour le poste de ${this.escapeLatex(jobOffer.title) || 'titre du poste'} au sein de ${this.escapeLatex(jobOffer.company) || 'votre entreprise'}.

    ${summary ? `
    Fort(e) de mon experience professionnelle, je suis convaincu(e) que mon profil correspond parfaitement aux exigences de ce poste.
    ` : `
    Fort(e) de mon experience professionnelle, je suis convaincu(e) que mon profil correspond parfaitement aux exigences de ce poste.
    `}

    Je serais ravi(e) de pouvoir echanger avec vous sur ma candidature et vous demontrer ma motivation lors d'un entretien.

    Dans l'attente de votre retour, je vous prie d'agreer, Madame, Monsieur, l'expression de mes salutations distinguees.

    \\vspace{10mm}

    ${this.escapeLatex(user.name || name) || 'Votre Nom'}

    \\end{document}`;
        }

        // Fallback
        return this.generateFallbackTemplate(type);
    }

    // ✅ NOUVELLE MÉTHODE: Échapper les caractères spéciaux LaTeX
    escapeLatex(text) {
        if (!text) return '';
        return text.toString()
            .replace(/\\/g, '\\textbackslash{}')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\$/g, '\\$')
            .replace(/&/g, '\\&')
            .replace(/\%/g, '\\%')
            .replace(/#/g, '\\#')
            .replace(/\^/g, '\\textasciicircum{}')
            .replace(/_/g, '\\_')
            .replace(/~/g, '\\textasciitilde{}')
            .replace(/"/g, "''")
            .replace(/'/g, "'")
            // Conversion des caractères accentués en safe LaTeX
            .replace(/é/g, 'e')
            .replace(/è/g, 'e')
            .replace(/ê/g, 'e')
            .replace(/ë/g, 'e')
            .replace(/à/g, 'a')
            .replace(/â/g, 'a')
            .replace(/ä/g, 'a')
            .replace(/ç/g, 'c')
            .replace(/ù/g, 'u')
            .replace(/û/g, 'u')
            .replace(/ü/g, 'u')
            .replace(/î/g, 'i')
            .replace(/ï/g, 'i')
            .replace(/ô/g, 'o')
            .replace(/ö/g, 'o')
            .replace(/ÿ/g, 'y')
            // Majuscules
            .replace(/É/g, 'E')
            .replace(/È/g, 'E')
            .replace(/Ê/g, 'E')
            .replace(/À/g, 'A')
            .replace(/Â/g, 'A')
            .replace(/Ç/g, 'C')
            .replace(/Ù/g, 'U')
            .replace(/Û/g, 'U')
            .replace(/Î/g, 'I')
            .replace(/Ô/g, 'O');
    }

    // Template de secours si nécessaire
    generateFallbackTemplate(documentType) {
        const templates = {
            cv: `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{geometry}
\\geometry{margin=2cm}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\Large \\textbf{[VOTRE NOM]}}\\\\
[2mm]
[Votre email] \\textbar{} [Votre téléphone]\\\\
[Votre adresse]
\\end{center}

\\vspace{5mm}

\\section*{Expérience Professionnelle}
\\textbf{[Titre du poste]} -- [Entreprise] \\hfill [Dates]\\\\
[Description des responsabilités]

\\vspace{3mm}

\\section*{Formation}
\\textbf{[Diplôme]} -- [École] \\hfill [Année]

\\vspace{3mm}

\\section*{Compétences}
\\begin{itemize}
\\item [Compétence 1]
\\item [Compétence 2]
\\item [Compétence 3]
\\end{itemize}

\\end{document}`,

            cover_letter: `\\documentclass[11pt,a4paper]{letter}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\begin{document}

\\begin{flushleft}
[Votre nom]\\\\
[Votre adresse]\\\\
[Téléphone]\\\\
[Email]
\\end{flushleft}

\\vspace{10mm}

\\begin{flushleft}
[Nom de l'entreprise]\\\\
[Adresse de l'entreprise]
\\end{flushleft}

\\vspace{10mm}

\\textbf{Objet :} Candidature pour le poste de [Titre du poste]

\\vspace{5mm}

Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste de [titre du poste] au sein de votre entreprise.

[Votre motivation et expérience]

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

\\vspace{10mm}

[Votre nom]

\\end{document}`
        };

        return templates[documentType] || templates.cv;
    }

    // Compiler LaTeX en PDF
    async compileToPDF(latexContent, filename) {
        const texFilename = `${filename}.tex`;
        const pdfFilename = `${filename}.pdf`;
        const texPath = path.join(this.storagePath, texFilename);
        const pdfPath = path.join(this.storagePath, pdfFilename);

        try {
            // Écrire le fichier LaTeX
            await fs.writeFile(texPath, latexContent, 'utf8');
            console.log('📝 Fichier LaTeX créé:', texPath);

            // Compiler avec pdflatex - 🔧 GESTION AMÉLIORÉE DES ERREURS
            console.log('🔧 Compilation LaTeX en cours...');
            
            let compilationResult;
            try {
                compilationResult = await execAsync(`cd "${this.storagePath}" && pdflatex -interaction=nonstopmode "${texFilename}"`, {
                    timeout: 30000
                });
                console.log('📤 LaTeX compilation stdout:', compilationResult.stdout);
            } catch (compileError) {
                // 🔧 NE PAS TRAITER COMME UNE ERREUR FATALE
                console.log('⚠️ LaTeX compilation warnings (normal):', compileError.stdout);
                if (compileError.stderr) {
                    console.log('⚠️ LaTeX stderr:', compileError.stderr);
                }
            }

            // Vérifier que le PDF existe (IMPORTANT: toujours vérifier même avec des warnings)
            const pdfExists = await fs.access(pdfPath).then(() => true).catch(() => false);
            console.log('🔍 Vérification PDF existence:', pdfExists ? '✅ EXISTS' : '❌ NOT FOUND');
            
            if (pdfExists) {
                console.log('✅ PDF généré avec succès:', pdfPath);
                
                // 🧹 Nettoyer les fichiers temporaires
                await this.cleanTempFiles(filename);
                
                return {
                    filename: pdfFilename,
                    path: pdfPath
                };
            } else {
                // 🔧 DIAGNOSTIC: Lister les fichiers pour debug
                try {
                    const files = await fs.readdir(this.storagePath);
                    const relatedFiles = files.filter(f => f.includes(filename.split('_')[1]) || f.includes(filename));
                    console.log('📁 Fichiers présents dans storage:', relatedFiles);
                } catch (listError) {
                    console.log('❌ Erreur lecture dossier:', listError.message);
                }
                
                throw new Error('Le fichier PDF n\'a pas été généré malgré la compilation');
            }

        } catch (error) {
            console.error('❌ Erreur compilation LaTeX:', error);
            throw new Error(`Compilation LaTeX: ${error.message}`);
        }
    }

    // méthode de nettoyage des fichiers temporaires
    async cleanTempFiles(filename) {
        const tempExtensions = ['.aux', '.log', '.fls', '.fdb_latexmk', '.synctex.gz', '.toc', '.out'];
        
        for (const ext of tempExtensions) {
            const tempFile = path.join(this.storagePath, `${filename}${ext}`);
            try {
                await fs.unlink(tempFile);
                console.log(`🗑️ Fichier temporaire supprimé: ${filename}${ext}`);
            } catch (error) {
                // Fichier n'existe pas, ignorer
            }
        }
    }

    // Templates prédéfinis disponibles
    getAvailableTemplates() {
        return [
            {
                id: 'moderne',
                name: 'Moderne',
                description: 'Design contemporain avec couleurs'
            },
            {
                id: 'classique',
                name: 'Classique', 
                description: 'Style traditionnel et sobre'
            },
            {
                id: 'simple',
                name: 'Simple',
                description: 'Template minimaliste et épuré'
            },
            {
                id: 'professionnel',
                name: 'Professionnel',
                description: 'Style corporate et élégant'
            }
        ];
    }
}

module.exports = new DocumentGeneratorService();