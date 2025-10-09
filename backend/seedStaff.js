import dotenv from "dotenv";
import mongoose from "mongoose";
import Staff from "./models/Staff.js";
import User from "./models/User.js";

dotenv.config();

async function seedStaff() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // Get users to link with staff
    const users = await User.find().limit(10);
    if (users.length === 0) {
      console.log("⚠️ No users found, but continuing anyway");
    }

    // Clear existing staff
    await Staff.deleteMany({});
    console.log("🗑️ Cleared existing staff");

    // Sample departments
    const departments = [
      "Engineering",
      "Construction",
      "Administration",
      "Project Management",
      "Architecture",
      "Safety",
      "Quality Control",
    ];

    // Sample positions by department
    const positions = {
      Engineering: [
        "Structural Engineer",
        "Civil Engineer",
        "Electrical Engineer",
        "Mechanical Engineer",
      ],
      Construction: [
        "Construction Manager",
        "Site Supervisor",
        "Carpenter",
        "Electrician",
        "Plumber",
        "Welder",
        "Mason",
      ],
      Administration: [
        "Administrator",
        "Accountant",
        "HR Manager",
        "Office Manager",
      ],
      "Project Management": [
        "Project Manager",
        "Project Coordinator",
        "Scheduler",
        "Cost Controller",
      ],
      Architecture: [
        "Architect",
        "Interior Designer",
        "CAD Technician",
        "Drafter",
      ],
      Safety: [
        "Safety Manager",
        "Safety Officer",
        "Safety Inspector",
        "Risk Assessor",
      ],
      "Quality Control": [
        "Quality Control Manager",
        "Inspector",
        "Materials Tester",
        "Document Controller",
      ],
    };

    // Sample skills by department
    const skills = {
      Engineering: [
        "Structural Analysis",
        "AutoCAD",
        "BIM",
        "Soil Mechanics",
        "Foundation Design",
        "HVAC Design",
      ],
      Construction: [
        "Framing",
        "Concrete Work",
        "Electrical Installation",
        "Plumbing",
        "Welding",
        "Masonry",
        "Heavy Equipment Operation",
      ],
      Administration: [
        "Accounting",
        "HR Management",
        "Documentation",
        "Office Software",
        "Communication",
      ],
      "Project Management": [
        "Scheduling",
        "Budgeting",
        "Resource Allocation",
        "Risk Management",
        "Stakeholder Management",
      ],
      Architecture: [
        "Building Design",
        "3D Modeling",
        "Revit",
        "AutoCAD",
        "Sketching",
        "Sustainable Design",
      ],
      Safety: [
        "OSHA Regulations",
        "Risk Assessment",
        "Safety Training",
        "Accident Investigation",
        "PPE Management",
      ],
      "Quality Control": [
        "Material Testing",
        "Quality Assurance",
        "Documentation",
        "Standards Compliance",
        "Inspection Methods",
      ],
    };

    // Sample staff data
    const sampleStaff = [
      {
        name: "John Doe",
        email: "john.doe@constructco.com",
        phone: "555-123-4567",
        department: "Engineering",
        position: "Civil Engineer",
        joinedDate: new Date(2020, 2, 15),
        skills: ["Structural Analysis", "AutoCAD", "Soil Mechanics"],
        isActive: true,
      },
      {
        name: "Jane Smith",
        email: "jane.smith@constructco.com",
        phone: "555-987-6543",
        department: "Project Management",
        position: "Project Manager",
        joinedDate: new Date(2019, 5, 10),
        skills: [
          "Scheduling",
          "Budgeting",
          "Risk Management",
          "Team Leadership",
        ],
        isActive: true,
      },
      {
        name: "Mike Johnson",
        email: "mike.johnson@constructco.com",
        phone: "555-456-7890",
        department: "Construction",
        position: "Site Supervisor",
        joinedDate: new Date(2018, 8, 22),
        skills: ["Concrete Work", "Blueprint Reading", "Team Coordination"],
        isActive: true,
      },
    ];

    // Insert sample staff
    await Staff.insertMany(sampleStaff);
    console.log(`✅ Created ${sampleStaff.length} sample staff members`);

    // Generate additional staff
    const additionalStaff = [];
    const firstNames = [
      "Robert",
      "Sarah",
      "Michael",
      "Emma",
      "David",
      "Lisa",
      "Thomas",
      "Jennifer",
      "Richard",
      "Emily",
      "William",
      "Rachel",
      "Joseph",
      "Amanda",
      "Charles",
      "Jessica",
      "Daniel",
      "Melissa",
      "Matthew",
      "Laura",
    ];
    const lastNames = [
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Wilson",
      "Anderson",
      "Taylor",
      "Thomas",
      "Hernandez",
      "Moore",
      "Martin",
      "Jackson",
      "Thompson",
      "White",
      "Lopez",
    ];
    const usedEmails = new Set(sampleStaff.map((staff) => staff.email));

    for (let i = 0; i < 27; i++) {
      let email;
      let name;
      let attempt = 0;
      const maxAttempts = 10;

      // Generate unique email
      do {
        const firstName =
          firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName =
          lastNames[Math.floor(Math.random() * lastNames.length)];
        name = `${firstName} ${lastName}`;
        email =
          attempt === 0
            ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@constructco.com`
            : `${firstName.toLowerCase()}.${lastName.toLowerCase()}${attempt}@constructco.com`;
        attempt++;
        if (attempt > maxAttempts) {
          console.warn(
            `⚠️ Could not generate unique email for ${name} after ${maxAttempts} attempts, skipping`
          );
          break;
        }
      } while (usedEmails.has(email));

      if (attempt > maxAttempts) continue; // Skip if no unique email found

      usedEmails.add(email);

      const department =
        departments[Math.floor(Math.random() * departments.length)];
      const positionsInDept = positions[department];
      const position =
        positionsInDept[Math.floor(Math.random() * positionsInDept.length)];

      const skillsInDept = skills[department];
      const staffSkills = [];
      const skillCount = Math.floor(Math.random() * 4) + 1; // 1-4 skills

      for (let j = 0; j < skillCount; j++) {
        const skill =
          skillsInDept[Math.floor(Math.random() * skillsInDept.length)];
        if (!staffSkills.includes(skill)) {
          staffSkills.push(skill);
        }
      }

      // Random joined date within the past 5 years
      const joinedDate = new Date();
      joinedDate.setFullYear(
        joinedDate.getFullYear() - Math.floor(Math.random() * 5)
      );
      joinedDate.setMonth(Math.floor(Math.random() * 12));
      joinedDate.setDate(Math.floor(Math.random() * 28) + 1);

      // Random phone number
      const areaCode = Math.floor(Math.random() * 900) + 100;
      const prefix = Math.floor(Math.random() * 900) + 100;
      const lineNum = Math.floor(Math.random() * 9000) + 1000;
      const phone = `${areaCode}-${prefix}-${lineNum}`;

      const staffMember = {
        name,
        email,
        phone,
        department,
        position,
        joinedDate,
        skills: staffSkills,
        isActive: Math.random() > 0.1, // 90% active
      };

      // Link to user if available
      if (users.length > 0 && i < users.length) {
        staffMember.userId = users[i]._id;
      }

      additionalStaff.push(staffMember);
    }

    // Insert additional staff with error handling for duplicates
    let insertedCount = 0;
    for (const staff of additionalStaff) {
      try {
        await Staff.create(staff);
        insertedCount++;
      } catch (err) {
        if (err.code === 11000) {
          console.warn(
            `⚠️ Skipping staff with duplicate email: ${staff.email}`
          );
        } else {
          console.error(`❌ Error inserting staff ${staff.name}:`, err.message);
        }
      }
    }
    console.log(`✅ Created ${insertedCount} additional staff members`);

    console.log("🎉 Staff seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding staff:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

seedStaff();
