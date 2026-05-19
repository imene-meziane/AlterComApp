const Alert = require('../models/Alert');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');
const History = require('../models/History');
const Message = require('../models/Message');
const Pictogram = require('../models/Pictogram');
const Routine = require('../models/Routine');
const User = require('../models/User');
const Workshop = require('../models/Workshop');
const {
  alerts,
  categories,
  favorites,
  messages,
  pictograms,
  routines,
  users,
  workshops
} = require('../data/seedData');

async function seedDatabase(options = {}) {
  const { reset = false } = options;

  if (reset) {
    await Promise.all([
      Alert.deleteMany({}),
      History.deleteMany({}),
      Message.deleteMany({}),
      Favorite.deleteMany({}),
      Routine.deleteMany({}),
      Pictogram.deleteMany({}),
      Workshop.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({})
    ]);
  }

  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    return {
      seeded: false,
      reason: 'already-populated'
    };
  }

  const createdWorkshops = {};
  for (const workshopData of workshops) {
    const workshop = await Workshop.create(workshopData);
    createdWorkshops[workshop.key] = workshop;
  }

  const createdUsers = {};
  for (const userData of users) {
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      email: userData.email,
      password: userData.password,
      avatar: userData.avatar,
      simplificationLevel: userData.simplificationLevel,
      supportNeeds: userData.supportNeeds || [],
      preferences: userData.preferences,
      assignedWorkshop: userData.assignedWorkshopKey
        ? createdWorkshops[userData.assignedWorkshopKey]?._id
        : null
    });
    createdUsers[user.email] = user;
  }

  const createdCategories = {};
  for (const categoryData of categories) {
    const category = await Category.create(categoryData);
    createdCategories[category.key] = category;
  }

  const supervisor = createdUsers['claire.martin@alterego.fr'];
  const createdPictograms = {};

  for (const pictogramData of pictograms) {
    const pictogram = await Pictogram.create({
      key: pictogramData.key,
      label: pictogramData.label,
      phrase: pictogramData.phrase,
      spokenText: pictogramData.spokenText,
      builderText: pictogramData.builderText,
      keywords: pictogramData.keywords || [],
      category: createdCategories[pictogramData.categoryKey]._id,
      workshops: (pictogramData.workshopKeys || [])
        .map(key => createdWorkshops[key]?._id)
        .filter(Boolean),
      imageUrl: pictogramData.imageUrl,
      color: pictogramData.color,
      sourceLabel: pictogramData.sourceLabel,
      showInSimplified: pictogramData.showInSimplified ?? true,
      isActive: pictogramData.isActive ?? true,
      createdBy: supervisor._id
    });
    createdPictograms[pictogram.key] = pictogram;
  }

  const createdRoutines = {};
  for (const routineData of routines) {
    const routine = await Routine.create({
      key: routineData.key,
      title: routineData.title,
      description: routineData.description,
      workshop: routineData.workshopKey
        ? createdWorkshops[routineData.workshopKey]?._id
        : null,
      category: createdCategories[routineData.categoryKey]._id,
      steps: (routineData.steps || []).map((step, index) => ({
        title: step.title,
        instruction: step.instruction,
        pictogram: step.pictogramKey ? createdPictograms[step.pictogramKey]?._id : null,
        audioText: step.instruction,
        order: index + 1
      })),
      assignedTo: (routineData.assignedWorkerEmails || [])
        .map(email => createdUsers[email]?._id)
        .filter(Boolean),
      estimatedMinutes: routineData.estimatedMinutes,
      difficulty: routineData.difficulty,
      supportText: routineData.supportText,
      isActive: true,
      createdBy: supervisor._id
    });

    createdRoutines[routine.key] = routine;

    for (const workerEmail of routineData.assignedWorkerEmails || []) {
      const worker = createdUsers[workerEmail];

      if (!worker) {
        continue;
      }

      worker.routineAssignments = [
        ...(worker.routineAssignments || []),
        {
          routine: routine._id,
          status: 'assigned',
          currentStepIndex: 0,
          completedStepIndexes: [],
          lastStartedAt: null,
          lastCompletedAt: null
        }
      ];
      await worker.save();
    }
  }

  for (const favoriteData of favorites) {
    await Favorite.create({
      user: createdUsers[favoriteData.userEmail]._id,
      kind: favoriteData.kind,
      pictogram: favoriteData.pictogramKey
        ? createdPictograms[favoriteData.pictogramKey]._id
        : null,
      pictograms: (favoriteData.pictogramKeys || [])
        .map(key => createdPictograms[key]?._id)
        .filter(Boolean),
      title:
        favoriteData.title ||
        createdPictograms[favoriteData.pictogramKey]?.label ||
        'Favori',
      text:
        favoriteData.text ||
        createdPictograms[favoriteData.pictogramKey]?.phrase ||
        '',
      imageUrl:
        createdPictograms[favoriteData.pictogramKey]?.imageUrl ||
        createdPictograms[favoriteData.pictogramKeys?.[0]]?.imageUrl ||
        ''
    });
  }

  for (const messageData of messages) {
    const message = await Message.create({
      worker: createdUsers[messageData.workerEmail]._id,
      workshop: messageData.workshopKey
        ? createdWorkshops[messageData.workshopKey]._id
        : null,
      items: (messageData.pictogramKeys || []).map(key => ({
        pictogram: createdPictograms[key]._id,
        label: createdPictograms[key].label,
        builderText: createdPictograms[key].builderText,
        imageUrl: createdPictograms[key].imageUrl,
        color: createdPictograms[key].color
      })),
      text: messageData.text,
      channel: messageData.channel,
      speechRate: 0.95,
      speechVolume: 1
    });

    await History.create({
      worker: createdUsers[messageData.workerEmail]._id,
      workshop: messageData.workshopKey
        ? createdWorkshops[messageData.workshopKey]._id
        : null,
      message: message._id,
      text: messageData.text,
      channel: messageData.channel
    });
  }

  for (const alertData of alerts) {
    await Alert.create({
      workerId: createdUsers[alertData.workerEmail]._id,
      type: alertData.type,
      priority: alertData.priority,
      message: alertData.message,
      status: alertData.status
    });
  }

  return {
    seeded: true,
    counts: {
      users: users.length,
      categories: categories.length,
      pictograms: pictograms.length,
      workshops: workshops.length,
      routines: routines.length,
      favorites: favorites.length,
      messages: messages.length,
      alerts: alerts.length
    }
  };
}

module.exports = {
  seedDatabase
};
