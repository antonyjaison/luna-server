import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fileUpload from "express-fileupload";

// routes
import assistanceRoute from "./routes/assistance/index.js";
import commandRoute from "./routes/command/index.js";
import authRoute from "./routes/auth/index.js";
import { uploadRouter } from "./routes/upload/index.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "fallback_secret_change_in_production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: process.env.NODE_ENV === "production",
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done) => {
      console.log("refreshToken", refreshToken);

      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;

      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    accessToken: user.accessToken,
    image: user.picture,
  });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/me", (req, res) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});
app.use("/chat", assistanceRoute);
app.use("/command", commandRoute);

app.use("/upload", uploadRouter);

app.get("/login", (req, res) => {
  res.send(`<a href="/auth/google">Login with google</a>`);
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile", "https://www.googleapis.com/auth/gmail.send"],
    accessType: "offline",
    prompt: "consent",
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  }
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
