# v20: three.js r128 (MIT, vendor/three.r128.min.js = npm three@0.128.0 build/three.min.js) goes inside the file, so the game
# no longer downloads it from a CDN. The loader already returns at once when window.THREE exists; its CDN fallbacks stay
# as dead code for a build without the inline copy. Runs after v16 (the i18n pass expects exactly the loader + game scripts).
_three=rd('vendor/three.r128.min.js')
assert '</script' not in _three and 'const e="128"' in _three and 'Three.js Authors' in _three
R("<script>\nwindow.__loadThree=function(cb){", "<script>/* three.js r128 — bundled (MIT license, Copyright 2010-2021 Three.js Authors) */\n"+_three+"</script>\n<script>\nwindow.__loadThree=function(cb){")
_size=len(s.encode('utf-8'))
assert _size<=2*1024*1024, 'over the 2 MB budget: %d bytes'%_size
print('size: %d bytes (%.2f MB of the 2 MB budget)'%(_size,_size/1048576))
