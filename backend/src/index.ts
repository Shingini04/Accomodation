import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import { AccommodationResolver } from "./resolvers/AccommodationResolver";
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
      context: ({ req, res }) => ({ req, res }),
      introspection: process.env.NODE_ENV !== 'production',
    });

    const app = express();

    app.use(
      cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true,
        methods: ["GET", "POST", "OPTIONS"],
        // allow common headers and any Apollo-specific preflight header
        allowedHeaders: ["Content-Type", "Authorization", "Apollo-Require-Preflight", "X-Requested-With"],
      })
    );

    app.use(express.json());

    await server.start();
    server.applyMiddleware({ 
      app, 
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
