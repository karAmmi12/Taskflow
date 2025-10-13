const express = require('express');
const {
    getTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask,
        getTaskStats
} = require('../controllers/taskController');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// toutes les routes necessitent une authentification
router.use(authMiddleware);


router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;