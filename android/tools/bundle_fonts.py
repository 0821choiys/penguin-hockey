#!/usr/bin/env python3
"""Build the Android app's copy of the game (app/src/main/assets/index.html) with NO Google Fonts requests.

Only the app copy changes; penguin-hockey-improved.html (the web build) keeps its Google Fonts links.

- Fredoka (500, 700) and Jua (400) -> fonts/fonts.css (Korean and Latin titles).
- M PLUS Rounded 1c (500, 700, 800) -> fonts/mplus.css (Japanese).  Noto Sans SC (500, 700, 900) -> fonts/notosc.css (Chinese).
- All faces are the fontsource WOFF2 files, the same subsets Google serves; the app works fully offline.
- Every googleapis.com font URL is replaced; the script fails if one is left.

usage: python3 bundle_fonts.py <game.html> <fontsource-dir> <assets-dir>
"""
import os
import re
import shutil
import sys

# output stylesheet -> [(fontsource package, css file in that package)]
GROUPS = {
    "fonts.css": [("fredoka", "500"), ("fredoka", "700"), ("jua", "index")],
    "mplus.css": [("m-plus-rounded-1c", "500"), ("m-plus-rounded-1c", "700"), ("m-plus-rounded-1c", "800")],
    "notosc.css": [("noto-sans-sc", "500"), ("noto-sans-sc", "700"), ("noto-sans-sc", "900")],
}


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    game, fs_dir, out = sys.argv[1], sys.argv[2], sys.argv[3]
    html = open(game, encoding="utf-8").read()
    fonts_out = os.path.join(out, "fonts")
    files_out = os.path.join(fonts_out, "files")
    if os.path.isdir(fonts_out):
        shutil.rmtree(fonts_out)
    os.makedirs(files_out)

    for out_css, members in GROUPS.items():
        css_parts = []
        for pkg, name in members:
            src_css = os.path.join(fs_dir, pkg, name + ".css")
            css = open(src_css, encoding="utf-8").read()
            # keep only the woff2 sources (every current browser and Android WebView reads them)
            css = re.sub(r"src:\s*url\(\./files/([^)]+?\.woff2)\)\s*format\('woff2'\)[^;]*;",
                         lambda m: "src:url(files/%s) format('woff2');" % m.group(1), css)
            if "./files/" in css:
                sys.exit("unexpected font url in " + src_css)
            for f in re.findall(r"url\(files/([^)]+)\)", css):
                shutil.copy(os.path.join(fs_dir, pkg, "files", f), os.path.join(files_out, f))
            css_parts.append(css)
        open(os.path.join(fonts_out, out_css), "w", encoding="utf-8").write("\n".join(css_parts))

    # 1) the stylesheet link in <head>: Fredoka + Jua
    head_link = re.compile(r'<link href="https://fonts\.googleapis\.com/css2\?family=Fredoka[^"]*"[^>]*>')
    html, n1 = head_link.subn('<link rel="stylesheet" href="fonts/fonts.css">', html)
    # 2) the Japanese / Chinese stylesheets, created by i18n.js (M PLUS first, Noto Sans SC second)
    cjk = {"M+PLUS+Rounded+1c": "fonts/mplus.css", "Noto+Sans+SC": "fonts/notosc.css"}
    html, n2 = re.subn(r"'https://fonts\.googleapis\.com/css2\?family=(M\+PLUS\+Rounded\+1c|Noto\+Sans\+SC)[^']*'",
                       lambda m: "'" + cjk[m.group(1)] + "'", html)
    if n1 != 1 or n2 != 2:
        sys.exit("font links not found as expected (head=%d, cjk=%d)" % (n1, n2))
    if re.search(r"fonts\.googleapis|gstatic", html):   # (identitytoolkit / securetoken .googleapis.com are the sign-in API, not fonts)
        sys.exit("a Google font URL is still in the app build")
    open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(html)
    print("app build: fonts bundled (%d files), no Google font URLs" % len(os.listdir(files_out)))


if __name__ == "__main__":
    main()
