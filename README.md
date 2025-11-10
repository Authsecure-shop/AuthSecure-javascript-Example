

---

# ⚡ AuthSecure JavaScript Example

> A full **Node.js (JavaScript)** example showing how to integrate and secure your application
> using the **AuthSecure API**. Includes ready-to-use **Init**, **Login**, **Register**, and **License Login** features. ✅

---

## 🚀 Features

✅ AuthSecure API Integration (Init / Login / Register / License Login)
✅ Works with Windows, Linux, macOS
✅ Uses HTTPS via Axios
✅ Fetches Windows HWID automatically (via PowerShell)
✅ Clean, modular JavaScript (ESM) structure
✅ No TypeScript setup required

---

## 📁 Project Structure

```
authsecure_js/
│
├── package.json
└── src/
    ├── authsecure.js
    └── main.js
```

---

## ⚙️ Setup Guide

### 🧱 Step 1 — Install Node.js

If you don’t already have Node.js, download and install it from:
👉 [https://nodejs.org/en/download](https://nodejs.org/en/download)

Then verify installation:

```bash
node -v
npm -v
```

---

### 🧰 Step 2 — Initialize Your Project

Create a folder and set up the project:

```bash
mkdir authsecure_js && cd authsecure_js
npm init -y
npm install axios
```

---

### ⚙️ Step 3 — Update `package.json`

Edit your `package.json` to look like this 👇

```json
{
  "name": "authsecure_js",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/main.js"
  },
  "dependencies": {
    "axios": "^1.7.7"
  }
}
```

---

## 💻 Source Code

### 🧩 `src/authsecure.js`

This class handles all AuthSecure API communication 👇

```js
import axios from "axios";
import { execSync } from "child_process";

export class AuthSecure {
  constructor(config) {
    this.name = config.name;
    this.ownerid = config.ownerid;
    this.secret = config.secret;
    this.version = config.version;
    this.sessionid = null;
    this.BASE_URL = "https://authsecure.shop/post/api.php";
  }

  async sendRequest(payload) {
    try {
      const params = new URLSearchParams(payload);
      const response = await axios.post(this.BASE_URL, params);
      return response.data;
    } catch (err) {
      console.error("❌ HTTP Error:", err.message);
      process.exit(1);
    }
  }

  getHWID() {
    try {
      const output = execSync(
        `powershell -Command "[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value"`,
        { encoding: "utf8" }
      ).trim();
      return output || "UNKNOWN_HWID";
    } catch {
      return "UNKNOWN_HWID";
    }
  }

  async Init() {
    console.log("Connecting...");
    const resp = await this.sendRequest({
      type: "init",
      name: this.name,
      ownerid: this.ownerid,
      secret: this.secret,
      ver: this.version,
    });

    if (resp.success) {
      this.sessionid = resp.sessionid;
      console.log("✅ Initialized Successfully!");
    } else {
      console.log("❌ Init Failed:", resp.message || "Unknown error");
      process.exit(1);
    }
  }

  async Login(username, password) {
    const resp = await this.sendRequest({
      type: "login",
      sessionid: this.sessionid,
      username,
      pass: password,
      hwid: this.getHWID(),
      name: this.name,
      ownerid: this.ownerid,
    });

    if (resp.success) {
      console.log("✅ Logged in!");
      this.printUserInfo(resp.info);
    } else {
      console.log("❌ Login Failed:", resp.message || "Unknown error");
    }
  }

  async Register(username, password, license) {
    const resp = await this.sendRequest({
      type: "register",
      sessionid: this.sessionid,
      username,
      pass: password,
      license,
      hwid: this.getHWID(),
      name: this.name,
      ownerid: this.ownerid,
    });

    if (resp.success) {
      console.log("✅ Registered Successfully!");
      this.printUserInfo(resp.info);
    } else {
      console.log("❌ Register Failed:", resp.message || "Unknown error");
    }
  }

  async License(license) {
    const resp = await this.sendRequest({
      type: "license",
      sessionid: this.sessionid,
      license,
      hwid: this.getHWID(),
      name: this.name,
      ownerid: this.ownerid,
    });

    if (resp.success) {
      console.log("✅ License Login Successful!");
      this.printUserInfo(resp.info);
    } else {
      console.log("❌ License Login Failed:", resp.message || "Unknown error");
    }
  }

  printUserInfo(info) {
    console.log("\n👤 User Info:");
    console.log(" Username:", info.username);
    console.log(" HWID:", info.hwid);
    console.log(" IP:", info.ip);
    if (info.subscriptions) {
      console.log(" Subscriptions:");
      for (const sub of info.subscriptions) {
        console.log(`  - ${sub.subscription} | Expires: ${sub.expiry}`);
      }
    }
  }
}
```

---

### 🧩 `src/main.js`

This file handles user interaction (login/register/license) through the CLI 👇

```js
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
```

---

## 🧮 Run the App

```bash
npm start
```

---

## 🖥️ Example Output

```
Connecting...
✅ Initialized Successfully!

[1] Login
[2] Register
[3] License Login
[4] Exit
Choose option: 1
Username: lufy
Password: 12345
✅ Logged in!

👤 User Info:
 Username: lufy
 HWID: S-1-5-21-3116590451-4259102588-3214189088-1001
 IP: 2a09:bac5:3c0b:1a96::2a6:65
 Subscriptions:
  - default | Expires: 1762788300
```

---

## 🧠 Highlights

| Feature              | Description                                    |
| -------------------- | ---------------------------------------------- |
| 🔒 HTTPS API         | Secure communication using Axios               |
| 💻 HWID              | Automatically generated via Windows PowerShell |
| 🧱 JavaScript        | Clean, easy-to-read structure                  |
| 🔧 Integration Ready | Works in apps, tools, or games                 |

---

## 🪪 License

**MIT License © 2025 — Created with ❤️ by Lufy**

---


