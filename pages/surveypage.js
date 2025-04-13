import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SurveyService } from '../services/surveyService';

const AI_MODELS = [
  'chatGPT',
  'bard',
  'claude',
  'copilot',
  'deepseek'
];

const EDUCATION_LEVELS = [
  'Primary School',
  'High School',
  'Bachelor Degree',
  'Master Degree',
  'PhD',
  'Other',
];

const GENDERS = ['male', 'female', 'other'];

const SurveyPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',    
    dateOfBirth: null,
    educationLevel: '',
    city: '',
    gender: '',
    aiModel: [],
    useCaseOfAi: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Check form validity whenever formData changes
useEffect(() => {
    const isValid =
      formData.name.trim() !== '' &&
      formData.dateOfBirth !== null &&
      formData.educationLevel !== '' &&
      formData.city.trim() !== '' &&
      formData.gender !== '' &&
      formData.aiModel.length > 0 &&
      // Check that every selected AI model has a non-empty description
      formData.aiModel.every(model => model.description.trim() !== '') &&
      formData.useCaseOfAi.trim() !== '';
    
    setIsFormValid(isValid);
  }, [formData]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, dateOfBirth: selectedDate });
    }
  };

  const toggleAIModel = (modelType) => {
    setFormData(prev => {
      // Check if model already exists
      const existingIndex = prev.aiModel.findIndex(m => m.aiType === modelType);
      
      if (existingIndex >= 0) {
        // Remove model
        return {
          ...prev,
          aiModel: prev.aiModel.filter(m => m.aiType !== modelType)
        };
      } else {
        // Add new model with empty description
        return {
          ...prev,
          aiModel: [
            ...prev.aiModel,
            { aiType: modelType, description: '' }
          ]
        };
      }
    });
  };

  const updateModelDescription = (modelType, description) => {
    setFormData(prev => ({
      ...prev,
      aiModel: prev.aiModel.map(model => 
        model.aiType === modelType 
          ? { ...model, description } 
          : model
      )
    }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSending(true);
    
    try {
        // Save survey data locally first
        const surveys = await AsyncStorage.getItem('surveys');
        const parsedSurveys = surveys ? JSON.parse(surveys) : [];
        parsedSurveys.push(formData);
        await AsyncStorage.setItem('surveys', JSON.stringify(parsedSurveys));
        
        // Submit survey data to the server 
        const response = await SurveyService.submitSurveyResult({
          ...formData,
          aiModel: formData.aiModel.map(model => ({
            aiType: model.aiType,
            description: model.description,
          })), 
        });
        const generatedBody = generateMailBody(formData);
        console.log(response.data);
        console.log(generatedBody);
        if (response.status === 200 && response.data === generatedBody) {
            Alert.alert('Success', 'Survey submitted successfully!');
            resetForm();
        }
        else {
            Alert.alert('Error', 'Failed to submit survey');
        }
    } catch (error) {
        console.error('Error submitting survey:', error);
        Alert.alert('Error', 'Failed to submit survey');
    }
    finally {
        setIsSending(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dateOfBirth: null,
      educationLevel: '',
      city: '',
      gender: '',
      aiModel: [],
      useCaseOfAi: '',
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Select birth date';
    return date.toLocaleDateString();
  };

  const generateMailBody = (survey) => {
    const capitalize = (str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    let body = '';
    body += `Name: ${survey.name}\n`;
    body += `Surname: ${survey.surname}\n`;
    body += `Date of birth: ${formatDateForBackend(survey.dateOfBirth)}\n`;
    body += `City: ${survey.city}\n`;
    body += `Gender: ${capitalize(survey.gender)}\n`;
    body += `AI Models: \n\n`;

    survey.aiModel.forEach((model, index) => {
      body += `\t${index + 1}.\n`;
      body += `\t\tAI Type: ${capitalize(model.aiType)}\n`;
      body += `\t\tDescription: ${model.description}\n`;
    });

    body += `\nUse Case of AI: ${survey.useCaseOfAi}\n`;
    body += `Education Level: ${survey.educationLevel}\n`;

    return body;
  };

  const formatDateForBackend = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>AI Usage Survey</Text>

      <Text style={styles.label}>Name and Surname</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your surname"
        value={formData.surname}
        onChangeText={(text) => setFormData({ ...formData, surname: text })}
      />

      <Text style={styles.label}>Birth Date</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{formatDate(formData.dateOfBirth)}</Text>
        <Icon name="calendar-today" size={20} color="#555" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Education Level</Text>
      <View style={styles.optionsContainer}>
        {EDUCATION_LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.optionButton,
              formData.educationLevel === level && styles.optionSelected,
            ]}
            onPress={() =>
              setFormData({ ...formData, educationLevel: level })
            }
          >
            <Text
              style={[
                styles.optionText,
                formData.educationLevel === level && styles.optionTextSelected,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your city"
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.optionsContainer}>
        {GENDERS.map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.optionButton,
              formData.gender === gender && styles.optionSelected,
            ]}
            onPress={() => setFormData({ ...formData, gender })}
          >
            <Text
              style={[
                styles.optionText,
                formData.gender === gender && styles.optionTextSelected,
              ]}
            >
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>AI Models You've Tried (Select all that apply)</Text>
      {AI_MODELS.map(modelType => (
        <View key={modelType} style={styles.modelContainer}>
          <CheckBox
            title={modelType}
            checked={formData.aiModel.some(m => m.aiType === modelType)}
            onPress={() => toggleAIModel(modelType)}
            containerStyle={styles.checkboxContainer}
          />
          
          {formData.aiModel.some(m => m.aiType === modelType) && (
            <TextInput
              style={styles.defectInput}
              placeholder={`Describe ${modelType} defects`}
              value={
                formData.aiModel.find(m => m.aiType === modelType)?.description || ''
              }
              onChangeText={(text) => updateModelDescription(modelType, text)}
              multiline
            />
          )}
        </View>
      ))}


      <Text style={styles.label}>Beneficial AI Use Cases in Daily Life</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Describe how AI has been beneficial in your daily life (Max 300 characters)"
        value={formData.useCaseOfAi}
        onChangeText={(text) =>
          setFormData({ ...formData, useCaseOfAi: text })
        }
        multiline
        numberOfLines={4}
        maxLength={300}
      />

      {isFormValid && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          accessibilityLabel="send_survey_button"
          disabled={isSending}
        >
          <Text style={styles.submitButtonText}>
            {isSending ? 'Sending...' : 'Send Survey'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#555',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  optionSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  optionText: {
    fontSize: 14,
    color: '#555',
  },
  optionTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  defectContainer: {
    marginBottom: 15,
  },
  defectModelLabel: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  defectInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 60,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 15,
    marginTop: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SurveyPage;