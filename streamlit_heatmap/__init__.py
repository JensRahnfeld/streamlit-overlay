import os
from typing import Union

import cv2
import numpy as np
import streamlit.components.v1 as components


_RELEASE = False

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
        "heatmap_visualizer",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend", "build")
    _component_func = components.declare_component("heatmap_visualizer", path=build_dir)


def heatmap_visualizer(images: np.ndarray,
                       masks: Union[np.ndarray, None] = None,
                       colormap: int = cv2.COLORMAP_JET,
                       alpha: float = 0.5,
                       key: str = None):
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
    num_frames, height, width, num_channels = images.shape

    if masks is None:
        mask = np.zeros((height, width), dtype=np.uint8)
        heatmap = cv2.applyColorMap(np.uint8(255 * mask), colormap)
        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        heatmaps = np.repeat(heatmap[None, :], repeats=num_frames, axis=0)
    else:
        if len(masks.shape) == 2:
            masks = masks[None, :]
        heatmaps = np.zeros((num_frames, height, width, 3), dtype=np.uint8)
        for idx, mask in enumerate(masks):
            mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-6)
            heatmap = cv2.applyColorMap(np.uint8(255 * mask), colormap)
            heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
            heatmaps[idx] = heatmap

    # rgb -> rgba
    if num_channels == 3:
        images = np.concatenate([images, np.ones((num_frames, height, width, 1), dtype=np.uint8) * 255], axis=-1)
    heatmaps = np.concatenate([heatmaps, np.ones((num_frames, height, width, 1), dtype=np.uint8) * 255], axis=-1)

    component_value = _component_func(images=images.tobytes(),
                                      heatmaps=heatmaps.tobytes(),
                                      width=width,
                                      height=height,
                                      numFrames=num_frames,
                                      alpha=alpha,
                                      key=key,
                                      default=0)

    return component_value
