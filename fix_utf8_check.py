import os

folders = ["app", "app/tests"]

for folder in folders:
    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                with open(path, "rb") as f:
                    content = f.read()
                try:
                    content.decode("utf-8")
                except UnicodeDecodeError as e:
                    print(f"[ERRO UTF-8] {path} - {e}")