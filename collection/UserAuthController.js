const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserLogin = require("../schema/UserLogin");
const secretKey = "ghjik567ujisdhyui567ujh56yuhnjl";
const Register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await UserLogin.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserLogin({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

const Login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserLogin.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign({ username: user.username }, secretKey);
    const refreshToken = jwt.sign({ username: user.username }, secretKey);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

const TokenVerification = (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
};

module.exports = { Register, Login, TokenVerification };
