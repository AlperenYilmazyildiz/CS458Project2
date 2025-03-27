import axios from 'axios';
import { IP_ADDRESS } from '../services/GetIP.js';
import * as SecureStore from 'expo-secure-store';

export class SurveyService {    
    static async submitSurveyResult(formData) {
        const userToken = await SecureStore.getItemAsync("userToken");
        try {
            const response = await axios.post(
                `http://${IP_ADDRESS}:8080/survey/createSurvey`,
                formData, 
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response;
        } catch (error) {
            return error.response;
        }
    }
}