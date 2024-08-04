<div align="center">
    <h2>
        Streamlit-Overlay 🖼️🖌️
    </h2>
    <b>👌 Simplify adding overlays to images in Streamlit </b>
</div>

<img src="assets\streamlit-overlay.gif">

## Installation

```
pip install streamlit-overlay
```

## Quick Start

```python
from streamlit_overlay import overlay

images = ... # np.narray of shape (#frames, height, width, 3)
masks = ... # np.array of shape (#frames, height, width, 3)
overlay(images, masks)
```
