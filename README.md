# CloudNV - [Homework]

>Emery Cho, Alyssa Keimach, Vu Vuong, Anders Sajbel

## Purpose

CloudNV acquires an image of a cloud, identifies the type of cloud and provides a short description on said cloud.

## Deployed Site
[CloudNV](http://alyssakeimach.com/cloudnv/)

## How To Use

Simply either drag and drop an image, use the file explorer and select an image or enter an image link URL. The process should run automatically at that point and return the description at the bottom of the app. 

## How It Works

After submitting something, it is first verified as an image. If it is over 4MB we send it to Imgur to store it for the Vision API to examine. Then it is sent to the Google Cloud Vision API. This analyzes the image and returns related tags. These tags first determine whether the image falls under clouds or not. They are then cross referenced with our hard coded cloud arrays. Depending on what tags match, the key words are then sent to the Wikipedia API where it then retrieves the summary section to append to the page for the user to read.

## APIs Used
1. Imgur API
2. Google Vision API
3. Wikipedia Search API
4. Wikipedia Parse API

## Libraries Used
1. jQuery
2. Bootstrap
3. Load-Image https://github.com/blueimp/JavaScript-Load-Image
