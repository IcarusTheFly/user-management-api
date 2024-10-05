import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import fastifyMultipart from "@fastify/multipart";
import supertest from "supertest";
import { userRoutes } from "../../modules/users/users.routes";

// Mock controllers
jest.mock("../../modules/users/users.controllers", () => ({
  getAllUsersController: jest.fn((req, reply) => reply.send({ data: [] })),
  createUserController: jest.fn((req, reply) => {
    return reply.status(201).send({
      data: {
        id: 1,
        password: undefined,
        avatar: "",
        createdAt: "2024-10-03T03:50:01.543Z",
        ...req.body,
      },
    });
  }),
  uploadUserAvatarController: jest.fn((req, reply) => {
    return reply
      .status(200)
      .send({ data: { avatarFileName: "1-test-avatar.jpg" } });
  }),
  getUserController: jest.fn((req, reply) =>
    reply.send({
      data: {
        id: Number(req.params.id),
        email: "new@user.com",
        name: "Test User",
        isAdmin: true,
        avatar: "",
        createdAt: "2024-10-03T03:50:01.543Z",
      },
    })
  ),
  updateUserController: jest.fn((req, reply) =>
    reply
      .status(200)
      .send({ data: { id: Number(req.params.id), email: req.body.email } })
  ),
  deleteUserController: jest.fn((req, reply) => reply.status(204).send()),
}));

// Mock controlRoleBasedAccess middleware
jest.mock("../../middleware/controlRoleBasedAccess", () => ({
  controlRoleBasedAccess: jest.fn(
    () =>
      (
        req: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction
      ) =>
        done()
  ),
}));

describe("User Routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = fastify();
    app.register(fastifyMultipart);
    app.register(userRoutes, { prefix: "/api/v1/users" });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("GET /api/v1/users should return a list of users", async () => {
    const response = await supertest(app.server).get("/api/v1/users");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /api/v1/users should create a new admin user", async () => {
    const userData = {
      email: "new@user.com",
      password: "QWERasdf1234!",
      name: "Test User",
      isAdmin: true,
    };
    const response = await supertest(app.server)
      .post("/api/v1/users")
      .send(userData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data).toHaveProperty("createdAt");
    expect(response.body.data.email).toBe("new@user.com");
    expect(response.body.data.name).toBe("Test User");
    expect(response.body.data.isAdmin).toBe(true);
    expect(response.body.data.avatar).toBe("");
  });

  test("POST /api/v1/users/:id/upload-avatar should upload a user avatar", async () => {
    const response = await supertest(app.server)
      .post("/api/v1/users/1/upload-avatar")
      .attach("file", Buffer.from("avatar file content"), "1-test-avatar.jpg");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data.avatarFileName).toBe("1-test-avatar.jpg");
  });

  test("GET /api/v1/users/:id should return a specific user", async () => {
    const userId = 123;
    const response = await supertest(app.server).get(`/api/v1/users/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("email");
    expect(response.body.data).toHaveProperty("name");
    expect(response.body.data).toHaveProperty("isAdmin");
    expect(response.body.data).toHaveProperty("avatar");
    expect(response.body.data).toHaveProperty("createdAt");
    expect(response.body.data.id).toBe(userId);
  });

  test("PUT /api/v1/users/:id should update a user", async () => {
    const userId = 123;
    const updatedEmail = "updated@email.com";
    const updateData = { email: updatedEmail };
    const response = await supertest(app.server)
      .put(`/api/v1/users/${userId}`)
      .send(updateData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data.id).toBe(userId);
    expect(response.body.data.email).toBe("updated@email.com");
  });

  test("DELETE /api/v1/users/:id should delete a user", async () => {
    const response = await supertest(app.server).delete("/api/v1/users/1");
    expect(response.status).toBe(204);
  });
});
