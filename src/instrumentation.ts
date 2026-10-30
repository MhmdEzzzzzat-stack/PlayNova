export async function onRequestError(error:unknown,request:Request,context:{routePath?:string;routeType?:string;renderSource?:string}) {
 const name=error instanceof Error?error.name:"UnknownError";
 let path="/";try{path=new URL(request.url).pathname.slice(0,180);}catch{}
 console.error("PlayNova server request error",JSON.stringify({name,method:request.method,path,route:context.routePath||"",routeType:context.routeType||"",renderSource:context.renderSource||""}));
}
