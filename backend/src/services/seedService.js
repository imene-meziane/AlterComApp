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

async function syncSeedContent() {
  const userEmails = users.map(user => user.email);
  const workshopKeys = workshops.map(workshop => workshop.key);
  const categoryKeys = categories.map(category => category.key);
  const pictogramKeys = pictograms.map(pictogram => pictogram.key);
  const routineKeys = routines.map(routine => routine.key);

  const [existingUsers, existingWorkshops, existingCategories, existingPictograms, existingRoutines] =
    await Promise.all([
      User.find({ email: { $in: userEmails } }),
      Workshop.find({ key: { $in: workshopKeys } }),
      Category.find({ key: { $in: categoryKeys } }),
      Pictogram.find({ key: { $in: pictogramKeys } }),
      Routine.find({ key: { $in: routineKeys } }),
    ]);

  const usersByEmail = Object.fromEntries(existingUsers.map(user => [user.email, user]));
  const workshopsByKey = Object.fromEntries(
    existingWorkshops.map(workshop => [workshop.key, workshop])
  );
  const categoriesByKey = Object.fromEntries(
    existingCategories.map(category => [category.key, category])
  );
  const pictogramsByKey = Object.fromEntries(
    existingPictograms.map(pictogram => [pictogram.key, pictogram])
  );
  const routinesByKey = Object.fromEntries(existingRoutines.map(routine => [routine.key, routine]));

  for (const userData of users) {
    const user = usersByEmail[userData.email];
    if (!user) {
      continue;
    }

    user.supportNeeds = userData.supportNeeds || user.supportNeeds;
    await user.save();
  }

  for (const workshopData of workshops) {
    const workshop = workshopsByKey[workshopData.key];
    if (!workshop) {
      continue;
    }

    workshop.name = workshopData.name;
    workshop.description = workshopData.description;
    workshop.color = workshopData.color;
    workshop.icon = workshopData.icon;
    await workshop.save();
  }

  for (const categoryData of categories) {
    const category = categoriesByKey[categoryData.key];
    if (!category) {
      continue;
    }

    category.name = categoryData.name;
    category.prompt = categoryData.prompt;
    category.description = categoryData.description;
    category.color = categoryData.color;
    category.icon = categoryData.icon;
    category.order = categoryData.order;
    category.visibleFor = categoryData.visibleFor;
    await category.save();
  }

  const supervisor = usersByEmail['claire.martin@alterego.fr'];

  for (const pictogramData of pictograms) {
    const pictogram = pictogramsByKey[pictogramData.key];
    if (!pictogram) {
      continue;
    }

    pictogram.label = pictogramData.label;
    pictogram.phrase = pictogramData.phrase;
    pictogram.spokenText = pictogramData.spokenText;
    pictogram.builderText = pictogramData.builderText;
    pictogram.keywords = pictogramData.keywords || [];
    pictogram.category = categoriesByKey[pictogramData.categoryKey]?._id || pictogram.category;
    pictogram.workshops = (pictogramData.workshopKeys || [])
      .map(key => workshopsByKey[key]?._id)
      .filter(Boolean);
    pictogram.imageUrl = pictogramData.imageUrl;
    pictogram.color = pictogramData.color;
    pictogram.sourceLabel = pictogramData.sourceLabel || pictogram.sourceLabel;
    pictogram.showInSimplified = pictogramData.showInSimplified ?? pictogram.showInSimplified;
    pictogram.isActive = pictogramData.isActive ?? pictogram.isActive;

    if (supervisor && !pictogram.createdBy) {
      pictogram.createdBy = supervisor._id;
    }

    await pictogram.save();
  }

  for (const routineData of routines) {
    const routine = routinesByKey[routineData.key];
    if (!routine) {
      continue;
    }

    routine.title = routineData.title;
    routine.description = routineData.description;
    routine.workshop = routineData.workshopKey
      ? workshopsByKey[routineData.workshopKey]?._id || null
      : null;
    routine.category = categoriesByKey[routineData.categoryKey]?._id || routine.category;
    routine.estimatedMinutes = routineData.estimatedMinutes;
    routine.difficulty = routineData.difficulty;
    routine.supportText = routineData.supportText;
    routine.steps = (routineData.steps || []).map((step, index) => ({
      title: step.title,
      instruction: step.instruction,
      pictogram: step.pictogramKey ? pictogramsByKey[step.pictogramKey]?._id || null : null,
      audioText: step.instruction,
      order: index + 1
    }));
    await routine.save();
  }

  const demoUserIds = existingUsers.map(user => user._id);
  const [favoriteDocs, messageDocs, alertDocs] = await Promise.all([
    Favorite.find({ user: { $in: demoUserIds } }),
    Message.find({ worker: { $in: demoUserIds } }),
    Alert.find({ workerId: { $in: demoUserIds } })
  ]);

  for (const favoriteData of favorites) {
    const user = usersByEmail[favoriteData.userEmail];
    if (!user) {
      continue;
    }

    const linkedPictogram = favoriteData.pictogramKey
      ? pictogramsByKey[favoriteData.pictogramKey]
      : null;
    const linkedPhrasePictograms = (favoriteData.pictogramKeys || [])
      .map(key => pictogramsByKey[key]?._id)
      .filter(Boolean);

    const favorite = favoriteDocs.find(item => {
      if (item.user.toString() !== user._id.toString() || item.kind !== favoriteData.kind) {
        return false;
      }

      if (favoriteData.kind === 'pictogram' && linkedPictogram) {
        return item.pictogram?.toString() === linkedPictogram._id.toString();
      }

      return item.title === favoriteData.title || item.text === favoriteData.text;
    });

    if (!favorite) {
      continue;
    }

    favorite.title =
      favoriteData.title || linkedPictogram?.label || favorite.title;
    favorite.text =
      favoriteData.text || linkedPictogram?.phrase || favorite.text;
    favorite.imageUrl =
      linkedPictogram?.imageUrl ||
      pictogramsByKey[favoriteData.pictogramKeys?.[0]]?.imageUrl ||
      favorite.imageUrl;

    if (favoriteData.kind === 'phrase') {
      favorite.pictograms = linkedPhrasePictograms;
    }

    await favorite.save();
  }

  for (const messageData of messages) {
    const user = usersByEmail[messageData.workerEmail];
    if (!user) {
      continue;
    }

    const message = messageDocs.find(item => {
      return (
        item.worker.toString() === user._id.toString() &&
        item.channel === messageData.channel &&
        (item.text === messageData.text ||
          (messageData.pictogramKeys || []).every((key, index) => {
            const existingItem = item.items[index];
            const pictogram = pictogramsByKey[key];
            return (
              existingItem &&
              pictogram &&
              existingItem.pictogram?.toString() === pictogram._id.toString()
            );
          }))
      );
    });

    if (!message) {
      continue;
    }

    message.text = messageData.text;
    message.items = (messageData.pictogramKeys || []).map(key => ({
      pictogram: pictogramsByKey[key]?._id,
      label: pictogramsByKey[key]?.label || '',
      builderText: pictogramsByKey[key]?.builderText || '',
      imageUrl: pictogramsByKey[key]?.imageUrl || '',
      color: pictogramsByKey[key]?.color || '#88a9d5'
    }));
    await message.save();
    await History.updateMany({ message: message._id }, { text: message.text });
  }

  for (const alertData of alerts) {
    const user = usersByEmail[alertData.workerEmail];
    if (!user) {
      continue;
    }

    const alert = alertDocs.find(item => {
      return item.workerId.toString() === user._id.toString() && item.type === alertData.type;
    });

    if (!alert) {
      continue;
    }

    alert.message = alertData.message;
    await alert.save();
  }
}

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
    await syncSeedContent();
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
