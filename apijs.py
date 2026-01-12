import requests

post_headers = {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:5173'
}
payload = {
    'email': 'testuser@example.com',
    'password': 'password123',
    'first_name': 'Test',
    'last_name': 'User',
    'phone': '+1234567890'
}

# Test POST through API Gateway
print("Testing POST through API Gateway (localhost:3000):")
try:
    response = requests.post('http://localhost:3000/api/auth/register', json=payload, headers=post_headers, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test POST directly to user service
print("Testing POST directly to User Service (localhost:3001):")
try:
    response = requests.post('http://localhost:3001/api/auth/register', json=payload, headers=post_headers, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")