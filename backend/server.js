require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

//instantiate routes
const authRoutes = require("./routes/auth")
const figmaRoutes = require("./routes/figma")
const itemRoutes = require("./routes/items")
const teamRoutes = require("./routes/teams")
const projectRoutes = require("./routes/projects")

const app = express()
const PORT = 5001

app.use(cors({origin: "http://localhost:3000"})) // allow requests from localhost:3000
// app.use(cors()); // allow everyone
app.use(express.json())

// database connection
const uri = process.env.MONGO_URI

const clientOptions = {
  serverApi: {version: "1", strict: true, deprecationErrors: true},
}

async function connectDB() {
  try {
    await mongoose.connect(uri, clientOptions)

    // optional: the "Ping" command just confirms everything is working
    await mongoose.connection.db.admin().command({ping: 1})
    console.log("✅ Pinged the db. You successfully connected to MongoDB!")
  } catch (err) {
    console.error("❌ Connection failed:", err)
    // If the DB is down, we might want to stop the server
    // process.exit(1);
  }
}

// execute the connection function
connectDB()

// routes
app.use("/api/auth", authRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/figma", figmaRoutes)
app.use("/api/teams", teamRoutes)
app.use("/api/projects", projectRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
