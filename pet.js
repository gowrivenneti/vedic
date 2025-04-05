const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  

const serviceAccount = require("./key.json");  
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public','index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname,'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public','register.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname,'public', 'cart.html')));

app.post("/register", async (req, res) => {
    try {
        console.log("📥 Received registration request:", req.body);

        const { fullname, email, password, confirmpassword } = req.body;

        if (!fullname || !email || !password || !confirmpassword) {
            return res.status(400).json({ message: "⚠️ All fields are required." });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({ message: "❌ Passwords do not match." });
        }


        const existingUser = await db.collection("users").where("email", "==", email).get();
        if (!existingUser.empty) {
            return res.status(400).json({ message: "❌ Email is already registered.Please login" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection("users").add({
            fullname,
            email,
            password 
        });

        res.json({ message: "🎉 Registration Successful!" });
        

    } catch (error) {
        console.error("🔥 Registration error:", error);
        res.status(500).json({ message: "⚠️ Internal Server Error." });
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and Password required" });

        const snapshot = await db.collection("users")
            .where("email", "==", email)
            .where("password", "==", password)
            .get();
        if (snapshot.empty) {
            return res.json({ message: 'Invalid email or password.' });
        }
    
        const userDoc = snapshot.docs[0];
        const user = userDoc.data();
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ message: 'Invalid email or password.' });
        }
    
        res.json({ message: `Welcome back, ${user.fullname}!` });

    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
