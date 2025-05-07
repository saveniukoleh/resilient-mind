import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  zoom: {
    apiKey: string;
    apiSecret: string;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '4000', 10),
  zoom: {
    apiKey: process.env.ZOOM_API_KEY || '',
    apiSecret: process.env.ZOOM_API_SECRET || '',
  },
};
