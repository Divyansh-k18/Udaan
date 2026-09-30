"""Run: python -m unittest test_sessions -v. Uses a temporary database only."""
import os
import tempfile
import unittest
from datetime import datetime, timedelta
from pathlib import Path

temp = tempfile.TemporaryDirectory()
os.environ["UDAAN_DATABASE_URL"] = f"sqlite:///{Path(temp.name) / 'test.db'}"
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, engine
from models import ExamSession

class SessionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)
        engine.dispose()
        temp.cleanup()

    def start(self):
        response = self.client.post('/sessions', json={'exam_id':'ssc-cgl-mini','extra_time_percent':50})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        return data, {'X-Session-Token':data['access_token']}

    def test_health(self):
        self.assertEqual(self.client.get('/health').json()['status'], 'ok')

    def test_missing_and_wrong_tokens(self):
        data, headers = self.start()
        url=f"/sessions/{data['id']}/paper"
        self.assertEqual(self.client.get(url).status_code,401)
        self.assertEqual(self.client.get(url,headers={'X-Session-Token':'wrong'}).status_code,403)

    def test_paper_order_and_hidden_answers(self):
        data, headers = self.start()
        url=f"/sessions/{data['id']}/paper"
        one=self.client.get(url,headers=headers).json()
        two=self.client.get(url,headers=headers).json()
        self.assertEqual(one['questions'],two['questions'])
        self.assertEqual(data['duration_seconds'],900)
        for question in one['questions']:
            self.assertNotIn('correct_answer',question)
            self.assertNotIn('explanation',question)

    def test_save_score_and_idempotent_submit(self):
        data, headers=self.start()
        url=f"/sessions/{data['id']}"
        saved=self.client.put(url+'/answers',headers=headers,json={'answers':[{'question_id':'ssc-q1','chosen':'B'},{'question_id':'ssc-q2','chosen':'B'}]})
        self.assertEqual(saved.status_code,200)
        result=self.client.post(url+'/submit',headers=headers)
        self.assertEqual(result.status_code,200)
        result=result.json()
        self.assertEqual(result['score'],1.5)
        self.assertEqual(result['attempted'],2)
        self.assertEqual(result['max_score'],8)
        again=self.client.post(url+'/submit',headers=headers).json()
        self.assertTrue(again['already_submitted'])
        self.assertEqual(again['score'],result['score'])
        self.assertEqual(self.client.put(url+'/answers',headers=headers,json={'answers':[{'question_id':'ssc-q1','chosen':'A'}]}).status_code,409)

    def test_invalid_and_duplicate_answers(self):
        data, headers=self.start()
        url=f"/sessions/{data['id']}/answers"
        for answers in [[{'question_id':'ssc-q1','chosen':'Z'}],[{'question_id':'bank-q1','chosen':'A'}]]:
            response=self.client.put(url,headers=headers,json={'answers':answers})
            self.assertIn(response.status_code,(400,422))
        duplicate=[{'question_id':'ssc-q1','chosen':'A'},{'question_id':'ssc-q1','chosen':'B'}]
        self.assertEqual(self.client.put(url,headers=headers,json={'answers':duplicate}).status_code,422)

    def test_clear_answer(self):
        data, headers=self.start()
        url=f"/sessions/{data['id']}"
        for chosen in ['B',None]:
            response=self.client.put(url+'/answers',headers=headers,json={'answers':[{'question_id':'ssc-q1','chosen':chosen}]})
            self.assertEqual(response.status_code,200)
        result=self.client.post(url+'/submit',headers=headers).json()
        self.assertEqual(result['attempted'],0)

    def test_expired_session_rejects_late_answers(self):
        data, headers=self.start()
        with SessionLocal() as db:
            session=db.get(ExamSession,data['id'])
            session.end_time=datetime.now()-timedelta(days=1)
            db.commit()
        url=f"/sessions/{data['id']}"
        self.assertEqual(self.client.put(url+'/answers',headers=headers,json={'answers':[{'question_id':'ssc-q1','chosen':'B'}]}).status_code,409)
        self.assertEqual(self.client.post(url+'/submit',headers=headers).status_code,200)

    def test_extra_time_limits(self):
        for value in [-1,101]:
            self.assertEqual(self.client.post('/sessions',json={'exam_id':'ssc-cgl-mini','extra_time_percent':value}).status_code,422)

if __name__ == '__main__':
    unittest.main()
