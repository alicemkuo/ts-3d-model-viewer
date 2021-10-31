# stl-thumb

[![Build Status](https://travis-ci.com/unlimitedbacon/stl-thumb.svg?branch=master)](https://travis-ci.org/unlimitedbacon/stl-thumb)
[![Build Status](https://ci.appveyor.com/api/projects/status/exol1llladgo3f98/branch/master?svg=true)](https://ci.appveyor.com/project/unlimitedbacon/stl-thumb/branch/master)

Stl-thumb is a fast lightweight thumbnail generator for STL files. It can show previews for STL files in your file manager on Linux and Windows. It is written in Rust and uses OpenGL.

![Screenshot](https://user-images.githubusercontent.com/3131268/116009182-f3f89c80-a5cc-11eb-817d-91e8a9fad279.png)

## Installation

### Windows

Stl-thumb requires 64 bit Windows 7 or later. [Download the installer .exe](https://github.com/unlimitedbacon/stl-thumb/releases/latest) for the latest release and run it.

The installer will tell the Windows shell to refresh the thumbnail cache, however this does not always seem to work. If your icons do not change then try using the [Disk Cleanup](https://en.wikipedia.org/wiki/Disk_Cleanup) utility to clear the thumbnail cache.

### Linux

Stl-thumb works with Gnome and most other similar desktop environements. If you are using the KDE desktop environment then you will also need to install the seperate [`stl-thumb-kde`](https://github.com/unlimitedbacon/stl-thumb-kde) package.

Make sure that your file manager is set to generate previews for files larger than 1 MB. Most file managers have this setting under the Preview tab in their Preferences.

#### Arch

A package is available [in the AUR](https://aur.archlinux.org/packages/stl-thumb/). Install it manually or using your favorite AUR helper.

```
$ yay -S stl-thumb
```

#### Debian / Ubuntu

[Download the .deb package](https://github.com/unlimitedbacon/stl-thumb/releases/latest) for your platform (usually amd64) and install it. Packages are also available for armhf (Raspberry Pi) and arm64 (Pine64 and other SBCs).

```
$ sudo apt install ./stl-thumb_0.4.0_amd64.deb
```

## Building

Building the tool itself:
```
$ cargo build
```
Building the .deb-package:
```
$ cargo install cargo-deb #this is an additional dependency
$ cargo deb
```
## Command Line Usage

```
$ stl-thumb <STL_FILE> [IMG_FILE]
```

### Options

| Option        | Description                                             |
| ------------- | ------------------------------------------------------- |
| <STL_FILE>    | The STL file you want a picture of.                     |
| [IMG_FILE]    | The thumbnail image file that will be created. If this is omitted, the image data will be dumped to stdout. |
| -s, --size \<size\>   | Specify width of the image. It will always be a square. |
| -f, --format \<format\> | The format of the image file. If not specified it will be determined from the file extension, or default to PNG if there is no extension. Supported formats: PNG, JPEG, GIF, ICO, BMP |
| -m, --material \<ambient\> \<diffuse\> \<specular\> | Colors for rendering the mesh using the Phong reflection model. Requires 3 colors as rgb hex values: ambient, diffuse, and specular. Defaults to blue. |
| -b, --backround \<color> | The background color with transparency (rgba). Default is ffffff00. |
| -x            | Display the image in a window instead of saving a file. |
| -h, --help    | Prints help information.                                |
| -V, --version | Prints version information.                             |
| -v[v][v]      | Increase message verbosity. Levels: Errors, Warnings, Info, Debugging |
