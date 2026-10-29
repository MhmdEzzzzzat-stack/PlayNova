import test from "node:test";
import assert from "node:assert/strict";
import {inspectAsset,canUploadPackage,validateProviderUrl} from "../src/lib/asset-validation.ts";
function zip(names:string[]){
 const locals:Uint8Array[]=[],centrals:Uint8Array[]=[];let offset=0;
 for(const name of names){const n=new TextEncoder().encode(name),local=new Uint8Array(30+n.length),lv=new DataView(local.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(8,0,true);lv.setUint32(18,0,true);lv.setUint32(22,0,true);lv.setUint16(26,n.length,true);local.set(n,30);locals.push(local);
 const central=new Uint8Array(46+n.length),cv=new DataView(central.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,0x0314,true);cv.setUint16(6,20,true);cv.setUint16(10,0,true);cv.setUint32(20,0,true);cv.setUint32(24,0,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);central.set(n,46);centrals.push(central);offset+=local.length;}
 const cd=centrals.reduce((n,x)=>n+x.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,names.length,true);v.setUint16(10,names.length,true);v.setUint32(12,cd,true);v.setUint32(16,offset,true);
 const all=[...locals,...centrals,end],result=new Uint8Array(all.reduce((n,x)=>n+x.length,0));let p=0;for(const part of all){result.set(part,p);p+=part.length;}return result;
}
test("rejects malformed image bytes",()=>assert.throws(()=>inspectAsset(new Uint8Array([1,2,3]),"thumbnail","image/png")));
test("rejects oversized images",()=>assert.throws(()=>inspectAsset(new Uint8Array(8*1024*1024+1),"thumbnail","image/png"),/8/));
test("rejects image MIME mismatch",()=>assert.throws(()=>inspectAsset(new Uint8Array([0xff,0xd8,0xff]),"thumbnail","image/png")));
test("accepts a ZIP with root index.html",()=>assert.equal(inspectAsset(zip(["index.html","game.js"]),"html5_package","application/zip").entries,2));
test("rejects malformed ZIP",()=>assert.throws(()=>inspectAsset(new Uint8Array([1,2,3]),"html5_package","application/zip")));
test("rejects ZIP without root entry point",()=>assert.throws(()=>inspectAsset(zip(["src/index.html"]),"html5_package","application/zip"),/index.html/));
test("rejects unsafe ZIP traversal paths",()=>assert.throws(()=>inspectAsset(zip(["index.html","../escape.js"]),"html5_package","application/zip"),/مسار خطر/));
test("rejects unsupported ZIP content type",()=>assert.throws(()=>inspectAsset(zip(["index.html"]),"html5_package","application/x-msdownload")));
test("only owner and administrator can upload packages",()=>{assert.equal(canUploadPackage("owner"),true);assert.equal(canUploadPackage("administrator"),true);assert.equal(canUploadPackage("editor"),false);assert.equal(canUploadPackage("reviewer"),false);});
test("accepts exact HTTPS provider allowlist host",()=>assert.equal(validateProviderUrl("https://games.publisher.test/embed",["games.publisher.test"]),"https://games.publisher.test"));
test("rejects invalid schemes, credentials and unlisted hosts",()=>{assert.equal(validateProviderUrl("javascript:alert(1)",["publisher.test"]),null);assert.equal(validateProviderUrl("http://publisher.test",["publisher.test"]),null);assert.equal(validateProviderUrl("https://user:pass@publisher.test",["publisher.test"]),null);assert.equal(validateProviderUrl("https://evil.test",["publisher.test"]),null);});
