require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function tryModels(models) {
  for (const m of models) {
    try {
      console.log('Trying model', m);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Hello Gemini');
      const response = await result.response;
      if (response && typeof response.text === 'function') {
        console.log('Model', m, 'response:', response.text());
        return;
      } else if (response?.candidates && response.candidates[0]) {
        console.log('Model', m, 'response:', response.candidates[0].content || JSON.stringify(response.candidates[0]));
        return;
      } else {
        console.log('Model', m, 'raw:', JSON.stringify(response || result));
        return;
      }
    } catch (err) {
      console.error('Model', m, 'error:', err.response?.data || err.message || err);
    }
  }
  console.error('No model succeeded');
}

tryModels(['gemini-1.5-flash','gemini-1.5-pro','gemini-pro']);

async function listModels() {
  try {
    console.log('\nListing models via SDK...');
    if (typeof genAI.listModels === 'function') {
      const res = await genAI.listModels();
      console.log('models:', JSON.stringify(res, null, 2));
      return;
    }
    if (genAI.modelService && typeof genAI.modelService.listModels === 'function') {
      const res = await genAI.modelService.listModels();
      console.log('models (modelService):', JSON.stringify(res, null, 2));
      return;
    }
    console.log('No listModels available on SDK object.');
  } catch (err) {
    console.error('List models error:', err.response?.data || err.message || err);
  }
}

listModels();
