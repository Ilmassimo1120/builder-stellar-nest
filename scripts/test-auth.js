// Test authentication system
console.log("🧪 Testing ChargeSource authentication system...");

// Test data
const testCredentials = [
  {
    email: "admin@chargesource.com.au",
    password: "password",
    expectedRole: "admin",
    description: "Admin login",
  },
  {
    email: "globaladmin@chargesource.com.au",
    password: "password",
    expectedRole: "global_admin",
    description: "Global admin login",
  },
  {
    email: "sales@chargesource.com.au",
    password: "password",
    expectedRole: "sales",
    description: "Sales login",
  },
  {
    email: "user@demo.com",
    password: "password",
    expectedRole: "user",
    description: "Regular user login",
  },
];

console.log("✅ Demo credentials available:");
testCredentials.forEach((cred) => {
  console.log(`   📧 ${cred.email} → ${cred.expectedRole} role`);
});

console.log("\n🔗 To test manually:");
console.log("1. Go to /login");
console.log("2. Use any of the emails above with any password");
console.log("3. Different email patterns will assign different roles");

console.log("\n📊 Available demo users:");
console.log("• admin@chargesource.com.au (Admin access)");
console.log("• globaladmin@chargesource.com.au (Global Admin)");
console.log("• sales@chargesource.com.au (Sales role)");
console.log("• partner@company.com (Partner role)");
console.log("• any@email.com (User role)");
