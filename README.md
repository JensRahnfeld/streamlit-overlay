<div align="center">
    <h2>
        Streamlit-Overlay 🖼️🖌️
    </h2>
    <p><b>👌 Simplify adding overlays to images in Streamlit </b></p>
    <img src="https://github.com/JensRahnfeld/streamlit-overlay/blob/main/assets/streamlit-overlay.gif">
</div>

## Installation

```
pip install streamlit-overlay
```

## Quick Start

In your `app.py` insert the following lines of code.

```python
from streamlit_overlay import overlay

images = ... # np.narray of shape (#frames, height, width, 3)
masks = ... # np.array of shape (#frames, height, width, 3)
overlay(images, masks, key="example_overlay")
```

Running your app via

```
streamlit run app.py
```

will then render a customizable video demo.

## API

### `streamlit_overlay.overlay(images, masks=[], alpha=0.5, key=None, toggle_label="Display Overlay", fps=30, autoplay=False)`

Creates an instance of the "overlay" component for use in a Streamlit app. It allows for the overlaying of masks on images, with customizable options for transparency, display controls, and playback settings.

<b>Parameters</b>

- `images`: np.ndarray or List[Image]

  The images to display. This can be a single image or a sequence of images (for video). The shape should be (height, width, 3) for a single image or (num_frames, height, width, 3) for a sequence.

- `masks`: np.ndarray or List[Image], optional

  The masks to overlay on the images. This should match the shape of the images parameter. If not provided, the function will only display the images.

- `alpha`: float, optional

  The transparency level for the mask overlay. A value of 0 means the mask is fully transparent, while 1 means it is fully opaque.

- `key`: str or None, optional

  An optional key that uniquely identifies this component. If this is
  None, and the component's arguments are changed, the component will
  be re-mounted in the Streamlit frontend and lose its current state.

- `toggle_label`: str, optional

  The label for the toggle button that controls the visibility of the overlay.

- `fps`: int, optional
  Frames per second for displaying a video.

- `autoplay`: bool, optional

  Whether to automatically start playing the video upon loading. This setting is only relevant if images and masks represent a sequence of frames.

### `streamlit_overlay.heatmap_overlay(images, masks, colormap=cv2.COLORMAP_JET, toggle_label="Display Heatmap", *args, **kwargs)`

Creates an instance of the "heatmap_overlay" component for overlaying heatmaps, e.g. of attribution maps, over images within a Streamlit app. This component processes the provided masks by applying a colormap, enhancing the visualization of data overlays.

- `images`: np.ndarray or List[Image]

  The images to display. This can be a single image or a sequence of images (for video). The shape should be (height, width, 3) for a single image or (num_frames, height, width, 3) for a sequence.

- `masks`: np.ndarray or List[Image], optional

  The masks to overlay on the images. The shape should be (height, width) for a single mask or (num_frames, height, width) for a sequence. These masks will be processed using the specified colormap.

- `colormap`: int, optional

  The OpenCV colormap identifier to use for applying color to the masks. This allows for a more vivid and informative visualization of the mask data.

- `toggle_label`: str, optional

  The label for the toggle button that controls the visibility of the overlay.
