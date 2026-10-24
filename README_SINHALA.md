# SafeRoute Sri Lanka — සිංහල Setup Guide

මෙය Hack for Humanity සඳහා සකස් කළ **Source Code Project** එකක්. UI එකේ ඇති ආපදා කලාප **කල්පිත Demo Data** පමණයි. ඇත්ත ගමන් / ආපදා තීරණ ගැනීමට භාවිත කරන්න එපා.

## Install කිරීම (Windows)

1. ZIP File එක Extract කරන්න.
2. `saferoute-srilanka` Folder එක VS Code එකෙන් Open කරන්න.
3. Node.js 20.9+ install වී තිබේද බලන්න: `node -v`.
4. පහසුම ක්‍රමය: `START_WINDOWS.bat` file එක Double Click කරන්න. (පළමු වතාවේ `npm install` සඳහා internet ඕනේ.)
5. නැත්නම් VS Code Terminal එකෙන්:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

6. Browser එකේ `http://localhost:3000` open කරන්න.

## AI Chatbot එක වැඩ කරවන්න

1. Google AI Studio වෙතින් ඔබට අවසර ඇති API key එකක් ලබාගන්න.
2. Project folder එකේ `.env.local` file එක open කරන්න.
3. මේක Update කරන්න:

```env
GEMINI_API_KEY=ඔබේ_නිවැරදි_API_KEY_එක
GEMINI_MODEL=gemini-2.5-flash
```

4. Server එක stop කරලා (`Ctrl+C`) `npm run dev` නැවත run කරන්න.
5. Website එකේ `AI safety assistant` කොටසේ **Gemini AI connected** පෙන්විය යුතුයි.

**API Key නැත්නම්:** Website එකේ AI feature එක සාමාන්‍ය predefined guidance mode එකේ පමණයි. Hackathon එකට Meaningful AI Integration පෙන්වන්න actual key එකක් අවශ්‍යයි.

## Map සහ Routes

- ස්ථාන dropdown වලින් තෝරන්න; නැත්නම් පින් button එක click කර Map එකෙන් location තෝරන්න.
- `Find possible routes` මඟින් OSRM public demo routing server එක භාවිත කරයි.
- OSRM unavailable නම් `Use offline schematic example` ON කරලා illustration එකක් පෙන්වන්න; **මේ රේඛා සැබෑ මාර්ග නෙමෙයි**.
- Red/Orange circles සියල්ල **fictional demonstration hazards**.
- `ORS_API_KEY` optional; valid key එකක් දුන්නොත් sample polygons avoid කරන candidate route එකක් සෙවීමට උත්සාහ කරයි.

## අනතුරු ඇඟවීම්

- `Official weather bulletins` button එකෙන් official RSS feed එක refresh කරනවා.
- Feed එක unavailable නම් එහෙම පෙන්වනවා; 'safe' කියලා නොකියයි.
- Official notices text list එකේ පමණයි. Live warning map coordinates ලෙස පෙන්වන්නේ නැහැ.
- Emergency තත්ත්වයකදී Department of Meteorology, DMC වැනි නිල ආයතනවල උපදෙස් අනුගමනය කරන්න.

## Submission Checklist

- Code එක තේරුම් ගන්න / ඔබේ Team එකෙන් customise කරන්න.
- Official Hackathon coding window එකේ core development කරන්න යන Rule එක අනුගමනය කරන්න.
- `npm run test`, `npm run lint`, `npm run build` test කරන්න.
- Public GitHub repo, README, MIT LICENSE සූදානම් කරන්න.
- Vercel environment variables සකස් කර deploy කරන්න.
- AI assisted code භාවිතය declare කරන්න.

වැඩි විස්තර සඳහා `README.md` සහ `PROJECT_SUBMISSION.md` කියවන්න.
