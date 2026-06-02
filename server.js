require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 네이버 뉴스 검색 API 프록시
app.get('/api/news', async (req, res) => {
  const { query, display = 10, start = 1, sort = 'date' } = req.query;

  if (!query) {
    return res.status(400).json({ error: '검색어를 입력해주세요.' });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === '여기에_Client_ID_입력') {
    return res.status(500).json({ error: '.env 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 설정해주세요.' });
  }

  try {
    const naverUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`;

    const response = await fetch(naverUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `네이버 API 오류: ${response.status}`, detail: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API 요청 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📰 네이버 뉴스 검색 앱이 준비되었습니다.`);
});
