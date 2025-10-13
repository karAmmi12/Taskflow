const { PrismaClient} = require("@prisma/client");

const prisma = new PrismaClient();

// Récupérer toutes les tâches de l'utilisateur connecté

const getTasks = async (req, res) => {
    try
    {
        const { status, priority, search } = req.query; // query est un objet qui contient les paramètres de la requête 
    
        //Construire les filtres
        const filters = {
            userId : req.userId
        };
        
        if (status) {
            filters.status = status;
        }
        if (priority) {
            filters.priority = priority;
        }
        if (search) {
            filters.OR = [
                {title: { contains: search, mode: 'insensitive' }},
                {description: { contains: search, mode: 'insensitive' }}
            ];
        }

        const tasks = await prisma.task.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            tasks,
            count: tasks.length
        });

    }
    catch (error)
    {
        console.error("Erreur lors de la récupération des tâches :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des tâches" });

    }
}

const getTaskById = async (req, res) => {
    try
    {
        const { id } = req.params;

        const task = await prisma.task.findFirst({
            where : {
                id, 
                userId: req.userId
            }
        });
        if (!task) {
            return res.status(404).json({
                error : "Tache non trouvée"
            });
        }
        res.json({task});

    }
    catch (error)
    {
        console.error("Erreur lors de la récupération de la tâche :", error);
        res.status(500).json({ error: "Erreur lors de la récupération de la tâche" });
    }
}

const createTask = async (req, res) => {
    try
    {
        const { title, description, status, priority, tags, dueDate } = req.body;

        //validation
        if (!title || title.trim() === '')
        {
            return res.status(400).json({
                error : "le titre est requis"
            });
        }

        //validation du status
        const validStatuses = ['todo', 'in_progress', 'done'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                error: "Statut invalide. Les valeurs autorisées sont : 'todo', 'in_progress', 'done'."
            });
        }

        //validation de la priorité
        const validPriorities = ['low', 'medium', 'high'];
        if (priority && !validPriorities.includes(priority))
        {
            return res.status(400).json({
                error: "Priorité invalide. Les valeurs autorisées sont : 'low', 'medium', 'high'"
            });
        }

        const task = await prisma.task.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                status: status || 'todo',
                priority: priority || 'medium',
                tags: tags || [],
                dueDate: dueDate ? new Date(dueDate) : null,
                userId: req.userId
            }
        });

        res.status(201).json({
            message: 'Tâche créée avec succès',
            task
        });
    }
    catch (error)
    {
        console.error("Erreur lors de la création de la tâche :", error);
        res.status(500).json({ 
            error: "Erreur lors de la création de la tâche" 
        });
    }
};

// Mettre à jour une tache

const updateTask = async (req, res) => {
    try
    {
        const { id } = req.params;
        const { title, description, status, priority, tags, dueDate } = req.body;

        //verifier que la tache existe et appartient a l'utilisateur
        const existingTask = await prisma.task.findFirst({
            where : {
                id,
                userId: req.userId
            }
        });

        if (!existingTask)
        {
            return res.status(404).json({
                error: "Tache non trouvée"
            });
        }

        //validation du status
        const validStatuses = ['todo', 'in_progress', 'done']
        if (status && !validStatuses.includes(status))
        {
            return res.status(400).json({
                error: "Statut invalide. Les valeurs autorisées sont : 'todo', 'in_progress', 'done'."
            });
        }

        //validation de la priorité
        const validPriorities = ['low', 'medium', 'high'];
        if (priority && !validPriorities.includes(priority))
        {
            return res.status(400).json({
                error: "Priorité invalide. Les valeurs autorisées sont : 'low', 'medium', 'high'"
            });
        }

        //construire l'objet de mise a jour
        const updateData = {};
        if (title !== undefined)
            updateData.title = title.trim();
        if (description !== undefined)
            updateData.description = description?.trim() || null;
        if (status !== undefined)
            updateData.status = status;
        if (priority !== undefined)
            updateData.priority = priority;
        if (tags !== undefined)
            updateData.tags = tags;
        if (dueDate !== undefined)
            updateData.dueDate = dueDate ? new Date(dueDate) : null;

        const task = await prisma.task.update({
            where : {id},
            data: updateData
        });

        res.json({
            message: "Tâche mise à jour avec succès",
            task
        });
        
    }
    catch (error)
    {
        console.error("Erreur lors de la mise à jour de la tâche :", error);
        res.status(500).json({
            error: "Erreur lors de la mise à jour de la tâche"
        });
    }
}

// supprimer une tache
const deleteTask = async (req, res) => {
    try
    {
        const { id } = req.params;

        //verifier que la tache existe et appartient a l'utilisateur
        const existingTask = await prisma.task.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });
        
        if (!existingTask)
        {
            return res.status(404).json({
                error : "Tache non trouvée"
            });
        }

        await prisma.task.delete({
            where: { id }    
        });

        res.json({
            message : "Tache supprimée avec succès"
        })

    }
    catch (error)
    {
        console.error("Erreur lors de la suppression de la tâche :", error);
        return res.status(500).json({
            error : "Erreur lors de la suppression de la tâche"
        });
    }
};

    // Statistiques des tâches
const getTaskStats = async (req, res) => {
    try
    {
        const stats = await prisma.task.groupBy({
            by: ['status'],
            where: {
                userId: req.userId
            },
            _count: true
        });

        const formatedStats = {
            todo : 0,
            in_progress : 0,
            done : 0,
            total : 0,
        }
        stats.forEach(stat => {
            formatedStats[stat.status] = stat._count;
            formatedStats.total += stat._count;
        });
        res.json({ stats: formatedStats });
    }
    catch (error)
    {
        console.error("Erreur lors de la récupération des statistiques des tâches :", error);
        res.status(500).json({
            error: "Erreur lors de la récupération des statistiques des tâches"
        });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
};