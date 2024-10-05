import {
  getAllUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserController,
  uploadUserAvatarController,
} from "../../modules/users/users.controllers";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  constructPaginationUrls,
  getUserByEmail,
  emailUsedByAnotherUser,
} from "../../modules/users/users.services";
import {
  validateCreateUser,
  validateGetUser,
  validateUpdateUser,
  validateDeleteUser,
  validateUserAvatarFile,
} from "../../modules/users/users.validators";
import { FastifyRequest, FastifyReply, FastifyBaseLogger } from "fastify";

// Mock services and external dependencies
jest.mock("../../modules/users/users.services");
jest.mock("../../modules/users/users.validators");
jest.mock("@user-management-api/real-time-notifications");

describe("User Controllers", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      body: {},
      log: {
        error: jest.fn(),
        info: jest.fn(),
      } as unknown as FastifyBaseLogger,
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("getAllUsersController", () => {
    let mockRequestGetAllUsers: Partial<FastifyRequest>;

    beforeEach(() => {
      mockRequestGetAllUsers = {
        query: {
          limit: "10",
          skip: "0",
        },
        params: {},
        body: {},
        protocol: "http",
        hostname: "localhost",
        port: 3000,
        url: "/api/v1/users?limit=10&skip=0",
        log: {
          error: jest.fn(),
          info: jest.fn(),
        } as unknown as FastifyBaseLogger,
      };
    });
    it("should return all users with pagination metadata", async () => {
      const usersMockData = [
        {
          id: 1,
          email: "new@user.com",
          name: "Test User 1",
          isAdmin: true,
          avatar: "",
          createdAt: "2024-10-03T03:50:01.543Z",
        },
        {
          id: 2,
          email: "second@user.com",
          name: "Test User 2",
          isAdmin: false,
          avatar: "2-avatar.jpg",
          createdAt: "2024-10-04T03:50:01.543Z",
        },
      ];
      const paginationUrlsData = {
        nextUrl: "http://localhost:3000/api/v1/users?limit=10&skip=10",
        prevUrl: "http://localhost:3000/api/v1/users?limit=10&skip=0",
      };
      (getAllUsers as jest.Mock).mockResolvedValue(usersMockData);
      (constructPaginationUrls as jest.Mock).mockReturnValue(
        paginationUrlsData
      );

      await getAllUsersController(
        mockRequestGetAllUsers as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(getAllUsers).toHaveBeenCalledWith(10, 0);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: usersMockData,
        errors: null,
        meta: {
          limit: 10,
          skip: 0,
          next: "http://localhost:3000/api/v1/users?limit=10&skip=10",
          previous: "http://localhost:3000/api/v1/users?limit=10&skip=0",
        },
      });
    });

    it("should handle unexpected error while retrieving users", async () => {
      const mockErrorMessage = "Failed to fetch users";
      (getAllUsers as jest.Mock).mockRejectedValue(new Error(mockErrorMessage));

      await getAllUsersController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        meta: null,
        errors: [
          {
            message: `An unexpected error occurred while retrieving users (Error: ${mockErrorMessage})`,
          },
        ],
      });
    });
  });

  describe("getUserController", () => {
    it("should return a user if found", async () => {
      mockRequest.params = { id: "1" };
      const userMock = {
        id: 1,
        email: "new@user.com",
        name: "Test User 1",
        isAdmin: true,
        avatar: "",
        createdAt: "2024-10-03T03:50:01.543Z",
      };
      (getUser as jest.Mock).mockResolvedValue(userMock);
      (validateGetUser as jest.Mock).mockReturnValue([]);

      await getUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(getUser).toHaveBeenCalledWith(1);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: userMock,
        errors: null,
      });
    });

    it("should return a user if found", async () => {
      mockRequest.params = { id: "1" };
      const userMock = {
        id: 1,
        email: "new@user.com",
        name: "Test User 1",
        isAdmin: true,
        avatar: "",
        createdAt: "2024-10-03T03:50:01.543Z",
      };
      (getUser as jest.Mock).mockResolvedValue(userMock);
      (validateGetUser as jest.Mock).mockReturnValue([]);

      await getUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(getUser).toHaveBeenCalledWith(1);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: userMock,
        errors: null,
      });
    });

    it("should return 400 if validation fails", async () => {
      const userId = "asdf";
      const mockErrorMessage = `Validation error: ID (${userId}) is not a valid number`;
      mockRequest.params = { id: userId };
      (getUser as jest.Mock).mockResolvedValue(null);
      (validateGetUser as jest.Mock).mockReturnValue([
        {
          message: mockErrorMessage,
        },
      ]);

      await getUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [{ message: mockErrorMessage }],
      });
    });

    it("should return 404 if the user is not found", async () => {
      mockRequest.params = { id: "999" };
      (getUser as jest.Mock).mockResolvedValue(null);
      (validateGetUser as jest.Mock).mockReturnValue([]);

      await getUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [{ message: "User with id (999) not found" }],
      });
    });

    it("should handle unexpected error while retrieving the user", async () => {
      mockRequest.params = { id: "1" };
      const mockErrorMessage = "Failed to fetch user";
      (getUser as jest.Mock).mockRejectedValue(new Error(mockErrorMessage));
      (validateGetUser as jest.Mock).mockReturnValue([]);

      await getUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(getUser).toHaveBeenCalledWith(1);
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `An unexpected error occurred while retrieving user with id: 1 (Error: ${mockErrorMessage})`,
          },
        ],
      });
    });
  });

  describe("createUserController", () => {
    it("should create a user and return it", async () => {
      mockRequest.body = {
        email: "new@user.com",
        password: "QWERasdf1234!",
        name: "Test User",
        isAdmin: false,
      };

      (createUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: "new@user.com",
        name: "Test User",
        isAdmin: false,
        createdAt: "2024-10-03T03:50:01.543Z",
      });
      (validateCreateUser as jest.Mock).mockReturnValue([]);

      await createUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(createUser).toHaveBeenCalledWith(
        "new@user.com",
        "QWERasdf1234!",
        "Test User",
        false
      );
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 1,
          email: "new@user.com",
          name: "Test User",
          isAdmin: false,
          createdAt: "2024-10-03T03:50:01.543Z",
        }),
        errors: null,
      });
    });

    it("should return 400 if validation fails", async () => {
      mockRequest.body = {
        email: "invalid",
        password: "short",
        name: "Test User",
      };
      (validateCreateUser as jest.Mock).mockReturnValue([
        {
          message: "Invalid email",
        },
        {
          message: "Password is too short",
        },
      ]);

      await createUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          { message: "Invalid email" },
          { message: "Password is too short" },
        ],
      });
    });

    it("should return 400 if user with that email already exists", async () => {
      const mockEmail = "new@user.com";
      mockRequest.body = {
        email: mockEmail,
        password: "QWERasdf1234!",
        name: "Test User",
        isAdmin: false,
      };
      (validateCreateUser as jest.Mock).mockReturnValue([]);
      (getUserByEmail as jest.Mock).mockResolvedValue({
        email: mockEmail,
        password: "QWERasdf1234!",
        name: "Test User",
        isAdmin: false,
      });

      await createUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `A user with the email address (${mockEmail}) already exists`,
          },
        ],
      });
    });

    it("should handle unexpected error while creating a user", async () => {
      mockRequest.body = {
        email: "new@user.com",
        password: "QWERasdf1234!",
        name: "Test User",
        isAdmin: false,
      };
      const mockErrorMessage = "Failed to create user";
      (createUser as jest.Mock).mockRejectedValue(new Error(mockErrorMessage));
      (validateCreateUser as jest.Mock).mockReturnValue([]);
      (getUserByEmail as jest.Mock).mockReturnValue(null);

      await createUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `An unexpected error occurred while creating user (Error: ${mockErrorMessage})`,
          },
        ],
      });
    });
  });

  describe("createUserController", () => {
    it("should create a user and return it", async () => {
      mockRequest.body = {
        email: "new@user.com",
        password: "QWERasdf1234!",
        name: "Test User",
        isAdmin: false,
      };

      (createUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: "new@user.com",
        name: "Test User",
        isAdmin: false,
        createdAt: "2024-10-03T03:50:01.543Z",
      });
      (validateCreateUser as jest.Mock).mockReturnValue([]);

      await createUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(createUser).toHaveBeenCalledWith(
        "new@user.com",
        "QWERasdf1234!",
        "Test User",
        false
      );
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 1,
          email: "new@user.com",
          name: "Test User",
          isAdmin: false,
          createdAt: "2024-10-03T03:50:01.543Z",
        }),
        errors: null,
      });
    });

    it("should return 400 if validation fails", async () => {
      mockRequest.body = {
        email: "invalid",
        password: "short",
        name: "Test User",
      };
      (validateCreateUser as jest.Mock).mockReturnValue([
        {
          message: "Invalid email",
        },
        {
          message: "Password is too short",
        },
      ]);

      await createUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          { message: "Invalid email" },
          { message: "Password is too short" },
        ],
      });
    });

    it("should return 400 if user with that email already exists", async () => {
      const mockEmail = "new@user.com";
      mockRequest.body = {
        email: mockEmail,
        password: "QWERasdf1234!",
        name: "Test User",
        isAdmin: false,
      };
      (validateCreateUser as jest.Mock).mockReturnValue([]);
      (getUserByEmail as jest.Mock).mockResolvedValue({
        email: mockEmail,
        password: "QWERasdf1234!",
        name: "Test User",
        isAdmin: false,
      });

      await createUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `A user with the email address (${mockEmail}) already exists`,
          },
        ],
      });
    });

    it("should handle unexpected error while creating a user", async () => {
      mockRequest.body = {
        email: "new@user.com",
        password: "QWERasdf1234!",
        name: "Test User",
        isAdmin: false,
      };
      const mockErrorMessage = "Failed to create user";
      (createUser as jest.Mock).mockRejectedValue(new Error(mockErrorMessage));
      (validateCreateUser as jest.Mock).mockReturnValue([]);
      (getUserByEmail as jest.Mock).mockReturnValue(null);

      await createUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `An unexpected error occurred while creating user (Error: ${mockErrorMessage})`,
          },
        ],
      });
    });
  });

  describe("updateUserController", () => {
    it("should update a user and return it", async () => {
      const mockId = "1";
      const mockEmail = "new2@user.com";
      const mockPassword = "QWERasdf1234!!";
      const mockName = "Test User 2";
      const mockIsAdmin = true;
      mockRequest.params = { id: mockId };
      mockRequest.body = {
        email: mockEmail,
        password: mockPassword,
        name: mockName,
        isAdmin: mockIsAdmin,
      };

      (updateUser as jest.Mock).mockResolvedValue({
        id: mockId,
        email: "new2@user.com",
        name: "Test User 2",
        isAdmin: true,
        createdAt: "2024-10-03T03:50:01.543Z",
      });
      (getUser as jest.Mock).mockResolvedValue({
        id: mockId,
        email: "new@user.com",
        name: "Test User",
        isAdmin: false,
        createdAt: "2024-10-03T03:50:01.543Z",
      });
      (emailUsedByAnotherUser as jest.Mock).mockReturnValue(false);

      (validateUpdateUser as jest.Mock).mockReturnValue([]);

      await updateUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(updateUser).toHaveBeenCalledWith(
        Number(mockId),
        mockEmail,
        mockPassword,
        mockName,
        mockIsAdmin
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: mockId,
          email: mockEmail,
          name: mockName,
          isAdmin: mockIsAdmin,
          createdAt: "2024-10-03T03:50:01.543Z",
        }),
        errors: null,
      });
    });

    it("should return 400 if validation fails", async () => {
      const mockId = "asdf";
      const mockError = `Validation error: ID (${mockId}) is not a valid number`;
      mockRequest.params = {
        id: mockId,
      };
      mockRequest.body = {
        password: "short",
      };

      (validateUpdateUser as jest.Mock).mockReturnValue([
        {
          message: mockError,
        },
      ]);

      await updateUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [{ message: mockError }],
      });
    });

    it("should return 404 if user not found", async () => {
      const mockId = 999;
      mockRequest.params = {
        id: mockId,
      };
      (validateUpdateUser as jest.Mock).mockReturnValue([]);
      (getUser as jest.Mock).mockResolvedValue(null);

      await updateUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `User with id (${mockId}) not found`,
          },
        ],
      });
    });

    it("should return 400 if user with the new email already exists", async () => {
      const mockId = 1;
      const mockEmail = "user@already.exists.com";
      mockRequest.params = {
        id: mockId,
      };
      mockRequest.body = {
        email: mockEmail,
      };
      (validateUpdateUser as jest.Mock).mockReturnValue([]);
      (getUser as jest.Mock).mockResolvedValue({});
      (emailUsedByAnotherUser as jest.Mock).mockReturnValue(true);

      await updateUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `This email address (${mockEmail}) is being used by another user`,
          },
        ],
      });
    });

    it("should handle unexpected error while updating a user", async () => {
      mockRequest.body = {
        email: "new2@user.com",
      };
      const mockErrorMessage = "Failed to update user";
      (validateUpdateUser as jest.Mock).mockReturnValue([]);
      (getUser as jest.Mock).mockResolvedValue({});
      (emailUsedByAnotherUser as jest.Mock).mockReturnValue(false);
      (updateUser as jest.Mock).mockRejectedValue(new Error(mockErrorMessage));

      await updateUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `An unexpected error occurred while updating user (Error: ${mockErrorMessage})`,
          },
        ],
      });
    });
  });

  describe("deleteUserController", () => {
    it("should delete a user and return 204", async () => {
      mockRequest.params = { id: "1" };
      (getUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: "new@user.com",
        name: "Test User 1",
        isAdmin: true,
        avatar: "",
        createdAt: "2024-10-03T03:50:01.543Z",
      });
      (validateDeleteUser as jest.Mock).mockReturnValue([]);
      (deleteUser as jest.Mock).mockResolvedValue({});

      await deleteUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(getUser).toHaveBeenCalledWith(1);
      expect(deleteUser).toHaveBeenCalledWith(1);
      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it("should return 400 if validation fails", async () => {
      const mockId = "asdf";
      const mockErrorMessage = `Validation error: ID (${mockId}) is not a valid number`;
      mockRequest.params = { id: mockId };
      (validateDeleteUser as jest.Mock).mockReturnValue([
        {
          message: mockErrorMessage,
        },
      ]);

      await deleteUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [{ message: mockErrorMessage }],
      });
    });

    it("should return 404 if the user is not found", async () => {
      const mockId = 999;
      mockRequest.params = { id: 999 };
      (getUser as jest.Mock).mockResolvedValue(null);
      (validateDeleteUser as jest.Mock).mockReturnValue([]);

      await deleteUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [{ message: `User with id (${mockId}) not found` }],
      });
    });

    it("should handle unexpected error while deleting a user", async () => {
      const mockId = 1;
      const mockErrorMessage = "Failed to delete user";
      mockRequest.params = { id: mockId };
      (getUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: "new@user.com",
        name: "Test User 1",
        isAdmin: true,
        avatar: "",
        createdAt: "2024-10-03T03:50:01.543Z",
      });
      (validateDeleteUser as jest.Mock).mockReturnValue([]);
      (deleteUser as jest.Mock).mockRejectedValue(
        new Error("Failed to delete user")
      );

      await deleteUserController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `An unexpected error occurred while deleting user with id: ${mockId} (Error: ${mockErrorMessage})`,
          },
        ],
      });
    });
  });

  describe("uploadUserAvatarController", () => {
    it("should upload an avatar successfully", async () => {
      const mockFile = {
        type: "file",
        mimetype: "image/jpeg",
        filename: "1-avatar.jpg",
        file: Buffer.from("file content"),
      };
      mockRequest.params = { id: "1" };
      mockRequest.parts = jest.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield mockFile;
        },
      });

      (validateUserAvatarFile as jest.Mock).mockReturnValue([]);
      (uploadAvatar as jest.Mock).mockResolvedValue({});

      await uploadUserAvatarController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(validateUserAvatarFile).toHaveBeenCalledWith(mockFile);
      expect(uploadAvatar).toHaveBeenCalledWith(
        mockFile,
        expect.any(String),
        1
      );
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: { avatarFileName: expect.any(String) },
        errors: null,
      });
    });

    it("should return 400 if validation fails", async () => {
      const mockFile = {
        type: "file",
        file: Buffer.from("file content"),
      };
      const mockErrors = [
        {
          message: "Validation error: file must have a filename",
        },
        {
          message: "Validation error: file must have a mimetype",
        },
      ];
      mockRequest.params = { id: "1" };
      mockRequest.parts = jest.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield mockFile;
        },
      });

      (validateUserAvatarFile as jest.Mock).mockReturnValue(mockErrors);

      await uploadUserAvatarController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(validateUserAvatarFile).toHaveBeenCalledWith(mockFile);
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: mockErrors,
      });
    });

    it("should return 400 if file is not selected", async () => {
      const mockFile = {
        type: "invalid",
        mimetype: "image/jpeg",
        filename: "1-avatar.jpg",
        file: Buffer.from("file content"),
      };
      const mockErrorMessage = "A file must be selected";
      mockRequest.params = { id: "1" };
      mockRequest.parts = jest.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield mockFile;
        },
      });

      //   (validateUserAvatarFile as jest.Mock).mockReturnValue([]);

      await uploadUserAvatarController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      //   expect(validateUserAvatarFile).toHaveBeenCalledWith(mockFile);
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [{ message: mockErrorMessage }],
      });
    });

    it("should handle unexpected error during avatar upload", async () => {
      const mockFile = {
        type: "file",
        mimetype: "image/jpeg",
        filename: "1-avatar.jpg",
        file: Buffer.from("file content"),
      };
      const mockErrorMessage = "Failed to upload avatar";
      mockRequest.params = { id: "1" };
      mockRequest.parts = jest.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield mockFile;
        },
      });

      (validateUserAvatarFile as jest.Mock).mockReturnValue([]);
      (uploadAvatar as jest.Mock).mockRejectedValue(
        new Error(mockErrorMessage)
      );

      await uploadUserAvatarController(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(validateUserAvatarFile).toHaveBeenCalledWith(mockFile);
      expect(uploadAvatar).toHaveBeenCalledWith(
        mockFile,
        expect.any(String),
        1
      );
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        errors: [
          {
            message: `An unexpected error occurred while uploading user avatar (Error: ${mockErrorMessage})`,
          },
        ],
      });
    });
  });
});
