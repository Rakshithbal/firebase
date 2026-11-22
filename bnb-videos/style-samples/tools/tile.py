# tile.py out.png a.png b.png ...  -> tiles side by side at 1/3 scale (rows of up to 6)
import sys
from PIL import Image
fs = sys.argv[2:]; ims = [Image.open(f).convert('RGB').resize((360, 640)) for f in fs]
cols = min(6, len(ims)); rows = (len(ims) + cols - 1) // cols
W = Image.new('RGB', (cols * 364, rows * 644), (40, 40, 40))
for i, im in enumerate(ims): W.paste(im, ((i % cols) * 364 + 2, (i // cols) * 644 + 2))
W.save(sys.argv[1])
