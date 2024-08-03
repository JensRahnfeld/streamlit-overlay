import io

import numpy as np
from PIL import Image


NUM_FRAME_LIMIT_BYTES = 4


def compress_images(images, format='JPEG'):
    """
    Compress a sequence of images (numpy arrays) to a byte array of the format:
    <frame1_size (4 bytes)>|<frame1>|<frame2_size (4 bytes)>|<frame2>|...

    Parameters
    ----------
    images: np.ndarray of shape (num_frames, height, width, 3)
        The images to compress.

    Returns
    -------
    bytes
    """
    num_frames = images.shape[0]
    byte_arrays = []

    for i in range(num_frames):
        # Convert each frame (numpy array) to a PIL Image
        image = Image.fromarray(images[i])
        # Save the image to a byte buffer as JPEG
        with io.BytesIO() as buffer:
            image.save(buffer, format=format)
            byte_array = buffer.getvalue()
            byte_arrays.append(len(byte_array).to_bytes(NUM_FRAME_LIMIT_BYTES, byteorder='big'))
            byte_arrays.append(byte_array)

    result = b''.join(byte_arrays)

    return result


if __name__ == '__main__':
    import cv2

    img1 = cv2.cvtColor(cv2.imread('video/images/frame_0000.jpg'), cv2.COLOR_BGR2RGB)
    img2 = cv2.cvtColor(cv2.imread('video/images/frame_0100.jpg'), cv2.COLOR_BGR2RGB)

    images = np.stack([img1, img2])
    encoded_images = compress_images(images)
    
    num_bytes1 = int.from_bytes(encoded_images[:NUM_FRAME_LIMIT_BYTES], byteorder='big')
    offset = NUM_FRAME_LIMIT_BYTES + num_bytes1
    num_bytes2 = int.from_bytes(encoded_images[offset:offset + NUM_FRAME_LIMIT_BYTES], byteorder='big')

    print(len(encoded_images), num_bytes1, num_bytes2)
