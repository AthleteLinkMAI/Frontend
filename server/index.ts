import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Geocoding endpoint using OpenStreetMap Nominatim
  app.get("/api/geocode", async (req, res) => {
    const { longitude, latitude } = req.query;

    console.log("Geocoding request received:", { longitude, latitude });

    if (!longitude || !latitude) {
      return res.status(400).json({ error: "Missing longitude or latitude" });
    }

    try {
      const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

      console.log("Calling Nominatim API:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Sports-App-CreateRequest/1.0",
        },
      });

      console.log("Nominatim API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Nominatim API error response:", errorText);
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Nominatim API response data:", data);

      if (data.address) {
        let address = "";

        if (data.address.road || data.address.street) {
          address += data.address.road || data.address.street;
        }

        if (data.address.house_number) {
          address += ", д. " + data.address.house_number;
        }

        if (data.address.city) {
          address = (address ? address + ", " : "") + "г. " + data.address.city;
        } else if (data.address.town) {
          address = (address ? address + ", " : "") + "г. " + data.address.town;
        }

        const finalAddress = address || data.address.display_name;
        console.log("Found address:", finalAddress);
        return res.json({ address: finalAddress });
      }

      console.log("No geocoding results found");
      return res.json({ address: null });
    } catch (error) {
      console.error("Geocoding error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errorMessage });
    }
  });

  return app;
}
