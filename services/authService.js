import axios from 'axios';
import { IP_ADDRESS } from '../services/GetIP.js';

export class AuthService {
  static async login(email, password) {
    try {
      const response = await axios.post(`http://${IP_ADDRESS}:8080/api/login`, {
        email,
        password,
      });
      return response;
    } catch (error) {
      return error.response;
    }
  }

  static async checkExistingUser(email) {
    try {
      const response = await axios.post(`http://${IP_ADDRESS}:8080/user/getUserByEmail`, email, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      return error.response;
    }
  }
}