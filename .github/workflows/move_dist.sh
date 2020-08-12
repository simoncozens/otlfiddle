#!/bin/bash

find dist-linux dist-mac dist-win
mkdir dist-linux dist-mac dist-win

mv dist/latest-linux.yml dist/*.AppImage dist/*.tar.gz dist/*.snap dist-linux
mv dist/latest-mac.yml dist/*.dmg dist/*.dmg.blockmap dist-mac
mv dist/latest.yml dist/*.exe dist/*.exe.blockmap dist-win

exit 0
