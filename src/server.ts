import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const port = 4000;

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({ include: { posts: true } });
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: { posts: true },
  });
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ error: "user not found" });
  }
});

app.get("/posts", async (req, res) => {
  const posts = await prisma.post.findMany({
    include: { user: true, likes: true, comments: { include: { user: true } } },
  });
  res.send(posts);
});

app.get("/posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({
    where: { id: id },
    include: { user: true, likes: true, comments: { include: { user: true } } },
  });
  if (post) {
    res.send(post);
  } else {
    res.status(404).send({ error: "post not found." });
  }
});

app.post("/posts", async (req, res) => {
  await prisma.post.create({ data: req.body });
  const posts = await prisma.post.findMany({
    include: { user: true, likes: true, comments: { include: { user: true } } },
  });
  res.send(posts);
});

app.post("/likes", async (req, res) => {
  const likes = await prisma.like.create({ data: req.body });
  const post = await prisma.post.findUnique({
    where: { id: likes.postId },
    include: { user: true, likes: true, comments: { include: { user: true } } },
  });
  res.send(post);
});

app.post("/comments", async (req, res) => {
  const comment = await prisma.comment.create({
    data: req.body,
    include: { user: true },
  });
  const post = await prisma.post.findUnique({
    where: { id: comment.postId },
    include: { user: true, likes: true, comments: { include: { user: true } } },
  });
  res.send(post);
});

app.listen(port, () => {
  console.log(`port: http://localhost:${port}`);
});
