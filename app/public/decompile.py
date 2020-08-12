from fontTools.ttLib import TTFont
import sys
from fontFeatures.ttLib import unparse
from fontFeatures.optimizer import Optimizer

ff = unparse(TTFont(sys.argv[1]))
Optimizer(ff).optimize(level=1)
print(ff.asFea())
