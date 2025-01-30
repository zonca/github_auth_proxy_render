import requests
import base64
import datetime
import os

class GitHubUploader:
    def __init__(self, token_file=".github_access_token", github_user="zonca", repo_name="github_auth_proxy_render", branch="main"):
        self.token_file = token_file
        self.github_user = github_user
        self.repo_name = repo_name
        self.branch = branch
        self.github_access_token = self._read_token()

    def _read_token(self):
        """Reads the GitHub access token from a file."""
        if os.path.exists(self.token_file):
            with open(self.token_file, "r") as f:
                return f.read().strip()
        else:
            raise FileNotFoundError(f"❌ Token file '{self.token_file}' not found!")

    def upload_notebook(self, notebook_name):
        """Uploads the current Jupyter Notebook to GitHub with a timestamp."""
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        new_filename = f"{notebook_name.replace('.ipynb', '')}_{timestamp}.ipynb"

        # Read notebook content
        if not os.path.exists(notebook_name):
            raise FileNotFoundError(f"❌ Notebook '{notebook_name}' not found!")

        with open(notebook_name, "rb") as f:
            notebook_content = f.read()

        # Encode content in Base64
        encoded_content = base64.b64encode(notebook_content).decode()

        # GitHub API URL
        file_url = f"https://api.github.com/repos/{self.github_user}/{self.repo_name}/contents/{new_filename}"
        headers = {"Authorization": f"token {self.github_access_token}"}

        # Check if file exists
        existing_file = requests.get(file_url, headers=headers)

        data = {
            "message": f"Upload {new_filename} from Jupyter",
            "content": encoded_content,
            "branch": self.branch,
        }

        # If file exists, add "sha" for update
        if existing_file.status_code == 200:
            data["sha"] = existing_file.json()["sha"]

        # Upload to GitHub
        response = requests.put(file_url, json=data, headers=headers)

        # Print results
        if response.status_code in [200, 201]:
            print(f"✅ Successfully uploaded: {new_filename}")
            print(f"🔗 View it here: {response.json().get('content', {}).get('html_url', 'URL not available')}")
        else:
            print(f"❌ Upload failed: {response.status_code} - {response.json()}")