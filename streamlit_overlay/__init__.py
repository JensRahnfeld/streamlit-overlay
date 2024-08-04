import os
from typing import Union, List

import cv2
import numpy as np
from PIL.Image import Image
import streamlit.components.v1 as components

from .utils import compress_images


_RELEASE = True

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _component_func = components.declare_component(
        "overlay",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend", "build")
    _component_func = components.declare_component("overlay", path=build_dir)


def overlay(images: Union[np.ndarray, List[Image]],
            masks: Union[np.ndarray, List[Image]] = [],
            alpha: float = 0.5,
            key: str = None,
            toggle_label: str = "Display Overlay",
            fps: int = 30,
            autoplay: bool = False):
    """Create a new instance of "Overlay".

    Parameters
    ----------
    images: np.ndarray of shape (height, width, 3) or (num_frames, height, width, 3)
        The image to display.
    masks: np.ndarray of shape (height, width, 3) or (num_frames, height, width, 3)
        The mask to overlay on the image.
    alpha: float
        The alpha value to use when overlaying the mask.
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.
    toggle_label: str
        The label to use for the toggle button.
    fps: int
        The frames per second to use when displaying a video.
    autoplay: bool
        Whether to automatically play the video.

    Returns
    -------
    int
    """
    assert isinstance(images, (np.ndarray, list))

    if isinstance(images, np.ndarray):
        if len(images.shape) == 3:
            images = images[None, :]
        num_frames, height, width, _ = images.shape
    elif all(isinstance(image, Image) for image in images):
        num_frames = len(images)
        height, width = images[0].height, images[0].width
    else:
        raise ValueError("Expected 'images' to be a numpy array or a list of PIL.Image objects.")

    if isinstance(masks, np.ndarray):
        if len(masks.shape) == 3:
            masks = masks[None, :]

    component_value = _component_func(images=compress_images(images),
                                      masks=compress_images(masks),
                                      width=width,
                                      height=height,
                                      numFrames=num_frames,
                                      alpha=alpha,
                                      key=key,
                                      toggleLabel=toggle_label,
                                      fps=fps,
                                      autoplay=autoplay,
                                      default=0)

    return component_value


def heatmap_visualizer(images: np.ndarray,
                       masks: Union[np.ndarray, None] = None,
                       colormap: int = cv2.COLORMAP_JET,
                       key: str = None,
                       toggle_label: str = "Display Heatmap",
                       *args, **kwargs
                       ):
    """Create a new instance of "heatmap_visualizer".

    Parameters
    ----------
    images: np.ndarray of shape (height, width, 3) or (num_frames, height, width, 3)
        The image to display.
    masks: np.ndarray of shape (height, width) or (num_frames, height, width)
        The mask to overlay on the image.
    colormap: int
        The OpenCV colormap to use when overlaying the mask.
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    int
    """
    if len(images.shape) == 3:
        images = images[None, :]
    num_frames, height, width, _ = images.shape

    if isinstance(masks, np.ndarray):
        if len(masks.shape) == 2:
            masks = masks[None, :]
        heatmaps = np.zeros((num_frames, height, width, 3), dtype=np.uint8)
        for idx, mask in enumerate(masks):
            mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-6)
            heatmap = cv2.applyColorMap(np.uint8(255 * mask), colormap)
            heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
            heatmaps[idx] = heatmap
    else:
        heatmaps = []

    return overlay(images=images, masks=heatmaps, key=key, toggle_label=toggle_label, *args, **kwargs)
