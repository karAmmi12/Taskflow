const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const aiService = require('./aiService');

const execAsync = promisify(exec);

class DocumentGeneratorService {
    constructor() {
        this.storageDir = process.env.DOCUMENTS_STORAGE_PATH || './storage/documents';
        this.storagePath = path.resolve(this.storageDir);
        
        this.ensureDirectoryExists();
        console.log('📄 Service de génération initialisé avec IA Hugging Face');
    }

    async ensureDirectoryExists() {
        try {
            await fsExtra.ensureDir(this.storagePath);
        } catch (error) {
            console.error('❌ Erreur création dossier documents:', error);
        }
    }

    async testAIConnection() {
        return await aiService.testConnection();
    }

    async generateCV(userProfile, options = {}) {
        try {
            console.log('📄 Génération CV...');
            
            const latexContent = this.generateCVTemplate(userProfile, options);
            const filename = `cv_${userProfile.id}_${Date.now()}`;
            
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

    async generateCoverLetter(userProfile, jobOffer, options = {}) {
        try {
            console.log('📝 Génération lettre de motivation...');
            
            let aiContent = null;
            let aiGenerated = false;

            // Tentative de génération avec IA si demandée et disponible
            if (options.useAI !== false && aiService.isEnabled) {
                console.log("SIUUUUUUUUUUUUUUUUUUUUUUUU")
                try {
                    aiContent = await aiService.generateCoverLetterContent(
                        userProfile,
                        jobOffer,
                        options.tone || 'professionnel'
                    );
                    aiGenerated = true;
                    console.log('✅ Contenu IA généré avec succès');
                } catch (error) {
                    console.log('⚠️ IA échouée, utilisation template:', error.message);
                    aiContent = null;
                }
            }

            const latexContent = this.generateCoverLetterTemplate(
                userProfile,
                jobOffer,
                options,
                aiContent
            );

            const filename = `lettre_${aiGenerated ? 'ia' : 'template'}_${userProfile.id}_${Date.now()}`;
            
            const result = await this.compileToPDF(latexContent, filename);

            return {
                success: true,
                filename: result.filename,
                path: result.path,
                latexSource: latexContent,
                aiGenerated
            };
        } catch (error) {
            console.error('❌ Erreur génération lettre:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    generateCVTemplate(userProfile, options) {
        const user = userProfile.user || {};
        const { experiences = [], education = [], skills = [] } = userProfile;
        
        // Template LaTeX ULTRA-MINIMAL sans packages problématiques
        return `\\documentclass[11pt,a4paper]{article}
    \\usepackage[utf8]{inputenc}
    \\usepackage[margin=2cm]{geometry}

    \\begin{document}

    % En-tête
    \\begin{center}
    \\textbf{\\Large ${this.escapeLatex(user.name || 'Nom Prénom')}}

    \\vspace{2mm}
    ${this.escapeLatex(userProfile.summary || 'Professionnel motivé')}

    \\vspace{2mm}
    ${this.escapeLatex(user.email || 'email@example.com')} ${userProfile.phone ? ` - ${this.escapeLatex(userProfile.phone)}` : ''} ${userProfile.address ? ` - ${this.escapeLatex(userProfile.address)}` : ''}
    \\end{center}

    \\vspace{5mm}

    ${experiences.length > 0 ? `
    \\textbf{Expérience Professionnelle}

    \\vspace{2mm}
    ${experiences.slice(0, 5).map(exp => `
    \\textbf{${this.escapeLatex(exp.title || 'Poste')}} - ${this.escapeLatex(exp.company || 'Entreprise')} (${this.escapeLatex(exp.startDate || '')} - ${this.escapeLatex(exp.endDate || 'Présent')})

    ${this.escapeLatex(exp.description || 'Description des responsabilités principales.')}

    \\vspace{3mm}
    `).join('')}
    ` : ''}

    ${education.length > 0 ? `
    \\textbf{Formation}

    \\vspace{2mm}
    ${education.slice(0, 3).map(edu => `
    \\textbf{${this.escapeLatex(edu.degree || 'Diplôme')}} - ${this.escapeLatex(edu.institution || 'Institution')} (${this.escapeLatex(edu.year || '')})

    \\vspace{2mm}
    `).join('')}
    ` : ''}

    ${skills.length > 0 ? `
    \\textbf{Compétences}

    \\vspace{2mm}
    ${skills.slice(0, 10).map((skill, index) => 
        `${this.escapeLatex(skill)}${index < Math.min(skills.length - 1, 9) ? ' - ' : ''}`
    ).join('')}
    ` : ''}

    \\end{document}`;
    }
    
generateCoverLetterTemplate(userProfile, jobOffer, options, aiContent) {
    const user = userProfile.user || {};
    
    const motivationContent = aiContent || 
        `Fort(e) de mon expérience et de mes compétences, je suis convaincu(e) que mon profil correspond parfaitement aux exigences du poste de ${jobOffer.title}. Je serais ravi(e) de pouvoir contribuer au succès de ${jobOffer.company} et d'apporter ma motivation à votre équipe dynamique.`;

    // Template LaTeX minimaliste compatible
    return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=2.5cm]{geometry}
\\pagestyle{empty}

\\begin{document}

\\textbf{${this.escapeLatex(user.name || 'Votre Nom')}}\\\\
${this.escapeLatex(userProfile.address || 'Votre Adresse')}\\\\
${this.escapeLatex(userProfile.phone || 'Téléphone')}\\\\
${this.escapeLatex(user.email || 'Email')}

\\vspace{1cm}

\\textbf{${this.escapeLatex(jobOffer.company)}}\\\\
Service Ressources Humaines

\\vspace{1cm}

\\textbf{Objet :} Candidature pour le poste de ${this.escapeLatex(jobOffer.title)}

\\vspace{0.5cm}

Madame, Monsieur,

\\vspace{0.5cm}

${this.escapeLatex(motivationContent)}

\\vspace{0.5cm}

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

\\vspace{1cm}

${this.escapeLatex(user.name || 'Votre Nom')}

\\end{document}`;
    }
    escapeLatex(text) {
        if (!text) return '';
        return text.toString()
            .replace(/\\/g, '\\textbackslash{}')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\$/g, '\\$')
            .replace(/&/g, '\\&')
            .replace(/%/g, '\\%')
            .replace(/#/g, '\\#')
            .replace(/\^/g, '\\textasciicircum{}')
            .replace(/_/g, '\\_')
            .replace(/~/g, '\\textasciitilde{}')
            .replace(/'/g, "'");
    }

    async compileToPDF(latexContent, filename) {
        const tempDir = path.join(this.storagePath, 'temp');
        await fsExtra.ensureDir(tempDir);
        
        const texFile = path.join(tempDir, `${filename}.tex`);
        const pdfFile = path.join(this.storagePath, `${filename}.pdf`);
        
        try {
            // Écrire le fichier LaTeX
            await fs.writeFile(texFile, latexContent, 'utf8');
            console.log(`📝 Fichier LaTeX créé: ${texFile}`);
            
            // Variables d'environnement LaTeX minimales
            const env = {
                ...process.env,
                TEXMFCACHE: '/app/texmf-cache',
                PATH: process.env.PATH
            };
            
            // Une seule commande simple et fiable
            const command = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory="${this.storagePath}" "${texFile}"`;
            
            console.log(`🔄 Compilation LaTeX: ${command}`);
            
            try {
                const result = await execAsync(command, { 
                    timeout: 60000, // 60 secondes
                    env,
                    cwd: this.storagePath
                });
                
                console.log(`📋 Sortie LaTeX: ${result.stdout?.substring(0, 200)}...`);
                
                // Vérifier que le PDF existe et n'est pas vide
                const pdfExists = await fs.access(pdfFile).then(() => true).catch(() => false);
                if (pdfExists) {
                    const stats = await fs.stat(pdfFile);
                    if (stats.size > 500) { // PDF doit faire au moins 500 bytes
                        console.log(`✅ PDF généré avec succès (${Math.round(stats.size/1024)}KB)`);
                        await this.cleanTempFiles(filename);
                        return {
                            filename: `${filename}.pdf`,
                            path: pdfFile
                        };
                    } else {
                        throw new Error(`PDF généré trop petit (${stats.size} bytes)`);
                    }
                } else {
                    throw new Error('Fichier PDF non créé');
                }
                
            } catch (compilationError) {
                console.error(`❌ Erreur compilation: ${compilationError.message}`);
                
                // Essayer de lire les logs pour plus d'infos
                try {
                    const logFile = path.join(this.storagePath, `${filename}.log`);
                    const logExists = await fs.access(logFile).then(() => true).catch(() => false);
                    if (logExists) {
                        const logContent = await fs.readFile(logFile, 'utf8');
                        const errorLines = logContent.split('\n').filter(line => 
                            line.includes('Error') || line.includes('Emergency stop') || line.includes('!')
                        ).slice(0, 3);
                        
                        console.log('📋 Erreurs LaTeX détectées:');
                        errorLines.forEach(line => console.log(`   ${line}`));
                    }
                } catch (logError) {
                    console.log('⚠️ Impossible de lire le log LaTeX');
                }
                
                throw new Error(`Compilation LaTeX échouée: ${compilationError.message}`);
            }
            
        } catch (error) {
            await this.cleanTempFiles(filename);
            throw new Error(`Erreur génération PDF: ${error.message}`);
        }
    }

    async cleanTempFiles(filename) {
        const extensions = ['.aux', '.log', '.tex', '.out', '.fls', '.fdb_latexmk', '.dvi', '.synctex.gz'];
        
        // Nettoyer dans le dossier principal
        for (const ext of extensions) {
            try {
                const file = path.join(this.storagePath, `${filename}${ext}`);
                await fs.unlink(file);
            } catch (error) {
                // Ignorer les erreurs de nettoyage
            }
        }
        
        // Nettoyer le dossier temp
        try {
            const tempDir = path.join(this.storagePath, 'temp');
            await fsExtra.remove(tempDir);
        } catch (error) {
            // Ignorer
        }
        
        // Nettoyer les fichiers de polices problématiques
        try {
            const fontFiles = ['*.600gf', '*.tfm', '*.pk', 'missfont.log'];
            for (const pattern of fontFiles) {
                const files = await fsExtra.glob(path.join(this.storagePath, pattern));
                for (const file of files) {
                    await fs.unlink(file).catch(() => {});
                }
            }
        } catch (error) {
            // Ignorer
        }
    }

    getAvailableTemplates() {
        return [
            { id: 'modern', name: 'Moderne', description: 'Design contemporain avec couleurs' },
            { id: 'classic', name: 'Classique', description: 'Style traditionnel et sobre' },
            { id: 'minimal', name: 'Minimal', description: 'Template épuré et élégant' }
        ];
    }
}

module.exports = new DocumentGeneratorService();