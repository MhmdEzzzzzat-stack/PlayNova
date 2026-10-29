export type AssetKind="thumbnail"|"screenshot"|"html5_package";
export type AssetInspection={extension:string;contentType:string;expandedBytes:number;entries:number};
const imageTypes:Record<string,{mime:string;ext:string}>={ "image/jpeg":{mime:"image/jpeg",ext:"jpg"},"image/png":{mime:"image/png",ext:"png"},"image/webp":{mime:"image/webp",ext:"webp"} };
function u16(v:DataView,o:number){return v.getUint16(o,true);}
function u32(v:DataView,o:number){return v.getUint32(o,true);}
export function inspectAsset(bytes:Uint8Array,kind:AssetKind,declaredType:string):AssetInspection{
 if(!bytes.length)throw new Error("الملف فارغ.");
 if(kind==="thumbnail"||kind==="screenshot"){
  if(bytes.length>8*1024*1024)throw new Error("الحد الأقصى للصورة 8 ميجابايت.");
  const type=declaredType.toLowerCase(),allowed=imageTypes[type];if(!allowed)throw new Error("الصيغ المدعومة للصور: JPG وPNG وWebP فقط.");
  const b=bytes;
  const valid=type==="image/jpeg"?b[0]===0xff&&b[1]===0xd8&&b[2]===0xff:
   type==="image/png"?b.length>=8&&b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47&&b[4]===0x0d&&b[5]===0x0a&&b[6]===0x1a&&b[7]===0x0a:
   b.length>=12&&String.fromCharCode(...b.slice(0,4))==="RIFF"&&String.fromCharCode(...b.slice(8,12))==="WEBP";
  if(!valid)throw new Error("محتوى الصورة لا يطابق نوع الملف المعلن.");
  return {extension:allowed.ext,contentType:allowed.mime,expandedBytes:bytes.length,entries:1};
 }
 if(kind!=="html5_package")throw new Error("نوع الملف غير مدعوم.");
 if(bytes.length>50*1024*1024)throw new Error("الحد الأقصى لحزمة اللعبة المضغوطة 50 ميجابايت.");
 if(declaredType!=="application/zip"&&declaredType!=="application/x-zip-compressed"&&declaredType!=="")throw new Error("حزم الألعاب يجب أن تكون ZIP.");
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const min=Math.max(0,bytes.length-65557);let eocd=-1;
 for(let i=bytes.length-22;i>=min;i--){if(u32(view,i)===0x06054b50){eocd=i;break;}}
 if(eocd<0||eocd+22>bytes.length)throw new Error("ملف ZIP تالف أو لا يحتوي على نهاية صحيحة.");
 if(u16(view,eocd+4)!==0||u16(view,eocd+6)!==0)throw new Error("أرشيف ZIP متعدد الأقراص غير مدعوم.");
 const entries=u16(view,eocd+10),centralSize=u32(view,eocd+12),centralOffset=u32(view,eocd+16),comment=u16(view,eocd+20);
 if(entries===0||entries>500||eocd+22+comment>bytes.length||centralOffset+centralSize>eocd)throw new Error("بنية الأرشيف غير صالحة أو عدد الملفات يتجاوز 500.");
 let cursor=centralOffset,expanded=0,hasIndex=false;const seen=new Set<string>();
 for(let n=0;n<entries;n++){
  if(cursor+46>bytes.length||u32(view,cursor)!==0x02014b50)throw new Error("دليل ZIP المركزي غير صالح.");
  const flags=u16(view,cursor+8),method=u16(view,cursor+10),compressed=u32(view,cursor+20),uncompressed=u32(view,cursor+24),nameLen=u16(view,cursor+28),extraLen=u16(view,cursor+30),commentLen=u16(view,cursor+32),external=u32(view,cursor+38);
  if(flags&1)throw new Error("الأرشيفات المشفرة بكلمة مرور غير مدعومة.");
  if(method!==0&&method!==8)throw new Error("طريقة ضغط ZIP غير مدعومة.");
  const end=cursor+46+nameLen+extraLen+commentLen;if(end>bytes.length)throw new Error("اسم أو بيانات ملف ZIP مقطوعة.");
  const name=new TextDecoder("utf-8",{fatal:true}).decode(bytes.slice(cursor+46,cursor+46+nameLen));
  if(!name||name.includes("\0")||name.includes("\\")||name.startsWith("/")||/^[a-zA-Z]:/.test(name)||name.split("/").some(p=>p===".."||p==="."))throw new Error("مسار خطر داخل الأرشيف.");
  const normalized=name.replace(/\/$/,"");if(seen.has(normalized))throw new Error("الأرشيف يحتوي على مسارات مكررة.");seen.add(normalized);
  const unixMode=external>>>16;if(((unixMode&0xf000)===0xa000))throw new Error("روابط ZIP الرمزية غير مسموحة.");
  const isDir=name.endsWith("/");if(!isDir){expanded+=uncompressed;if(uncompressed>100*1024*1024||expanded>150*1024*1024)throw new Error("الحجم بعد فك الضغط يتجاوز الحد المسموح.");if(compressed===0&&uncompressed>0||compressed>0&&uncompressed/compressed>100)throw new Error("نسبة ضغط غير طبيعية في الأرشيف.");if(normalized.toLowerCase()==="index.html")hasIndex=true;}
  cursor=end;
 }
 if(cursor>centralOffset+centralSize||!hasIndex)throw new Error("يجب أن تحتوي الحزمة على index.html في المجلد الرئيسي.");
 return {extension:"zip",contentType:"application/zip",expandedBytes:expanded,entries};
}

export function canUploadPackage(role:string){return role==="owner"||role==="administrator";}
export function validateProviderUrl(value:string,allowedDomains:string[]):string|null{
 try{const url=new URL(value);if(url.protocol!=="https:"||url.username||url.password||url.port&&url.port!=="443")return null;const host=url.hostname.toLowerCase().replace(/\.$/,"");return allowedDomains.some(d=>host===d.toLowerCase().replace(/\.$/,""))?url.origin:null;}catch{return null;}
}
