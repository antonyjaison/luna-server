import { Router } from "express";

const router = Router();

router.get("/login", (req, res) => {
  res.send(`<a href="auth/google">Login with google</a>`);
});

export default router;
