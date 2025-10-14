const cron = require('node-cron');
const alertProcessor = require('../services/alertProcessor');

// Traitement automatique toutes les 6 heures
const startAlertProcessing = () => {
    console.log('📅 Planification du traitement automatique des alertes');
    
    // Toutes les 6 heures
    cron.schedule('0 */6 * * *', async () => {
        console.log('🚀 Début du traitement automatique des alertes');
        try {
            const results = await alertProcessor.processAllAlerts();
            console.log(`✅ Traitement terminé: ${results.length} alertes traitées`);
        } catch (error) {
            console.error('❌ Erreur traitement automatique:', error);
        }
    });

    // Nettoyage quotidien à 2h du matin
    cron.schedule('0 2 * * *', async () => {
        console.log('🧹 Nettoyage des anciennes offres');
        try {
            // Le nettoyage est fait lors du processAlert pour chaque utilisateur
            console.log('✅ Nettoyage terminé');
        } catch (error) {
            console.error('❌ Erreur nettoyage:', error);
        }
    });
};

module.exports = { startAlertProcessing };