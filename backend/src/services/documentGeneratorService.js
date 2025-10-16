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
        
        return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{geometry}
\\usepackage{xcolor}
\\usepackage{enumitem}
\\usepackage{titlesec}

\\geometry{margin=2cm}
\\definecolor{primary}{RGB}{30,58,138}
\\definecolor{secondary}{RGB}{100,116,139}

\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\color{primary}\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\begin{document}

\\begin{center}
{\\Huge\\bfseries\\color{primary} ${this.escapeLatex(user.name || 'Nom Prénom')}}\\\\[3mm]
{\\large ${this.escapeLatex(userProfile.summary || 'Professionnel motivé')}}\\\\[5mm]
\\color{secondary}
${this.escapeLatex(user.email || 'email@example.com')} ${userProfile.phone ? ` • ${this.escapeLatex(userProfile.phone)}` : ''} ${userProfile.address ? ` • ${this.escapeLatex(userProfile.address)}` : ''}
\\end{center}

\\vspace{8mm}

${experiences.length > 0 ? `
\\section{Expérience Professionnelle}
${experiences.slice(0, 5).map(exp => `
\\textbf{${this.escapeLatex(exp.title || 'Poste')}} -- \\textit{${this.escapeLatex(exp.company || 'Entreprise')}} \\hfill ${this.escapeLatex(exp.startDate || '')} - ${this.escapeLatex(exp.endDate || 'Présent')}\\\\[1mm]
${this.escapeLatex(exp.description || 'Description des responsabilités principales.')}\\\\[3mm]
`).join('')}
` : ''}

${education.length > 0 ? `
\\section{Formation}
${education.slice(0, 3).map(edu => `
\\textbf{${this.escapeLatex(edu.degree || 'Diplôme')}} -- \\textit{${this.escapeLatex(edu.institution || 'Institution')}} \\hfill ${this.escapeLatex(edu.year || '')}\\\\[2mm]
`).join('')}
` : ''}

${skills.length > 0 ? `
\\section{Compétences}
\\begin{itemize}[leftmargin=15pt, itemsep=1mm]
${skills.slice(0, 10).map(skill => `\\item ${this.escapeLatex(skill)}`).join('\n')}
\\end{itemize}
` : ''}

\\end{document}`;
    }

    generateCoverLetterTemplate(userProfile, jobOffer, options, aiContent) {
        const user = userProfile.user || {};
        
        // Utiliser le contenu IA ou un contenu par défaut
        const motivationContent = aiContent || 
            `Fort(e) de mon expérience et de mes compétences, je suis convaincu(e) que mon profil correspond parfaitement aux exigences du poste de ${jobOffer.title}. Je serais ravi(e) de pouvoir contribuer au succès de ${jobOffer.company} et d'apporter ma motivation à votre équipe dynamique.`;

        return `\\documentclass[11pt,a4paper]{letter}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\begin{document}

\\begin{flushleft}
${this.escapeLatex(user.name || 'Votre Nom')}\\\\
${this.escapeLatex(userProfile.address || 'Votre Adresse')}\\\\
${this.escapeLatex(userProfile.phone || 'Téléphone')}\\\\
${this.escapeLatex(user.email || 'Email')}
\\end{flushleft}

\\vspace{10mm}

\\begin{flushleft}
${this.escapeLatex(jobOffer.company)}\\\\
Service Ressources Humaines\\\\
${this.escapeLatex(jobOffer.location || '')}
\\end{flushleft}

\\vspace{10mm}

\\textbf{Objet :} Candidature pour le poste de ${this.escapeLatex(jobOffer.title)}

\\vspace{5mm}

Madame, Monsieur,

\\vspace{5mm}

${this.escapeLatex(motivationContent)}

\\vspace{5mm}

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

\\vspace{10mm}

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
            
            // Compiler en PDF
            const command = `pdflatex -interaction=nonstopmode -output-directory="${this.storagePath}" "${texFile}"`;
            await execAsync(command);
            
            // Vérifier que le PDF existe
            const pdfExists = await fs.access(pdfFile).then(() => true).catch(() => false);
            if (!pdfExists) {
                throw new Error('Le fichier PDF n\'a pas été généré');
            }
            
            // Nettoyer les fichiers temporaires
            await this.cleanTempFiles(filename);
            
            return {
                filename: `${filename}.pdf`,
                path: pdfFile
            };
        } catch (error) {
            await this.cleanTempFiles(filename);
            throw new Error(`Erreur compilation LaTeX: ${error.message}`);
        }
    }

    async cleanTempFiles(filename) {
        const extensions = ['.aux', '.log', '.tex', '.out', '.fls', '.fdb_latexmk'];
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