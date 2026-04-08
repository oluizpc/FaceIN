import cv2
import face_recognition
from typing import List


def capture_face_image():
    """Captura uma imagem da webcam com preview"""

    video_capture = cv2.VideoCapture(0)

    if not video_capture.isOpened():
        raise Exception("Erro ao abrir a câmera")

    print("Pressione ESPAÇO para capturar ou ESC para cancelar...")

    while True:
        ret, frame = video_capture.read()

        if not ret:
            raise Exception("Erro ao capturar imagem")

        # Mostra a imagem da câmera
        cv2.imshow("Captura de Face", frame)

        key = cv2.waitKey(1)

        # ESPAÇO = captura
        if key == 32:
            print("Foto capturada!")
            break

        # ESC = cancelar
        if key == 27:
            video_capture.release()
            cv2.destroyAllWindows()
            raise Exception("Captura cancelada pelo usuário")

    video_capture.release()
    cv2.destroyAllWindows()

    return frame


def extract_face_embedding(image):
    """Extrai embedding do primeiro rosto detectado"""

    # ⚡ melhora desempenho convertendo para RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_image)

    if len(face_locations) == 0:
        raise Exception("Nenhum rosto detectado")

    if len(face_locations) > 1:
        print("⚠️ Mais de um rosto detectado, usando o primeiro")

    encoding = face_recognition.face_encodings(
        rgb_image,
        known_face_locations=face_locations
    )[0]

    return encoding


def compare_face(
    known_encodings: List[List[float]],
    test_encoding: List[float],
    tolerance=0.5
):
    """Compara embedding com lista de embeddings conhecidos"""

    results = face_recognition.compare_faces(
        known_encodings,
        test_encoding,
        tolerance=tolerance
    )

    return any(results)