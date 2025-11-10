import readline from "readline";
import { AuthSecure } from "./authsecure.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const AuthSecureApp = new AuthSecure({
  name: "XD", // App name
  ownerid: "3ezshCmkXrn", // Account ID
  secret: "7a8bfeb28afcd690812ee5de010a6860", // App secret
  version: "1.0", // App version
});

(async () => {
  await AuthSecureApp.Init();

  console.log("\n[1] Login\n[2] Register\n[3] License Login\n[4] Exit");
  rl.question("Choose option: ", async (choice) => {
    switch (choice) {
      case "1":
        rl.question("Username: ", (username) => {
          rl.question("Password: ", async (password) => {
            await AuthSecureApp.Login(username.trim(), password.trim());
            rl.close();
          });
        });
        break;

      case "2":
        rl.question("Username: ", (username) => {
          rl.question("Password: ", (password) => {
            rl.question("License: ", async (license) => {
              await AuthSecureApp.Register(
                username.trim(),
                password.trim(),
                license.trim()
              );
              rl.close();
            });
          });
        });
        break;

      case "3":
        rl.question("License: ", async (license) => {
          await AuthSecureApp.License(license.trim());
          rl.close();
        });
        break;

      default:
        console.log("Goodbye!");
        rl.close();
    }
  });
})();
