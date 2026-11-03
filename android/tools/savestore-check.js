// Runs the document-start restore script SaveStore produced (written by SaveStoreTest) against fake localStorage.
const {save,js}=require('../app/build/savestore-script.js');let ok=0,bad=0;const t=(c,m)=>{c?ok++:bad++;console.log((c?'PASS ':'FAIL ')+m);};
const run=init=>{const st=Object.assign({},init);global.localStorage={getItem:k=>k in st?st[k]:null,setItem:(k,v)=>{st[k]=String(v);}};(0,eval)(js);return st;};
let st=run({});t(st['penguinHockey.v1']===save&&JSON.parse(st['penguinHockey.v1']).v===10,'empty storage (reinstall / new phone): the save is restored exactly');
t(st['penguinHockey.lang']==='ja','the language is restored');
st=run({'penguinHockey.v1':'{"v":10,"mine":1}','penguinHockey.lang':'ko'});t(st['penguinHockey.v1']==='{"v":10,"mine":1}'&&st['penguinHockey.lang']==='ko','an existing save in the page is never overwritten');
console.log('TOTAL: '+ok+' passed, '+bad+' failed');process.exit(bad?1:0);
