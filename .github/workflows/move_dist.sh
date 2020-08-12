#!/bin/bash

mkdir dist-linux dist-mac dist-win > /dev/null 2>&1

mv dist/latest-linux.yml dist/*.AppImage dist/*.tar.gz dist/*.snap dist-linux > /dev/null 2>&1
mv dist/latest-mac.yml dist/*.dmg dist/*.dmg.blockmap dist-mac > /dev/null 2>&1
mv dist/latest.yml dist/*.exe dist/*.exe.blockmap dist-win > /dev/null 2>&1

exit 0