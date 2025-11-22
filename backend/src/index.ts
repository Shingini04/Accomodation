import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import { AccommodationResolver } from "./resolvers/AccommodationResolver";
import { AuthResolver } from "./resolvers/AuthResolver";
import { RoomResolver } from "./resolvers/RoomResolver";
import { SupportResolver } from "./resolvers/SupportResolver";
import { DashboardResolver } from "./resolvers/DashboardResolver";
import { ExportResolver } from "./resolvers/ExportResolver";

dotenv.config();

async function main() {
  try {
    
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const schema = await buildSchema({
      resolvers: [
        AuthResolver,
        AccommodationResolver,
        RoomResolver,
        SupportResolver,
        DashboardResolver,
        ExportResolver,
      ],
      validate: false,
    });

    const server = new ApolloServer({
      schema,
      context: async ({ req, res }) => {
        // parse JWT from Authorization header if present
        const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
        let user = null;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const jwt = await import('jsonwebtoken');
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'replace_with_real_secret');
            user = { userId: decoded.userId };
          } catch (e: any) {
            // invalid token - ignore, user remains null
            console.warn('Invalid auth token:', e?.message || e);
          }
        }
        // simple admin auth: if client sends x-admin-password header matching ADMIN_PASSWORD env var,
        // mark context.admin = true. This is intentionally simple (password only) as requested.
        const adminPasswordHeader = (req.headers['x-admin-password'] as string) || (req.headers['x-admin-password'.toLowerCase()] as string) || '';
        const isAdmin = !!(process.env.ADMIN_PASSWORD && adminPasswordHeader && adminPasswordHeader === process.env.ADMIN_PASSWORD);

        return { req, res, user, admin: isAdmin };
      },
      introspection: process.env.NODE_ENV !== 'production',
    });

    const app = express();

    app.use(
      cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true,
        methods: ["GET", "POST", "OPTIONS"],
        // allow common headers and any Apollo-specific or custom admin header
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "Apollo-Require-Preflight",
          "X-Requested-With",
          "x-admin-password",
        ],
      })
    );

    app.use(express.json());

    await server.start();
    server.applyMiddleware({ 
      app: app as any, 
      cors: false,
      path: '/graphql'
    });

    app.get("/health", (req, res) => {
      res.json({ status: "ok", message: "Server is running" });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();
