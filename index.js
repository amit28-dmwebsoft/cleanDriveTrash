const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');

const app = express();

class GoogleDriveService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.client = axios.create({
      baseURL: 'https://www.googleapis.com/drive/v3',
    });

    this.client.interceptors.request.use(async (config) => {
      const authClient = await this.auth.getClient();
      const token = await authClient.getAccessToken();
      config.headers.Authorization = `Bearer ${token.token}`;
      return config;
    });
  }

  emptyTrash() {
    return this.client.delete('/files/trash');
  }
}

app.get('/', (_, res) => res.send('OK'));

app.post('/clean', async (_, res) => {
  try {
    const drive = new GoogleDriveService();
    await drive.emptyTrash();
    res.json({ status: 'success', message: 'Drive trash cleaned' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
