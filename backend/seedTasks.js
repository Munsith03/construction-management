import dotenv from "dotenv";
import mongoose from "mongoose";
import Task from "./models/Task.js";
import Project from "./models/Project.js";
import User from "./models/User.js";

dotenv.config();

async function seedTasks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // Get the first user to use as created by and assignee
    const users = await User.find().limit(3);
    if (users.length === 0) {
      console.log("❌ No users found. Please create users first.");
      process.exit(1);
    }

    // Get all projects
    const projects = await Project.find();
    if (projects.length === 0) {
      console.log("❌ No projects found. Creating a sample project first.");

      // Create a sample project if none exists
      const newProject = new Project({
        name: "Sample Construction Project",
        description: "A demo construction project for testing",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        location: "123 Test Street",
        coordinates: { lat: 7.8731, lng: 80.7718 },
        budget: 5000000,
        status: "active",
        createdBy: users[0]._id,
      });

      await newProject.save();
      console.log("✅ Created sample project");
      projects.push(newProject);
    }

    // Clear existing tasks
    await Task.deleteMany({});
    console.log("🗑️ Cleared existing tasks");

    // Create sample tasks
    const taskStatuses = [
      "not_started",
      "in_progress",
      "on_hold",
      "completed",
      "cancelled",
    ];
    const priorities = ["low", "medium", "high", "critical"];
    const categories = [
      "construction",
      "inspection",
      "procurement",
      "planning",
      "safety",
    ];

    const sampleTasks = [
      {
        name: "Foundation Preparation",
        description: "Prepare the foundation for the main building structure",
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        location: "Main Building Site",
        coordinates: { lat: 7.8731, lng: 80.7718 },
        category: "construction",
        priority: "high",
        project: projects[0]._id,
        milestone: "Phase 1",
        status: "in_progress",
        assignees: [
          { user: users[0]._id, role: "lead" },
          {
            user: users.length > 1 ? users[1]._id : users[0]._id,
            role: "member",
          },
        ],
        estimatedHours: 160,
        quantityPlanned: { value: 250, unit: "m²" },
        checklist: [
          { item: "Site clearing completed", completed: true },
          { item: "Excavation work done", completed: true },
          { item: "Foundation reinforcement placed", completed: false },
        ],
        createdBy: users[0]._id,
      },
      {
        name: "Electrical Wiring Installation",
        description: "Install main electrical wiring for the first floor",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        location: "First Floor",
        category: "construction",
        priority: "medium",
        project: projects[0]._id,
        milestone: "Phase 2",
        status: "not_started",
        assignees: [
          {
            user: users.length > 1 ? users[1]._id : users[0]._id,
            role: "lead",
          },
        ],
        estimatedHours: 80,
        quantityPlanned: { value: 15, unit: "rooms" },
        checklist: [
          { item: "Conduit placement", completed: false },
          { item: "Cable pulling", completed: false },
          { item: "Fixture installation", completed: false },
        ],
        createdBy: users[0]._id,
      },
      {
        name: "Plumbing System Setup",
        description: "Install water supply and drainage systems",
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: "Entire Building",
        category: "construction",
        priority: "medium",
        project: projects[0]._id,
        status: "in_progress",
        assignees: [
          { user: users[0]._id, role: "member" },
          {
            user: users.length > 2 ? users[2]._id : users[0]._id,
            role: "reviewer",
          },
        ],
        estimatedHours: 120,
        quantityPlanned: { value: 35, unit: "fixtures" },
        checklist: [
          { item: "Main water line connected", completed: true },
          { item: "Drainage system installed", completed: false },
        ],
        createdBy: users[0]._id,
      },
      {
        name: "Structural Inspection",
        description: "Conduct inspection of the main structure",
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        location: "Main Building",
        category: "inspection",
        priority: "critical",
        project: projects[0]._id,
        status: "completed",
        assignees: [
          {
            user: users.length > 2 ? users[2]._id : users[0]._id,
            role: "lead",
          },
        ],
        estimatedHours: 8,
        checklist: [
          { item: "Foundation inspection", completed: true },
          { item: "Beam inspection", completed: true },
          { item: "Column inspection", completed: true },
          { item: "Report creation", completed: true },
        ],
        createdBy: users[0]._id,
      },
      {
        name: "Building Material Procurement",
        description: "Order and manage delivery of construction materials",
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        category: "procurement",
        priority: "high",
        project: projects[0]._id,
        status: "completed",
        assignees: [{ user: users[0]._id, role: "lead" }],
        estimatedHours: 40,
        quantityPlanned: { value: 1500, unit: "kg" },
        checklist: [
          { item: "Cement ordered", completed: true },
          { item: "Steel reinforcement delivered", completed: true },
          { item: "Sand delivered", completed: true },
        ],
        createdBy: users[0]._id,
      },
      {
        name: "Safety Training for Workers",
        description: "Conduct safety training session for site workers",
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Same day
        location: "Site Office",
        category: "safety",
        priority: "high",
        project: projects[0]._id,
        status: "not_started",
        assignees: [
          {
            user: users.length > 1 ? users[1]._id : users[0]._id,
            role: "lead",
          },
        ],
        estimatedHours: 4,
        checklist: [
          { item: "Prepare training materials", completed: false },
          { item: "Set up meeting room", completed: false },
          { item: "Document attendance", completed: false },
        ],
        createdBy: users[0]._id,
      },
      {
        name: "Window Installation",
        description: "Install windows on all floors",
        startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        location: "All Floors",
        category: "construction",
        priority: "medium",
        project: projects[0]._id,
        status: "on_hold",
        assignees: [
          { user: users[0]._id, role: "member" },
          {
            user: users.length > 1 ? users[1]._id : users[0]._id,
            role: "lead",
          },
        ],
        estimatedHours: 60,
        quantityPlanned: { value: 48, unit: "windows" },
        checklist: [
          { item: "Windows delivered to site", completed: false },
          { item: "Window frames installed", completed: false },
        ],
        createdBy: users[0]._id,
      },
    ];

    // Insert sample tasks
    await Task.insertMany(sampleTasks);
    console.log(`✅ Created ${sampleTasks.length} sample tasks`);

    // Generate a few more random tasks for variety
    const additionalTasks = [];
    for (let i = 0; i < 15; i++) {
      const startDate = new Date(
        Date.now() + (Math.random() * 60 - 30) * 24 * 60 * 60 * 1000
      );
      const endDate = new Date(
        startDate.getTime() + (Math.random() * 30 + 5) * 24 * 60 * 60 * 1000
      );

      additionalTasks.push({
        name: `Task ${i + 1}: ${
          [
            "Construction",
            "Planning",
            "Inspection",
            "Installation",
            "Review",
            "Preparation",
            "Finalization",
          ][Math.floor(Math.random() * 7)]
        }`,
        description: `This is an automatically generated task for testing purposes.`,
        startDate,
        endDate,
        location: [
          "Site A",
          "Building B",
          "Floor 1",
          "Floor 2",
          "Exterior",
          "Interior",
        ][Math.floor(Math.random() * 6)],
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        project: projects[0]._id,
        status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
        assignees: [
          {
            user: users[Math.floor(Math.random() * users.length)]._id,
            role: "member",
          },
        ],
        estimatedHours: Math.floor(Math.random() * 100) + 5,
        createdBy: users[0]._id,
      });
    }

    // Insert additional tasks
    await Task.insertMany(additionalTasks);
    console.log(`✅ Created ${additionalTasks.length} additional tasks`);

    console.log("🎉 Task seeding completed!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding tasks:", error);
  }
}

seedTasks();
