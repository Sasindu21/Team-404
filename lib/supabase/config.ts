export function isAuthConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);}
export function getSupabaseConfig(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error("Supabase authentication is not configured.");return {url,key};}
export function safeRedirect(value:FormDataEntryValue|null|undefined,fallback="/dashboard"){const path=typeof value==="string"?value:"";return path.startsWith("/")&&!path.startsWith("//")&&!path.includes("\\")?path:fallback;}
