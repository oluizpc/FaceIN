# -*- coding: utf-8 -*-
import os

# pastas do projeto que contêm .py
folders = ["app", "app/tests"]

for folder in folders:
    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                try:
                    # lê o arquivo como bytes
                    with open(path, "rb") as f:
                        content = f.read()
                    # decodifica em UTF-8, ignorando bytes inválidos
                    text = content.decode("utf-8", errors="ignore")
                    # regrava o arquivo em UTF-8
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(text)
                    print(f"[OK] Corrigido UTF-8: {path}")
                except Exception as e:
                    print(f"[ERRO] {path}: {e}")