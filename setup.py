from pathlib import Path

import setuptools

this_directory = Path(__file__).parent

with open(Path(this_directory) / "README.md", encoding="utf-8") as f:
    long_description = f.read()

setuptools.setup(
    name="streamlit-overlay",
    version="0.0.1",
    author="Jens Rahnfeld",
    author_email="",
    description="Streamlit component that allows you add overlays to images",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    python_requires=">=3.8",
    install_requires=[
        "opencv-python>=4.6.0.66",
        "streamlit>=1.22.0",
    ],
)
