from flask import Flask, request, jsonify
from flask_cors import CORS
from chat import get_response

app = Flask(__name__)
CORS(app)

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    response = get_response(text)
    print("request received")
    message = {"answer" : response}
    return message

if __name__ == "__main__":
    app.run(debug=True)
