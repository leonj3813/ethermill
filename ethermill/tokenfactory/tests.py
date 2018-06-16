from django.test import Client, RequestFactory, TestCase
from django.urls import reverse


# Create your tests here.
class GetViewTest(TestCase):
    def setup(self):
        client = Client()

    def test_index(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        response = self.client.get('/create/')
        self.assertEqual(response.status_code, 200)

    def test_about(self):
        response = self.client.get('/about/')
        self.assertEqual(response.status_code, 200)
