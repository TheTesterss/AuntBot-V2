import { config } from 'dotenv';
config();
import 'colors';
import Bot from './classes/Bot';

new Bot().startClient(process.env.token);
