from flask import Flask, jsonify, request
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return jsonify({"status": "success"})


GOOGLE_CLIENT_ID = "130916168050-4l7rcjkl30gh92hopg69gmi78s7rqlf1.apps.googleusercontent.com"
@app.route('/api/accounts/google', methods=['POST'])
def google_sso():
    print("entering /api/accounts/google")
    data = request.get_json()
    auth_token = data['auth_token']
    sso_user_credentials = id_token.verify_oauth2_token(auth_token, google_requests.Request())
    if sso_user_credentials['aud'] != GOOGLE_CLIENT_ID:
        return jsonify({"data": "invalid request"}), 400
    
    response_data = {}
    first_name, last_name = get_sso_user_fullname(sso_user_credentials)
    response_data["email"] = sso_user_credentials['email'].lower()
    response_data["first_name"] = first_name
    response_data["last_name"] = last_name
    return jsonify({'data': [response_data]}), 201


def get_sso_user_fullname(sso_user_credentials):
        first_name = ""
        last_name = ""
        full_name_list = []
        try:
            first_name = sso_user_credentials["given_name"]
        except Exception as e:
            print(e)
            temp1 = sso_user_credentials["name"]
            full_name_list = temp1.split(" ")
            first_name = full_name_list[0]
        try:
            last_name = sso_user_credentials["family_name"]
        except Exception as e:
                print(e)
                try:
                    last_name = full_name_list[1]
                except Exception as e:
                    print(e)
                    last_name = ""

        return first_name, last_name


if __name__ == "__main__":
    app.run(port=5000, host='0.0.0.0')