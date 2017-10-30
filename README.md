# cloudnv

Purpose

This app is designed to acquire an image of a cloud, identify the type of cloud and provide a short description on said cloud.

How To Use

Simply either drag and drop an image, use the file explorer and select an image or enter an image link URL. The process should run automatically at that point and return the description at the bottom of the app. 

How It Works

After submitting something, it is first verified as an image. Then it is sent to the Google Cloud Vision API. This analyzes the image and returns related tags. These tags first determine of the image falls under clouds or not. They are then cross referenced with our hard coded cloud arrays. Depending on what tags match, the key words are then sent to the Wikipedia API where it then retrieves the summary section to append to the page for the user to read.