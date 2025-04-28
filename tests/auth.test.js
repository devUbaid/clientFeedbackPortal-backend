import request from "supertest"
import express from "express"
import { connectDB, closeDatabase, clearDatabase } from "../utils/testSetup.js"
import authRoutes from "../routes/auth.js"
import User from "../models/User.js"
import dotenv from "dotenv"

dotenv.config()

// Create express app for testing
const app = express()
app.use(express.json())
app.use("/api/auth", authRoutes)

// Setup and teardown
beforeAll(async () => await connectDB())
afterEach(async () => await clearDatabase())
afterAll(async () => await closeDatabase())

describe("Authentication API", () => {
  test("Should register a new user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    }

    const response = await request(app).post("/api/auth/register").send(userData)

    expect(response.statusCode).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.user).toHaveProperty("_id")
    expect(response.body.user.name).toBe(userData.name)
    expect(response.body.user.email).toBe(userData.email)
    expect(response.body.token).toBeDefined()

    // Verify user was created in database
    const user = await User.findOne({ email: userData.email })
    expect(user).toBeTruthy()
    expect(user.name).toBe(userData.name)
  })

  test("Should not register a user with existing email", async () => {
    // Create a user first
    await User.create({
      name: "Existing User",
      email: "existing@example.com",
      password: "password123",
    })

    // Try to register with the same email
    const response = await request(app).post("/api/auth/register").send({
      name: "New User",
      email: "existing@example.com",
      password: "newpassword",
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain("User already exists")
  })

  test("Should login a user with valid credentials", async () => {
    // Create a user
    const user = await User.create({
      name: "Login Test",
      email: "login@example.com",
      password: "password123",
    })

    // Login
    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    })

    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.user).toHaveProperty("_id")
    expect(response.body.token).toBeDefined()
  })

  test("Should not login with invalid credentials", async () => {
    // Create a user
    await User.create({
      name: "Invalid Login",
      email: "invalid@example.com",
      password: "password123",
    })

    // Try to login with wrong password
    const response = await request(app).post("/api/auth/login").send({
      email: "invalid@example.com",
      password: "wrongpassword",
    })

    expect(response.statusCode).toBe(401)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain("Invalid credentials")
  })
})
