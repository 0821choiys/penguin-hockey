const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1000,height:520}});
const p=await b.newPage();await p.goto('file://'+process.argv[2]);await p.screenshot({path:process.argv[3]});await b.close();})();
