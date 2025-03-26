import { Router } from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import dotenv from "dotenv";
import crypto from "crypto";
import prisma from "../../config/prismaClient.js";

dotenv.config();

const router = Router();

router.use(
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

router.use(passport.initialize());
router.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: process.env.NODE_ENV === "production",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.email,
              displayName: profile.displayName,
              picture: profile.picture,
              refreshToken,
            },
          });
        }

        console.log("User:", req.user);

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )

  
);

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    image: user.picture,
    refreshToken: user.refreshToken,
  });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.get("/login", (req, res) => {
  res.send(`<a href="/auth/google">Login with Google</a>`);
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile", "https://www.googleapis.com/auth/gmail.send"],
    accessType: "offline",
    prompt: "consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  }
);

export default router;
