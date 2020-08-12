from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.ttLib import TTFont
import sys


font = TTFont(sys.argv[1])
destination = sys.argv[2]
print(f'Writing on {destination}')

while True:
  length = int(sys.stdin.buffer.readline().decode("utf-8"))
  print(f'Reading {length} bytes')
  feature = sys.stdin.buffer.read(length).decode("utf-8")
  print(f'Read |{feature}|')
  try:
    addOpenTypeFeaturesFromString(font, feature)
    font.save(destination)
    print("OK")
  except Exception as e:
    print(f'{e}')
