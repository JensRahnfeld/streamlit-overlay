<div align="center">
    <h2>
        Streamlit-Overlay 🖼️🖌️
    </h2>
    <p><b>👌 Simplify adding overlays to images in Streamlit </b></p>
    <img src="assets\streamlit-overlay.gif">
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
